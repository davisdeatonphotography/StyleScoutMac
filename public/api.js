export async function startAnalysis(url) {
    try {
        const response = await fetch('/analyze-website', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
        });
  
        if (!response.ok) {
            throw new Error('An error occurred while analyzing the website.');
        }
  
        const data = await response.json();
  
        if (!data || !data.css || !data.colors || !data.fonts || !data.categoryAnalysis || !data.designAlternatives) {
            throw new Error('Response data is undefined or missing required fields.');
        }
  
        displayResults(data);
        displayDesignAlternatives(data.designAlternatives);
    } catch (error) {
        console.error('An error occurred while analyzing the website:', error);
    }
}
