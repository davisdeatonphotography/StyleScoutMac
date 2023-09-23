const { Configuration, OpenAIApi } = require('openai');
const readEnvFile = require('./envReader');

const env = readEnvFile();

const configuration = new Configuration({
  apiKey: env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

module.exports = openai;