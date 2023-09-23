const puppeteer = require('puppeteer');
const logger = require('./logger');

// Get colors from a given URL
async function getColorsFromPage(url) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });

    const colors = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const colorSet = new Set();

      elements.forEach((element) => {
        const styles = window.getComputedStyle(element);
        const colorPropertyNames = ['color', 'background-color', 'border-color'];

        colorPropertyNames.forEach((propertyName) => {
          const colorValue = styles.getPropertyValue(propertyName);
          if (colorValue && colorValue !== 'rgba(0, 0, 0, 0)' && colorValue !== 'transparent') {
            colorSet.add(colorValue);
          }
        });
      });

      return Array.from(colorSet);
    });

    await browser.close();

    return colors;
  } catch (error) {
    logger.error('Error getting colors from page:', error);
    throw new Error('Failed to fetch colors from the provided URL. Please check if the URL is valid and try again.');
  }
}

// Get fonts from a given URL
async function getFontsFromPage(url) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });

    const fonts = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const fontSet = new Set();

      elements.forEach((element) => {
        const styles = window.getComputedStyle(element);
        const fontFamilyValue = styles.getPropertyValue('font-family');

        if (fontFamilyValue) {
          const fontFamilies = fontFamilyValue.split(',');

          fontFamilies.forEach((fontFamily) => {
            const trimmedFontFamily = fontFamily.trim().replace(/['"]/g, '');
            fontSet.add(trimmedFontFamily);
          });
        }
      });

      return Array.from(fontSet);
    });

    await browser.close();

    return fonts;
  } catch (error) {
    logger.error('Error getting fonts from page:', error);
    throw new Error('Failed to fetch fonts from the provided URL. Please check if the URL is valid and try again.');
  }
}

module.exports = { getColorsFromPage, getFontsFromPage };
