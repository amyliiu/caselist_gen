const puppeteer = require('puppeteer');
const XLSX = require('xlsx');

const scrapeTeams = async () => {
  // Process the spreadsheet to get the list of teams
  const teams = processSpreadsheet('path/to/spreadsheet.xlsx');

  // Launch the Puppeteer browser
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://opencaselist.com/hspolicy23', { waitUntil: 'networkidle2' });

  // Iterate through each team and scrape their 1AC
  const results = [];

  for (const teamName of teams) {
    try {
      // Wait for the school list to load (adjust the selector as needed)
      await page.waitForSelector('.school-link');

      // Click on the team’s school link
      await page.evaluate((teamName) => {
        const teamElement = [...document.querySelectorAll('.school-link')]
          .find(el => el.textContent.includes(teamName));
        if (teamElement) {
          teamElement.click();
        }
      }, teamName);

      // Wait for the team’s page to load and grab the 1AC content (adjust selectors as needed)
      await page.waitForSelector('.team-link');  // Update with correct selector
      await page.click('.team-link'); // Click team link if needed
      await page.waitForSelector('.content-1ac');  // Ensure the 1AC content loads

      // Extract 1AC content
      const oneACContent = await page.evaluate(() => {
        return document.querySelector('.content-1ac').innerText; // Update with actual selector
      });

      console.log(`1AC for ${teamName}:`, oneACContent);

      // Store the result
      results.push({ team: teamName, oneAC: oneACContent });
    } catch (error) {
      console.error(`Error scraping 1AC for ${teamName}:`, error);
    }
  }

  // After scraping all teams, close the browser
  await browser.close();

  // Save or process `results` array as needed
};

module.exports = { scrapeTeams };