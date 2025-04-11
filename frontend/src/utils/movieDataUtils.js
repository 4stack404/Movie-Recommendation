/**
 * Utilities for loading and searching movie data
 */

/**
 * Parse genres from string format to array
 * @param {string} genresStr - Genres in string format like "['Action', 'Drama']"
 * @returns {Array} Array of genre strings
 */
const parseGenres = (genresStr) => {
  try {
    if (!genresStr) return [];
    // Remove single quotes and parse as array
    const cleaned = genresStr.replace(/'/g, '"');
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Error parsing genres:', error);
    return [];
  }
};

/**
 * Clean JSON text by replacing invalid values
 * @param {string} text - The JSON text to clean
 * @returns {string} - Cleaned JSON text
 */
const cleanJsonText = (text) => {
  // Replace NaN with null
  text = text.replace(/: NaN,/g, ': null,');
  text = text.replace(/: NaN\n/g, ': null\n');
  text = text.replace(/: NaN\s*}/g, ': null}');
  
  // Replace Infinity and -Infinity with null
  text = text.replace(/: Infinity,/g, ': null,');
  text = text.replace(/: -Infinity,/g, ': null,');
  
  // Replace undefined with null
  text = text.replace(/: undefined,/g, ': null,');
  
  // Fix any trailing commas in arrays
  text = text.replace(/,(\s*[\]}])/g, '$1');
  
  return text;
};

/**
 * Loads movie dataset
 * @returns {Promise<Array>} Promise resolving to the movie dataset
 */
export const loadMovieDataset = async () => {
  try {
    console.log('Starting to load dataset...');
    
    const response = await fetch('/data/dataset.json');
    if (!response.ok) {
      throw new Error(`Failed to load dataset: ${response.status} ${response.statusText}`);
    }

    let text = await response.text();
    console.log('Dataset loaded, size:', Math.round(text.length / 1024 / 1024 * 100) / 100, 'MB');

    // Clean the JSON text
    text = cleanJsonText(text);
    console.log('Dataset cleaned, attempting to parse...');

    let data;
    try {
      data = JSON.parse(text);
      console.log('Dataset parsed successfully, type:', Array.isArray(data) ? 'array' : 'object');
    } catch (parseError) {
      console.error('Error parsing dataset:', parseError);
      console.error('Error position:', parseError.message);
      // Log a snippet of the text around the error if possible
      if (parseError.message.includes('position')) {
        const position = parseInt(parseError.message.match(/position (\d+)/)?.[1]);
        if (!isNaN(position)) {
          const start = Math.max(0, position - 100);
          const end = Math.min(text.length, position + 100);
          console.error('Text around error:', text.substring(start, end));
        }
      }
      throw new Error('Failed to parse dataset');
    }

    if (!data || !Array.isArray(data)) {
      throw new Error('Invalid dataset format: expected an array');
    }

    console.log('Processing', data.length, 'movies...');
    
    // Process the data to ensure correct format
    const processedData = data
      .filter(movie => movie && movie.id && (movie.title || movie.original_title)) // Filter out invalid entries
      .map(movie => {
        try {
          const processed = {
            id: movie.id,
            title: movie.title || movie.original_title || '',
            overview: movie.overview || '',
            genres: parseGenres(movie.genres || '[]'),
            year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
            rating: movie.vote_average ? Math.round(movie.vote_average * 10) / 10 : null,
            poster_path: movie.poster_path || null,
            original_language: movie.original_language || '',
            spoken_languages: parseGenres(movie.spoken_languages || '[]')
          };
          return processed;
        } catch (processError) {
          console.error('Error processing movie:', movie.id, processError);
          return null;
        }
      })
      .filter(Boolean); // Remove any null entries

    if (processedData.length === 0) {
      throw new Error('No valid movies found in dataset');
    }

    console.log('Dataset processed successfully:', processedData.length, 'valid movies');
    console.log('Sample movie:', JSON.stringify(processedData[0], null, 2)); // Log first movie for debugging
    return processedData;
  } catch (error) {
    console.error('Error in loadMovieDataset:', error);
    throw new Error(`Failed to load movies: ${error.message}`);
  }
};

/**
 * Search for movies in the dataset with fuzzy matching
 * @param {Array} dataset - The movie dataset
 * @param {string} query - The search query
 * @param {number} limit - Maximum number of results to return
 * @returns {Array} - Array of matching movies
 */
export const searchMovies = (dataset, query, limit = 10) => {
  if (!dataset || !Array.isArray(dataset)) {
    console.log('Invalid dataset:', dataset); // Debug log
    return [];
  }

  // If query is empty or just whitespace, return empty array
  const normalizedQuery = query.toLowerCase().trim();
  if (normalizedQuery === '') {
    return [];
  }

  console.log('Searching for:', normalizedQuery, 'in', dataset.length, 'movies'); // Debug log

  // Score and filter movies based on multiple criteria
  const scoredMovies = dataset
    .map(movie => {
      if (!movie.title) return null;

      const title = movie.title.toLowerCase();
      let score = 0;

      // For single letter searches, prioritize movies starting with that letter
      if (normalizedQuery.length === 1) {
        if (title.startsWith(normalizedQuery)) {
          score += 100;
        } else if (title.split(' ').some(word => word.startsWith(normalizedQuery))) {
          score += 50;
        }
      } else {
        // For longer queries, use more detailed matching
        if (title.startsWith(normalizedQuery)) {
          score += 100;
        } else if (title.includes(' ' + normalizedQuery)) {
          score += 90; // High score for word starts
        } else if (title.includes(normalizedQuery)) {
          score += 50;
        } else if (title.split(' ').some(word => word.startsWith(normalizedQuery))) {
          score += 25;
        }
      }

      // Only include movies that have some match
      return score > 0 ? {
        score,
        id: movie.id,
        title: movie.title,
        year: movie.year,
        rating: movie.rating,
        genres: movie.genres,
        poster_path: movie.poster_path,
        overview: movie.overview ? movie.overview.slice(0, 100) + (movie.overview.length > 100 ? '...' : '') : null
      } : null;
    })
    .filter(Boolean) // Remove null entries
    .sort((a, b) => {
      // First sort by score
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      // Then by rating (if available)
      if (a.rating && b.rating) {
        return b.rating - a.rating;
      }
      // Then by year (most recent first)
      if (a.year && b.year) {
        return b.year - a.year;
      }
      return 0;
    })
    .slice(0, limit); // Limit results

  console.log('Found matches:', scoredMovies.length); // Debug log
  return scoredMovies;
};

/**
 * Capitalizes the first letter of each word in a movie title
 * @param {string} title - The movie title
 * @returns {string} - The capitalized title
 */
export const capitalizeTitle = (title) => {
  if (!title) return '';
  
  return title
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}; 