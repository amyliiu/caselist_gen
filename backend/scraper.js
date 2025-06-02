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

async function findMatchingSchool(page, targetSchool) {
  const content = await page.content();
  const $ = cheerio.load(content);
  
  // Find all school links within the div
  const schoolLinks = $('div._schools_14mwn_50 a');
  
  console.log("Looking for school:", targetSchool);
  console.log("Found school links:", schoolLinks.length);
  
  // Look for a school name that matches or is similar to the target school
  let bestMatch = null;
  let bestMatchScore = 0;
  
  schoolLinks.each((i, elem) => {
    const schoolName = $(elem).text().trim();
    // Remove the state code in parentheses if it exists
    const cleanSchoolName = schoolName.replace(/\s*\([^)]*\)/, '');
    
    console.log("Checking school:", cleanSchoolName);
    
    // Try different variations of the school name
    const variations = [
      cleanSchoolName.toLowerCase(),
      cleanSchoolName.toLowerCase().replace(/^the\s+/i, ''), // Remove "The" prefix
      cleanSchoolName.toLowerCase().replace(/\s+/g, '') // Remove all spaces
    ];
    
    const targetVariations = [
      targetSchool.toLowerCase(),
      targetSchool.toLowerCase().replace(/^the\s+/i, ''),
      targetSchool.toLowerCase().replace(/\s+/g, '')
    ];
    
    // Check each variation
    for (const variation of variations) {
      for (const targetVar of targetVariations) {
        if (variation === targetVar) {
          bestMatch = cleanSchoolName;
          bestMatchScore = 1;
          return false; // break the loop
        }
        
        const similarity = calculateSimilarity(variation, targetVar);
        if (similarity > bestMatchScore) {
          bestMatchScore = similarity;
          bestMatch = cleanSchoolName;
        }
      }
    }
  });
  
  console.log("Best match found:", bestMatch, "with score:", bestMatchScore);
  
  // Only return a match if the similarity is high enough
  if (bestMatchScore < 0.7) {
    console.log("No good match found for:", targetSchool);
    return null;
  }
  
  return bestMatch;
}

function calculateSimilarity(str1, str2) {
  // Simple Levenshtein distance implementation
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j] + 1
        );
      }
    }
  }
  
  // Convert distance to similarity score (0 to 1)
  const maxLength = Math.max(m, n);
  return 1 - (dp[m][n] / maxLength);
}

async function scrapeData(team, school) {
  try {
    const schoolName = school;
    const teamName = getTeamInitials(team);

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Load cookies from the file
    const cookiesPath = path.join(__dirname, 'cookies.json');
    if (fs.existsSync(cookiesPath)) {
      const cookies = JSON.parse(fs.readFileSync(cookiesPath));
      await page.setCookie(...cookies);
    }

    // First, go to the main page to find the correct school name
    await page.goto('https://opencaselist.com/hspolicy24', { waitUntil: 'networkidle2' });
    const matchingSchool = await findMatchingSchool(page, schoolName);
    
    if (!matchingSchool) {
      console.log(`No matching school found for: ${schoolName}`);
      await browser.close();
      return null;
    }

    // Now use the matching school name for the team URL
    const targetUrl = `https://opencaselist.com/hspolicy24/${encodeURIComponent(matchingSchool)}/${encodeURIComponent(teamName)}`;
    
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
        const newUrl = `https://opencaselist.com/hspolicy24/${encodeURIComponent(matchingSchool)}/${encodeURIComponent(switchedTeamName)}`;

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
            const secondUrl = `https://opencaselist.com/hspolicy24/${encodeURIComponent(matchingSchool)}/${encodeURIComponent(secondSwitchedTeamName)}`;

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
      school: matchingSchool,
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