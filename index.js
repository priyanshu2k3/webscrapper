const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// Base URL of the page to scrape
const baseUrl = 'https://www.1mg.com/drugs-all-medicines?page=';

async function scrapeAllPages() {
  let page = 1;
  let hasMorePages = true;
  
  // Clear the file before writing
  fs.writeFileSync('products.txt', '', 'utf-8');
  fs.writeFileSync('html', '', 'utf-8'); // Clear the HTML file as well

  while (hasMorePages) {
    try {
      // Construct the paginated URL
      const url = `${baseUrl}${page}`;
      console.log(`Scraping page ${page}...`);
      
      // Fetch the HTML of the page
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      // Write the entire HTML to the 'html' file
      fs.appendFileSync('html', data + '\n\n', 'utf-8');
      console.log(`HTML of page ${page} written to file.`);

      // Extract JSON data containing medicine names
      let pageHasProducts = false;
      const productNames = [];

      $('script[type="application/ld+json"]').each((index, element) => {
        try {
          const jsonData = JSON.parse($(element).html());
          if (jsonData.itemListElement) {
            jsonData.itemListElement.forEach(item => {
              if (item.name) {
                productNames.push(item.name);
                pageHasProducts = true;
              }
            });
          }
        } catch (err) {
          console.error('Error parsing JSON:', err);
        }
      });
      
      // Write product names to file before proceeding to the next page
      if (productNames.length > 0) {
        fs.appendFileSync('products.txt', productNames.join('\n') + '\n', 'utf-8');
        console.log(`Page ${page} products written to file.`);
      }
      
      // Stop if no products found on the current page
      if (!pageHasProducts) {
        hasMorePages = false;
      }
      
      page++;
    } catch (error) {
      console.error(`Error scraping page ${page}:`, error);
      hasMorePages = false;
    }
  }
  console.log('Scraping complete.');
}

// Run the scraper
scrapeAllPages();
