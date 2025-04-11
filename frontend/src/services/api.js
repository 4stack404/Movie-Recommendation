// API service functions

const TMDB_API_KEY = "bb40bba9ec0647c0d0b72356663d2967";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

/**
 * Fetches movie recommendations based on user's movie selections
 * @param {string[]} movieNames - Array of movie names to base recommendations on
 * @returns {Promise<Array>} - Promise resolving to recommended movies
 */
export const getMovieRecommendations = async (movieNames) => {
  try {
    // Ensure movieNames is an array with valid content
    if (!Array.isArray(movieNames) || movieNames.length === 0) {
      console.error('Invalid movie names array:', movieNames);
      return [];
    }

    // Filter out empty strings and undefined values
    const validMovieNames = movieNames.filter(name => 
      name && typeof name === 'string' && name.trim() !== ''
    );
    
    if (validMovieNames.length === 0) {
      console.error('No valid movie names found after filtering:', movieNames);
      return [];
    }

    // Prepare movie names for API (lowercase, comma-separated)
    const formattedMovies = validMovieNames.map(name => name.toLowerCase().trim());

    // Join movie names with commas for URL
    const movieQuery = formattedMovies.join(',');
    console.log('Calling API with movies:', movieQuery);
    
    // Call the recommendation API
    const response = await fetch(`https://recommendation-system-4g5y.onrender.com/recommend/${encodeURIComponent(movieQuery)}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('API response:', data);
    
    // Handle API error messages
    if (data.exception) {
      console.error('API returned exception:', data.exception);
      return [];
    }
    
    // Return the recommendations array if the status is true
    if (data.status && data.recommendations && Array.isArray(data.recommendations)) {
      // Enhance recommendations with TMDB data
      const enhancedRecommendations = await enhanceMoviesWithTMDBData(data.recommendations);
      return enhancedRecommendations;
    } else {
      console.error('API returned false status or no recommendations');
      return [];
    }
  } catch (error) {
    console.error('Error fetching movie recommendations:', error);
    return [];
  }
};

/**
 * Enhances movie data with TMDB images
 * @param {Array} movies - Movies from recommendation API
 * @returns {Promise<Array>} - Movies with enhanced data
 */
const enhanceMoviesWithTMDBData = async (movies) => {
  if (!movies || !Array.isArray(movies) || movies.length === 0) {
    return [];
  }
  
  // Create an array of promises for fetching TMDB data
  const enhancedMoviesPromises = movies.map(async (movie) => {
    try {
      const tmdbData = await getMovieDetails(movie.id);
      
      // If TMDB data was successfully fetched, add it to the movie data
      if (tmdbData) {
        return {
          ...movie,
          backdrop_path: tmdbData.backdrop_path,
          poster_path: tmdbData.poster_path,
          vote_average: tmdbData.vote_average || movie.rating
        };
      }
      
      // If TMDB data fetch failed, return movie with placeholder
      return {
        ...movie,
        backdrop_path: null,
        poster_path: null,
        vote_average: movie.rating
      };
    } catch (error) {
      console.error(`Error enhancing movie ${movie.id}:`, error);
      return movie;
    }
  });
  
  // Wait for all promises to resolve
  return Promise.all(enhancedMoviesPromises);
};

/**
 * Fetches movie details from TMDB API
 * @param {number} movieId - The TMDB movie ID
 * @returns {Promise<Object>} - Promise resolving to movie details
 */
export const getMovieDetails = async (movieId) => {
  const url = `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`;
  
  // Special handling for Interstellar documentary example
  if (movieId === 301959) {
    return {
      id: 301959,
      vote_average: 7.7,
      backdrop_path: `${TMDB_IMAGE_BASE_URL}/fTcs5ejlN1MwwLSSv9aU1mi5alL.jpg`,
      poster_path: `${TMDB_IMAGE_BASE_URL}/i4PpBcuLvdcJwIf3hkcV9QDR1iH.jpg`
    };
  }
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch data for movie ID: ${movieId}`);
    }
    
    const data = await response.json();
    
    return {
      id: movieId,
      vote_average: data.vote_average,
      backdrop_path: data.backdrop_path ? `${TMDB_IMAGE_BASE_URL}${data.backdrop_path}` : null,
      poster_path: data.poster_path ? `${TMDB_IMAGE_BASE_URL}${data.poster_path}` : null
    };
  } catch (error) {
    console.error(`Error fetching TMDB data for movie ${movieId}:`, error.message);
    return null; // Return null for failed fetch
  }
}; 