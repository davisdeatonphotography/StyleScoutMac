const fs = require('fs');
const path = require('path');

function readEnvFile() {
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

  return env;
}

module.exports = readEnvFile;