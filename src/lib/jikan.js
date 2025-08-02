// Jikan API service for fetching anime character data
import axios from 'axios';

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

// Cache for character data to avoid repeated API calls
const characterCache = new Map();

/**
 * Fetch random anime characters
 * @param {number} count - Number of characters to fetch
 * @returns {Promise<Array>} - Array of character objects
 */
export const getRandomCharacters = async (count = 5) => {
  try {
    const characters = [];
    const usedIds = new Set();
    
    // Try to get characters from cache first
    const cachedCharacters = Array.from(characterCache.values());
    if (cachedCharacters.length >= count) {
      return cachedCharacters.slice(0, count);
    }
    
    // Fetch new characters if cache is insufficient
    for (let i = 0; i < count; i++) {
      let character = null;
      let attempts = 0;
      
      while (!character && attempts < 10) {
        try {
          // Generate random character ID (Jikan has characters up to ~200000+)
          const randomId = Math.floor(Math.random() * 50000) + 1;
          
          if (usedIds.has(randomId)) {
            attempts++;
            continue;
          }
          
          usedIds.add(randomId);
          
          // Check cache first
          if (characterCache.has(randomId)) {
            character = characterCache.get(randomId);
            break;
          }
          
          const response = await axios.get(`${JIKAN_BASE_URL}/characters/${randomId}`);
          
          if (response.data && response.data.data) {
            const charData = response.data.data;
            character = {
              id: charData.mal_id,
              name: charData.name,
              image: charData.images?.jpg?.image_url || charData.images?.webp?.image_url,
              about: charData.about || 'No description available',
              synopsis: charData.about || 'No description available'
            };
            
            // Cache the character
            characterCache.set(randomId, character);
          }
        } catch (error) {
          console.warn(`Failed to fetch character ${randomId}:`, error.message);
        }
        
        attempts++;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (character) {
        characters.push(character);
      }
    }
    
    // If we couldn't fetch enough characters, use fallback data
    while (characters.length < count) {
      characters.push(getFallbackCharacter(characters.length));
    }
    
    return characters;
  } catch (error) {
    console.error('Error fetching characters:', error);
    
    // Return fallback characters if API fails
    const fallbackCharacters = [];
    for (let i = 0; i < count; i++) {
      fallbackCharacters.push(getFallbackCharacter(i));
    }
    return fallbackCharacters;
  }
};

/**
 * Get a fallback character when API fails
 * @param {number} index - Index for generating different fallback characters
 * @returns {Object} - Fallback character object
 */
const getFallbackCharacter = (index) => {
  const fallbackCharacters = [
    {
      id: `fallback_${index}`,
      name: 'Goku',
      image: 'https://via.placeholder.com/300x400?text=Goku',
      about: 'A Saiyan warrior with incredible strength and the ability to transform into Super Saiyan forms.',
      synopsis: 'A Saiyan warrior with incredible strength and the ability to transform into Super Saiyan forms.'
    },
    {
      id: `fallback_${index}`,
      name: 'Naruto Uzumaki',
      image: 'https://via.placeholder.com/300x400?text=Naruto',
      about: 'A ninja with the Nine-Tailed Fox sealed within him, possessing immense chakra and determination.',
      synopsis: 'A ninja with the Nine-Tailed Fox sealed within him, possessing immense chakra and determination.'
    },
    {
      id: `fallback_${index}`,
      name: 'Luffy',
      image: 'https://via.placeholder.com/300x400?text=Luffy',
      about: 'A pirate with rubber powers who dreams of becoming the Pirate King.',
      synopsis: 'A pirate with rubber powers who dreams of becoming the Pirate King.'
    },
    {
      id: `fallback_${index}`,
      name: 'Ichigo Kurosaki',
      image: 'https://via.placeholder.com/300x400?text=Ichigo',
      about: 'A Soul Reaper with the power to see and fight spirits, wielding a massive sword.',
      synopsis: 'A Soul Reaper with the power to see and fight spirits, wielding a massive sword.'
    },
    {
      id: `fallback_${index}`,
      name: 'Edward Elric',
      image: 'https://via.placeholder.com/300x400?text=Edward',
      about: 'A young alchemist who can transmute matter without a transmutation circle.',
      synopsis: 'A young alchemist who can transmute matter without a transmutation circle.'
    }
  ];
  
  return fallbackCharacters[index % fallbackCharacters.length];
};

/**
 * Pre-cache characters for better performance
 * @param {number} count - Number of characters to pre-cache
 */
export const preCacheCharacters = async (count = 20) => {
  try {
    console.log('Pre-caching characters...');
    await getRandomCharacters(count);
    console.log(`Pre-cached ${characterCache.size} characters`);
  } catch (error) {
    console.error('Error pre-caching characters:', error);
  }
};

export default { getRandomCharacters, preCacheCharacters };

