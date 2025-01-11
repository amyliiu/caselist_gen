// backend/login.js
const puppeteer = require('puppeteer');

const login = async (username, password) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to the OpenCaselist login page
  await page.goto('https://opencaselist.com');

  await page.type('input[name="username"]', username);
  await page.type('input[name="password"]', password);
  await page.click('button[type="submit"]'); 
  
  await page.waitForNavigation();

  const loginSuccess = await page.evaluate(() => {
    const successElement = document.querySelector('div._caselist_vpcne_5._policy_vpcne_37');
    return successElement !== null; 
  });

  return loginSuccess;
};

module.exports = login;