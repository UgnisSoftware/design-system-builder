const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');

(async() => {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080, isLandscape: false});
    await page.goto('http://localhost:3000', {waitUntil: 'networkidle'});
    await page.screenshot({path: 'full.png', fullPage: true});
    browser.close();

})();