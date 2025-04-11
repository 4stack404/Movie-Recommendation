/**
 * Utilities for handling movie data
 */

/**
 * Maps a movie from the recommendation API format to the application format
 * @param {Object} apiMovie - Movie object from the recommendation API
 * @returns {Object} - Formatted movie object for the application
 */
export const mapApiMovieToAppMovie = (apiMovie) => {
  return {
    id: apiMovie.id,
    title: apiMovie.title,
    original_title: apiMovie.title,
    Title: apiMovie.title, // Ensure both capitalization formats are available
    Year: apiMovie.release_year?.toString() || '',
    Poster: apiMovie.poster_path || getPosterPath(apiMovie),
    backdrop_path: apiMovie.backdrop_path || getBackdropPath(apiMovie),
    overview: apiMovie.overview || '',
    Plot: apiMovie.overview || '',
    Director: Array.isArray(apiMovie.director) ? apiMovie.director.join(', ') : apiMovie.director || '',
    Writer: '',
    Actors: Array.isArray(apiMovie.cast) ? apiMovie.cast.slice(0, 5).join(', ') : '',
    Genre: Array.isArray(apiMovie.genres) ? apiMovie.genres.join(', ') : apiMovie.genres || '',
    Language: 'English',
    Awards: '',
    imdbRating: apiMovie.vote_average?.toString() || apiMovie.rating?.toString() || '0',
    Runtime: `${apiMovie.runtime || 0} min`,
    Rated: '',
    rating: apiMovie.vote_average || apiMovie.rating || 0,
    release_date: apiMovie.release_year?.toString() || apiMovie.release_date || '',
    genres: Array.isArray(apiMovie.genres) ? apiMovie.genres : [],
    tagline: Array.isArray(apiMovie.tagline) ? apiMovie.tagline[0] : ''
  };
};

/**
 * Gets a poster URL for a movie
 * @param {Object} movie - Movie object
 * @returns {string} - URL for the movie poster
 */
export const getPosterPath = (movie) => {
  const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";
  
  // If the movie already has a poster_path from TMDB, use it
  if (movie.poster_path) {
    // Check if it's already a full URL
    if (movie.poster_path.startsWith('http')) {
      return movie.poster_path;
    }
    // Otherwise, add the base URL
    return `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`;
  }

  // If we have a movie ID, try to construct a TMDB poster path
  if (movie.id) {
    // Direct path for TMDB posters
    if (movie.id && typeof movie.id === 'number') {
      return `${TMDB_IMAGE_BASE_URL}/i4PpBcuLvdcJwIf3hkcV9QDR1iH.jpg`;
    }
  }

  // Placeholder images based on movie id
  const placeholderPosters = {
    // Selected popular movies (mapped to high quality posters)
    348: 'https://m.media-amazon.com/images/M/MV5BMmQ2MmU3NzktZjAxOC00ZDZhLTk4YzEtMDMyMzcxY2IwMDAyXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg', // Alien
    3021: 'https://m.media-amazon.com/images/M/MV5BMTMwNzg2MDg1M15BMl5BanBnXkFtZTcwNTQ3NzYzMw@@._V1_SX300.jpg', // 1408
    75174: 'https://m.media-amazon.com/images/M/MV5BNDY4MTQwMzc1MV5BMl5BanBnXkFtZTcwNzcwNTM5Ng@@._V1_SX300.jpg', // The Grey
    207774: 'https://m.media-amazon.com/images/M/MV5BMTc1NjcxMDI5NF5BMl5BanBnXkFtZTgwNjI3Mjg1MDE@._V1_SX300.jpg', // The Borderlands
    76487: 'https://m.media-amazon.com/images/M/MV5BMTc4NDM3MDEwMF5BMl5BanBnXkFtZTcwNjQzMDY1Ng@@._V1_SX300.jpg', // The Devil Inside
    102382: 'https://m.media-amazon.com/images/M/MV5BOTA5NDYxNTg0OV5BMl5BanBnXkFtZTgwODE5NzU1MTE@._V1_SX300.jpg', // Amazing Spider-Man 2
    9928: 'https://m.media-amazon.com/images/M/MV5BZmJhNTQwY2MtYTU0Yy00MjU5LWE5YzYtZmU4YWYyN2IwNTYzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg', // Robots
    11285: 'https://m.media-amazon.com/images/M/MV5BYWFmNTc3MmEtMTI4Ny00ZDY2LTkxMWItZTA4ODMzNTgyMDBhXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg', // Cocoon: The Return
    301629: 'https://m.media-amazon.com/images/M/MV5BMTY5MTUyMTA0Ml5BMl5BanBnXkFtZTgwNDEzMDE5NTE@._V1_SX300.jpg', // Addicted to Fresno
    323370: 'https://m.media-amazon.com/images/M/MV5BMjEwNzQ1MTg3OF5BMl5BanBnXkFtZTgwNjM0MzU5NjE@._V1_SX300.jpg', // The Diabolical
    50374: 'https://m.media-amazon.com/images/M/MV5BZmQ5YmRkMWQtZDRjOS00NjNhLTk3MDMtYmVlMmJmN2Y2M2ZmXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg', // Black Sunday
    7348: 'https://m.media-amazon.com/images/M/MV5BNTk5MzYwZWUtZmE5Mi00ODVhLWJhZjktMWM3MzQxZjcxZWQ1XkEyXkFqcGdeQXVyNjMwMjk0MTQ@._V1_SX300.jpg', // Robinson Crusoe on Mars
    253835: 'https://m.media-amazon.com/images/M/MV5BMTU0MTkxMzM0Nl5BMl5BanBnXkFtZTgwNzEyODkxMzE@._V1_SX300.jpg', // Los Bandoleros
    301959: 'https://image.tmdb.org/t/p/original/i4PpBcuLvdcJwIf3hkcV9QDR1iH.jpg' // Interstellar: Nolan's Odyssey
  };

  // Check for placeholder posters
  if (movie.id && placeholderPosters[movie.id]) {
    return placeholderPosters[movie.id];
  }

  // Fallback to TMDB placeholder
  return `https://via.placeholder.com/300x450?text=${encodeURIComponent(movie.title || 'Movie')}`;
};

/**
 * Gets a backdrop URL for a movie
 * @param {Object} movie - Movie object
 * @returns {string} - URL for the movie backdrop
 */
export const getBackdropPath = (movie) => {
  // If the movie already has a backdrop_path from TMDB, use it
  if (movie.backdrop_path) {
    return movie.backdrop_path;
  }

  // Placeholder backdrops based on movie id
  const placeholderBackdrops = {
    // Selected popular movies (mapped to high quality backdrops)
    348: 'https://image.tmdb.org/t/p/original/vfzE3pjE5G7G7kcZWrA3fnbZo7V.jpg', // Alien
    3021: 'https://image.tmdb.org/t/p/original/8keQ8RNGqcQzk0UmQGjLUMLWbka.jpg', // 1408
    75174: 'https://image.tmdb.org/t/p/original/2MV8v3G1Rz2gvRsY1ERrJZUgFnR.jpg', // The Grey
    207774: 'https://image.tmdb.org/t/p/original/ksYMYbZ1genPbIJYe4Vy9ibSkoU.jpg', // The Borderlands
    76487: 'https://image.tmdb.org/t/p/original/ySS8e9XKaAuhpFD8y5h8s3QjGgh.jpg', // The Devil Inside
    102382: 'https://image.tmdb.org/t/p/original/tmFDgDmrdp5DYVc3TB9QuKhYCPR.jpg', // The Amazing Spider-Man 2
    9928: 'https://image.tmdb.org/t/p/original/lSITBQ7w95VHx1ULXQuQyTZFhKb.jpg', // Robots
    11285: 'https://image.tmdb.org/t/p/original/6y8J2HlfDyRNUNZl7FGWJ3KIzKJ.jpg', // Cocoon: The Return
    301629: 'https://image.tmdb.org/t/p/original/sEBDC3CXr3YN45ybOrgPBF2GlPD.jpg', // Addicted to Fresno
    323370: 'https://image.tmdb.org/t/p/original/dQkyeEZnTTxaRptcPAZvTn1RLHB.jpg', // The Diabolical
    50374: 'https://image.tmdb.org/t/p/original/x0YR3TYbdXd7wLIhpTHAjn7fzUm.jpg', // Black Sunday
    7348: 'https://image.tmdb.org/t/p/original/cVkKHrKCbTJjiq6pbj9fY5WTnHM.jpg', // Robinson Crusoe on Mars
    253835: 'https://image.tmdb.org/t/p/original/5TzQYH4RwoQP9IXGUDXknvT2Lld.jpg' // Los Bandoleros
  };

  // Check for placeholder backdrops
  if (movie.id && placeholderBackdrops[movie.id]) {
    return placeholderBackdrops[movie.id];
  }

  // Fallback to a generic backdrop
  return 'https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg';
};

/**
 * Filters movies by genre
 * @param {Array} movies - Array of movie objects
 * @param {string} genre - Genre to filter by
 * @returns {Array} - Filtered array of movies
 */
export const filterMoviesByGenre = (movies, genre) => {
  if (!genre || genre === '') {
    return movies;
  }
  
  return movies.filter(movie => {
    // Check Genre string
    if (movie.Genre && movie.Genre.toLowerCase().includes(genre.toLowerCase())) {
      return true;
    }
    
    // Check genres array
    if (movie.genres && Array.isArray(movie.genres)) {
      return movie.genres.some(g => g.toLowerCase().includes(genre.toLowerCase()));
    }
    
    return false;
  });
};

/**
 * Fetches a movie poster URL by movie ID
 * @param {number} movieId - TMDB movie ID
 * @returns {Promise<string>} - URL for the movie poster
 */
export const fetchPosterByMovieId = async (movieId) => {
  const TMDB_API_KEY = "bb40bba9ec0647c0d0b72356663d2967";
  const TMDB_BASE_URL = "https://api.themoviedb.org/3";
  const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";
  
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch poster for movie ID: ${movieId}`);
    }
    
    const data = await response.json();
    
    if (data.poster_path) {
      return `${TMDB_IMAGE_BASE_URL}${data.poster_path}`;
    } else {
      // Movie exists but has no poster
      return `https://via.placeholder.com/300x450?text=${encodeURIComponent(data.title || 'Movie')}`;
    }
  } catch (error) {
    console.error(`Error fetching poster for movie ${movieId}:`, error.message);
    // Return a placeholder in case of error
    return `https://via.placeholder.com/300x450?text=Movie+ID+${movieId}`;
  }
}; 