const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// URL of the page to scrape
const url = 'https://www.google.com/search?q=modulo+function+in+python';

async function fetchAndExtractIDs() {
  try {
    // Fetch the HTML of the page
    const { data } = await axios.get(url);

    // Save the HTML content to index.htm
    fs.writeFileSync('index.htm', data, 'utf-8');
    console.log('HTML content saved to index.htm');

    // Load the HTML into cheerio
    const $ = cheerio.load(data);

    // Extract all IDs from elements that have the 'id' attribute
    const ids = [];
    $('[id]').each((index, element) => {
      const id = $(element).attr('id');
      if (id) {
        ids.push(id); // Only push non-empty ids
      }
    });

    // Count occurrences of each ID
    const idCounts = ids.reduce((acc, id) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});

    // Format the output for writing to the ids file
    const idOutput = Object.entries(idCounts)
      .map(([id, count]) => `ID: ${id}, Count: ${count}`)
      .join('\n');

    // Save the IDs and their counts to the 'ids' file
    fs.writeFileSync('ids', idOutput, 'utf-8');
    console.log('ID count data saved to ids file');
    
  } catch (error) {
    console.error('Error fetching or processing the HTML:', error);
  }
}

// Run the function
fetchAndExtractIDs();
