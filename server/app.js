require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const logger = require('./logger');
const cssAnalysisRouter = require('./cssAnalysis');
const websiteAnalysisRouter = require('./websiteAnalysis');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const port = process.env.PORT || 5000;
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});

app.use('/analyze', cssAnalysisRouter);
app.use('/analyze-website', websiteAnalysisRouter);

module.exports = app;
