// Gemini API configuration
import axios from 'axios';

// Gemini API configuration - Replace with your actual API key
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = import.meta.env.VITE_GEMINI_API_URL;

/**
 * Compare two anime characters using Gemini API
 * @param {Object} character1 - First character with name and synopsis
 * @param {Object} character2 - Second character with name and synopsis
 * @returns {Promise<Object>} - Result with winner and explanation
 */
export const compareCharacters = async (character1, character2) => {
  try {
    const prompt = `
Compare these two anime characters and determine who would win in a battle based on their abilities, powers, and characteristics. 

Character 1: ${character1.name}
Description: ${character1.synopsis || character1.about || 'No description available'}

Character 2: ${character2.name}
Description: ${character2.synopsis || character2.about || 'No description available'}

Please respond with ONLY a JSON object in this exact format:
{
  "winner": "character1" or "character2" or "tie",
  "explanation": "Brief explanation of why this character wins or why it's a tie (max 100 words)"
}

Consider their powers, abilities, combat experience, and overall strength. If they are very evenly matched, you can declare it a tie.
`;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    const generatedText = response.data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return result;
    } else {
      throw new Error('Invalid response format from Gemini API');
    }
  } catch (error) {
    console.error('Error comparing characters:', error);
    
    // Fallback: random winner if API fails
    const randomWinner = Math.random() < 0.5 ? 'character1' : 'character2';
    return {
      winner: randomWinner,
      explanation: 'Unable to determine winner due to API error. Random result generated.'
    };
  }
};

export default { compareCharacters };

