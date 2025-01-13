// backend/login.js
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const login = async (username, password) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to the OpenCaselist login page
  await page.goto('https://opencaselist.com');

  // Fill in the login form
  await page.type('input[name="username"]', username);
  await page.type('input[name="password"]', password);
  await page.click('button[type="submit"]'); 
  
  await page.waitForNavigation();

  // Check for successful login
  const loginSuccess = await page.evaluate(() => {
    const successElement = document.querySelector('div._caselist_vpcne_5._policy_vpcne_37');
    return successElement !== null; 
  });

  if (loginSuccess) {
    // Save cookies to a file
    const cookies = await page.cookies();
    fs.writeFileSync(path.join(__dirname, 'cookies.json'), JSON.stringify(cookies));
  }

  await browser.close();
  return loginSuccess;
};

module.exports = login;