require('dotenv').config();
const fs = require('fs');
const validator = require('validator');
const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
const puppeteer = require('puppeteer');
const winston = require('winston');
const path = require('path');

// Read .env file
const envFileContents = fs.readFileSync(path.join(__dirname, '/../.env'), 'utf-8');

// Split file into lines
const lines = envFileContents.split('\n');

// Parse lines into key-value pairs
const env = {};
lines.forEach((line) => {
  const [key, value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.trim();
  }
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const configuration = new Configuration({
  apiKey: env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ level, message, stack, timestamp }) => {
      let logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;
      if (stack) {
        logMessage += `\n${stack}`;
      }
      return logMessage;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log' }),
  ],
});

// Constants
const MAX_TOKENS = 4096; // Maximum number of tokens allowed in a request

// Truncate text based on maximum tokens allowed
function truncate(text, maxTokens) {
  const initialTruncate = text.slice(0, maxTokens);
  const lastBrace = initialTruncate.lastIndexOf("}");

  if (lastBrace !== -1) {
    return initialTruncate.slice(0, lastBrace + 1);
  }

  return initialTruncate;
}

// Filter CSS content to remove unnecessary elements
function filterCssContent(cssContent) {
  cssContent = cssContent.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '');
  cssContent = cssContent.replace(/@media[^{]+{[\s\S]+?}/g, '');
  cssContent = cssContent.replace(/@keyframes[^{]+{[\s\S]+?}/g, '');
  cssContent = cssContent.replace(/!important/g, '');
  cssContent = cssContent.replace(/\s+/g, ' ').trim();

  return cssContent;
}

// Send request to OpenAI API with retry mechanism for rate limiting
async function sendRequestWithRetry(cssContent, retries = 5, delay = 5 * 60 * 1000) {
  try {
    const tokens = cssContent.length + 'gpt-3.5-turbo-16k'.length;
    logger.info(`Tokens in request: ${tokens}`);

    const truncatedContent = truncate(cssContent, MAX_TOKENS);

    const analysis = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an AI trained to analyze CSS.' },
        { role: 'user', content: truncatedContent },
      ],
    });

    logger.info('Received response from OpenAI API:', analysis);
    return analysis;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      if (retries > 0) {
        const retryAfter = parseInt(error.response.headers['retry-after'], 10) || delay;
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
        return sendRequestWithRetry(cssContent, retries - 1, delay);
      } else {
        logger.error('No more retries left. Please reduce the frequency of your requests.');
        throw error;
      }
    } else {
      logger.error('Error sending request to OpenAI API:', error);
      logger.error('Error response body:', error.response.data);
      throw error;
    }
  }
}

// Analyze CSS data and calculate score based on category
async function analyzeCSSData(cssData, category) {
  try {
    const filteredCssContent = filterCssContent(cssData);
    const prompt = `Analyze the ${category} used in this CSS: ${filteredCssContent}`;
    const analysisResponse = await sendRequestWithRetry(prompt);

    return {
      analysis: analysisResponse.data.choices[0].message.content,
      score: calculateScore(category, analysisResponse), // Custom scoring implementation
    };
  } catch (error) {
    logger.error('Error during OpenAI API call:', error);
    throw new Error('Failed to analyze the CSS data. Please try again later.');
  }
}

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

// Calculate score based on category analysis
function calculateScore(category, analysisResponse) {
  // Implement your custom scoring logic based on category and analysis response
  let score = 0;

  switch (category) {
    case "Color Scheme":
      // Calculate score for color scheme analysis
      break;
    case "Typography":
      // Calculate score for typography analysis
      break;
    case "Layout and Spacing":
      // Calculate score for layout and spacing analysis
      break;
    case "Design Principles":
      // Calculate score for design principles analysis
      break;
    case "Imagery and Graphics":
      // Calculate score for imagery and graphics analysis
      break;
    default:
      score = 0;
  }

  return score;
}

// Get colors from a web page
async function getColorsFromPage(url) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
		await page.goto(url, { waitUntil: 'networkidle2' });

    const colors = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const colorProperties = ['color', 'background-color'];
      const colorValues = new Set();

      elements.forEach((element) => {
        const styles = getComputedStyle(element);
        colorProperties.forEach((property) => {
          const color = styles.getPropertyValue(property);
          if (color && color !== 'rgba(0, 0, 0, 0)') {
            colorValues.add(color);
          }
        });
      });

      return Array.from(colorValues);
    });

    await browser.close();

    return colors;
  } catch (error) {
    logger.error('Error getting colors from the web page:', error);
    throw new Error('Failed to retrieve colors from the web page.');
  }
}

// Get fonts from a web page
async function getFontsFromPage(url) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
		await page.goto(url, { waitUntil: 'networkidle2' });

    const fonts = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const fontProperties = ['font-family', 'font-size'];
      const fontValues = new Set();

      elements.forEach((element) => {
        const styles = getComputedStyle(element);
        fontProperties.forEach((property) => {
          const font = styles.getPropertyValue(property);
          if (font) {
            fontValues.add(font);
          }
        });
      });

      return Array.from(fontValues);
    });

    await browser.close();

    return fonts;
  } catch (error) {
    logger.error('Error getting fonts from the web page:', error);
    throw new Error('Failed to retrieve fonts from the web page.');
  }
}

// Get design alternatives based on category analysis
async function getDesignAlternatives(categoryAnalysis) {
  // Implement your logic to fetch design alternatives based on category analysis
  // You can use an external design library API to search for similar designs or components

  // Example implementation:
  const designAlternatives = {};

  for (const category in categoryAnalysis) {
    // Replace this with your logic to fetch design alternatives from an external API
    // Here, we are just generating dummy alternatives
    designAlternatives[category] = [
      { name: 'Alternative 1', description: 'This is an alternative design suggestion.' },
      { name: 'Alternative 2', description: 'This is another alternative design suggestion.' },
    ];
  }

  return designAlternatives;
}

// Analyze endpoint for analyzing CSS data
app.post('/analyze', async (req, res) => {
  try {
    const { cssData } = req.body;

    if (!cssData || typeof cssData !== 'string') {
      return res.status(400).json({ error: 'Invalid CSS data provided.' });
    }

    const analysis = await analyzeCSSData(cssData, "Custom Category");
    
		res.json({ analysis });
  } catch (error) {
    logger.error('Error during analysis:', error);
    res.status(500).json({ error: 'Failed to analyze the CSS data. Please try again later.' });
  }
});

// Analyze website endpoint for analyzing a website
app.post('/analyze-website', async (req, res) => {
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

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.message, err);
  res.status(500).send({ error: "An unexpected error occurred. Please try again." });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
