import { handleSubmit } from './utils.js';
import { startAnalysis, displayResults } from './api.js';

function init() {
  const analyzeButton = document.getElementById('analyzeButton');
  analyzeButton.addEventListener('click', handleSubmit);
}

init();