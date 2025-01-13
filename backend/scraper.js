const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

function getTeamInitials(team) {
  const words = team.split(/[\s&]+/);
  const initials = words.map(word => word.substring(0, 2));
  return initials.join('');
}

function switchTeamName(team) {
  const words = team.split(/[\s&]+/);
  if (words.length < 2) return team;
  return words[1].substring(0, 2) + words[0].substring(0, 2);
}


async function scrapeData(team, school) {
  try {
    const schoolName = school;
    const teamName = getTeamInitials(team);

    const targetUrl = `https://opencaselist.com/hspolicy24/${encodeURIComponent(schoolName)}/${encodeURIComponent(teamName)}`;

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Load cookies from the file
    const cookiesPath = path.join(__dirname, 'cookies.json');
    if (fs.existsSync(cookiesPath)) {
      const cookies = JSON.parse(fs.readFileSync(cookiesPath));
      await page.setCookie(...cookies);
    }

    // Navigate to the target URL
    await page.goto(targetUrl, { waitUntil: 'networkidle2' });
    console.log("went to url:", targetUrl);

    // Get the page content
    const content = await page.content();
    const $ = cheerio.load(content);

    // Use the provided selector to find the table
    const table = '#root > div._wrapper_1rkra_1 > div._main_1rkra_6 > div > div._table_zi8y2_1 > table';
    
    // Find rows within the tbody of the table
    const rows = $(table).find('tbody tr').map(async (index, elem) => {
      const roundReport = $(elem).find('td').eq(5).find('div._report_t8v1y_12').text().trim();
   
      if (!roundReport) {
        const switchedTeamName = switchTeamName(teamName);
        const newUrl = `https://opencaselist.com/hspolicy24/${encodeURIComponent(schoolName)}/${encodeURIComponent(switchedTeamName)}`;

        try {
            await page.goto(newUrl, { waitUntil: 'networkidle2' }); // Ensure to wait for the page to load
            const newContent = await page.content();
            const new$ = cheerio.load(newContent);
            const newRoundReport = new$('table').find('tbody tr').map((index, elem) => {
                return new$(elem).find('td').eq(5).find('div._report_t8v1y_12').text().trim();
            }).get();

            // If the new round report is found, return it
            if (newRoundReport.length > 0) {
                return newRoundReport;
            } else {
                console.log(`No round report found for switched team: ${switchedTeamName}`);
                return null; // Return null if no report is found
            }
        } catch (error) {
            console.error(`Error navigating to ${newUrl}:`, error);
            // Attempt to switch the team name and test again
            const secondSwitchedTeamName = switchTeamName(switchedTeamName);
            const secondUrl = `https://opencaselist.com/hspolicy24/${encodeURIComponent(schoolName)}/${encodeURIComponent(secondSwitchedTeamName)}`;

            try {
                await page.goto(secondUrl, { waitUntil: 'networkidle2' });
                const secondContent = await page.content();
                const second$ = cheerio.load(secondContent);
                const secondRoundReport = second$('table').find('tbody tr').map((index, elem) => {
                    return second$(elem).find('td').eq(5).find('div._report_t8v1y_12').text().trim();
                }).get();

                if (secondRoundReport.length > 0) {
                    return secondRoundReport;
                } else {
                    console.log(`No round report found for team: ${secondSwitchedTeamName}`);
                    return null; // Return null if no report is found
                }
            } catch (secondError) {
                console.error(`Error navigating to ${secondUrl}:`, secondError);
                // Skip this team name if both attempts fail
                return null;
            }
        }
      }

      return roundReport; // Return the found roundReport if it exists
    }).get();

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