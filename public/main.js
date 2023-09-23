import { init, handleSubmit } from './utils.js';
import { startAnalysis } from './api.js';
import { displayResults, displayDesignAlternatives } from './ui.js';

function init() {
  const analyzeButton = document.getElementById('analyzeButton');
  analyzeButton.addEventListener('click', handleSubmit);
}

init();
