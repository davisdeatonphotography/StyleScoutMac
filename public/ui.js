function getElementById(id) {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Element with id "${id}" not found.`);
  }
  return element;
}

export function displayResults(data) {
    const { css, colors, fonts, categoryAnalysis } = data;

    // Display CSS
    getElementById('css-content').textContent = css;

    // Display colors
    const colorsContainer = getElementById('colors-container');
    colorsContainer.innerHTML = '';
    colors.forEach(color => {
        const colorElem = document.createElement('div');
        colorElem.className = 'color-box';
        colorElem.style.backgroundColor = color;
        colorsContainer.appendChild(colorElem);
    });

    // Display fonts
    const fontsContainer = getElementById('fonts-container');
    fontsContainer.innerHTML = '';
    fonts.forEach(font => {
        const fontElem = document.createElement('div');
        fontElem.className = 'font-box';
        fontElem.textContent = font;
        fontsContainer.appendChild(fontElem);
    });

    // Display analysis
    const analysisContainer = getElementById('analysis-container');
    analysisContainer.innerHTML = JSON.stringify(categoryAnalysis, null, 2);
}

export function displayDesignAlternatives(designAlternatives) {
  // Display design alternatives in the UI
  // You can modify this function to format and display the design alternatives based on your design library API response

  for (const category in designAlternatives) {
    const alternativeListElemId = `${category.toLowerCase().replace(/ /g, '-')}-alternatives`;
    const alternativeListElem = getElementById(alternativeListElemId);

    if (alternativeListElem) {
      designAlternatives[category].forEach(alternative => {
        const alternativeElem = document.createElement('div');
        alternativeElem.className = 'alternative';
        alternativeElem.innerHTML = `
          <h3>${alternative.name}</h3>
          <p>${alternative.description}</p>
        `;
        alternativeListElem.appendChild(alternativeElem);
      });
    }
  }
}
