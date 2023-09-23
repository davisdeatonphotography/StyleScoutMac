async function getDesignAlternatives(categoryAnalysis) {
    const designAlternatives = {};
  

    if (categoryAnalysis["Color Scheme"]) {
      const colorSchemeAlternatives = [];
  
  
      designAlternatives["Color Scheme"] = colorSchemeAlternatives;
    }
  
    if (categoryAnalysis["Typography"]) {
      const typographyAlternatives = [];
 
      designAlternatives["Typography"] = typographyAlternatives;
    }
  
    if (categoryAnalysis["Layout and Spacing"]) {
      const layoutAlternatives = [];
  

  
      designAlternatives["Layout and Spacing"] = layoutAlternatives;
    }
  
    if (categoryAnalysis["Design Principles"]) {
      const designPrinciplesAlternatives = [];

  
      designAlternatives["Design Principles"] = designPrinciplesAlternatives;
    }
  
    if (categoryAnalysis["Imagery and Graphics"]) {
      const imageryAlternatives = [];
  

      designAlternatives["Imagery and Graphics"] = imageryAlternatives;
    }
  
    return designAlternatives;
  }
  
  module.exports = { getDesignAlternatives };
  