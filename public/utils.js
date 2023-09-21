import { startAnalysis } from './api.js';

export function init() {
  const analyzeButton = document.getElementById('analyzeButton');
  analyzeButton.addEventListener('click', handleSubmit);
}

export function handleSubmit() {
  const urlInput = document.getElementById('urlInput');
  const url = urlInput.value;
  startAnalysis(url);
}