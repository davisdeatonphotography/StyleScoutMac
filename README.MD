
# Style Scout App

## Overview
The Style Scout App analyzes the design elements of a user-input URL and generates detailed, user-friendly reports. The app evaluates the design based on various categories such as color schemes, typography, layout, and more.

## Features
- **Webpage Analysis**: The app uses Puppeteer to capture design elements from the provided URL.
- **Scoring System**: Based on the extracted design elements, the app calculates a score for different design categories.
- **Interactive Preview**: Users can view an interactive iframe embedding of the analyzed webpage.
- **Glassmorphic UI**: The app boasts a modern design aesthetic called glassmorphism, providing a sleek and intuitive user experience.

## Setup Instructions
1. Ensure you have Node.js installed on your machine.
2. Clone the repository.
3. Install dependencies using `npm install`.
4. Set up the required environment variables (e.g., `OPENAI_API_KEY` for OpenAI integration).
5. Run the server using `npm start` or `node app.js`.
6. Access the app on `http://localhost:3000` or the port specified.

## Design Analysis
The app evaluates the design based on the following categories:
- **Color Scheme**: Evaluates the harmony and contrast of the webpage's color palette.
- **Typography**: Assesses the readability based on the use of web-safe fonts and variance of font sizes.
- **Layout and Spacing**: Scores the design based on the use of modern layout techniques and consistent spacing.
- **Design Principles**: Rates the design's adherence to principles like alignment, balance, and hierarchy.
- **Imagery**: Scores based on the resolution and format of images, with a preference for SVGs and high-resolution images.

For detailed scoring criteria, refer to the scoring functions in the app's server-side code.

---

