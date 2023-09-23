const express = require('express');
const puppeteer = require('puppeteer');
const validator = require('validator');
const logger = require('./logger');
const { getColorsFromPage, getFontsFromPage } = require('./webScraping');
const { analyzeCSSData, filterCssContent, calculateScore } = require('./cssAnalysis');
const { getDesignAlternatives } = require('./designAlternatives');

const router = express.Router();

// Get CSS content from a given URL
async function getCssContentFromUrl(url) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });

    const cssContent = await page.evaluate(() => {
      const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'));
      return styles
        .map((style) => style.textContent)
        .filter((content) => content.trim().length > 0)
        .join('\n');
    });

    await browser.close();

    return cssContent;
  } catch (error) {
    logger.error('Error getting CSS content from URL:', error);
    throw new Error('Failed to fetch CSS content from the provided URL. Please check if the URL is valid and try again.');
  }
}

// Analyze website by fetching CSS content, colors, fonts, and category analysis
async function analyzeWebsite(url) {
  try {
    if (!url || !validator.isURL(url)) {
      throw new Error('Invalid or missing URL.');
    }

    const cssContent = await getCssContentFromUrl(url);
    const filteredCssContent = filterCssContent(cssContent);

    const colors = await getColorsFromPage(url);
    const fonts = await getFontsFromPage(url);

    const categories = ["Color Scheme", "Typography", "Layout and Spacing", "Design Principles", "Imagery and Graphics"];

    const categoryAnalysisPromises = categories.map(category =>
      analyzeCSSData(filteredCssContent, category)
    );

    const categoryAnalysisResults = await Promise.all(categoryAnalysisPromises);

    const categoryAnalysis = {};
    categories.forEach((category, index) => {
      categoryAnalysis[category] = categoryAnalysisResults[index];
    });

    const designAlternatives = await getDesignAlternatives(categoryAnalysis);

    return { css: filteredCssContent, colors, fonts, categoryAnalysis, designAlternatives };
  } catch (error) {
    logger.error('Error analyzing website:', error);
    throw new Error('Error analyzing website.');
  }
}

// Analyze website endpoint for analyzing a website
router.post('/', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required.' });
    }

    const analysis = await analyzeWebsite(url);

    res.json(analysis);
  } catch (error) {
    logger.error('Error analyzing website:', error);
    res.status(500).json({ error: 'Error analyzing website.' });
  }
});

module.exports = router;
