/**
 * Utilities for loading and searching movie data
 */

/**
 * Loads movie dataset from the JSON file
 * @returns {Promise<Array>} Promise resolving to the movie dataset
 */
export const loadMovieDataset = async () => {
  try {
    const response = await fetch('/data/dataset.json');
    if (!response.ok) {
      throw new Error(`Failed to load movie dataset: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading movie dataset:', error);
    return [];
  }
};

/**
 * Search for movies in the dataset
 * @param {Array} dataset - The movie dataset
 * @param {string} query - The search query
 * @param {number} limit - Maximum number of results to return
 * @returns {Array} - Array of matching movies
 */
export const searchMovies = (dataset, query, limit = 10) => {
  if (!query || query.trim() === '' || !dataset || !Array.isArray(dataset)) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  
  // Filter movies that match the query
  return dataset
    .filter(movie => 
      movie.original_title && movie.original_title.toLowerCase().includes(normalizedQuery)
    )
    .slice(0, limit) // Limit number of results
    .map(movie => ({
      id: movie.id,
      title: capitalizeTitle(movie.original_title)
    }));
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