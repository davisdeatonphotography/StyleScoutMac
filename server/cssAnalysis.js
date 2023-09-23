const express = require('express');
const { Configuration, OpenAIApi } = require('openai');
const logger = require('./logger');

const router = express.Router();

// Read .env file
const fs = require('fs');
const path = require('path');

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

const configuration = new Configuration({
  apiKey: env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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
function filterCssContent(inputCssContent) {
  let cssContent = inputCssContent;
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

// Calculate score based on category analysis
function calculateScore(category, analysisResponse) {
  // Implement your custom scoring logic based on category and analysis response
  let score = 0;

  switch (category) {
    case "Color Scheme":
      // Calculate score for color scheme analysis
      // Example: score = Math.random() * 10;
      break;
    case "Typography":
      // Calculate score for typography analysis
      // Example: score = Math.random() * 10;
      break;
    case "Layout and Spacing":
      // Calculate score for layout and spacing analysis
      // Example: score = Math.random() * 10;
      break;
    case "Design Principles":
      // Calculate score for design principles analysis
      // Example: score = Math.random() * 10;
      break;
    case "Imagery and Graphics":
      // Calculate score for imagery and graphics analysis
      // Example: score = Math.random() * 10;
      break;
    default:
      score = 0;
  }

  return score;
}

// Analyze endpoint for analyzing CSS data
router.post('/', async (req, res) => {
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

module.exports = router;
