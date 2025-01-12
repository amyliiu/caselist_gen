const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function scrapeData(code, school) {
  try {
    const schoolName = school;
    const teamName = code.slice(schoolName.length + 1);
    // https://opencaselist.com/hspolicy24/Alpharetta/MiMa
    const url = `https://opencaselist.com/hspolicy24/${encodeURIComponent(schoolName)}/${encodeURIComponent(teamName)}`;
    console.log("went to url:", url);
    // still not logged in

    // Launch Puppeteer and navigate to the URL
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' }); // Wait for the network to be idle

    // Get the page content
    const content = await page.content();
    const $ = cheerio.load(content);

    // Use the provided selector to find the table
    const table = '#root > div._wrapper_1rkra_1 > div._main_1rkra_6 > div > div._table_zi8y2_1 > table';
    
    // Find rows within the tbody of the table
    const rows = $(table).find('tbody tr').map((index, elem) => {
      const roundReport = $(elem).find('td').eq(5).find('div._report_t8v1y_12').text().trim();
      return roundReport;
    }).get();

    console.log("Rows:", rows); // Log the extracted rows

    // const filteredRows = rows.filter(row => rows !== 'Round Report' && row !== '');

    const filteredRows = rows;

    const scrapedData = {
      school: schoolName,
      team: teamName,
      rounds: filteredRows
    };

    await browser.close(); // Close the browser
    return scrapedData;
  } catch (error) {
    console.error(`Error scraping data for ${schoolName} - ${teamName}:`, error);
    return null;
  }
}

module.exports = { scrapeData };