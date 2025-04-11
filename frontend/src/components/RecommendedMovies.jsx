import React from 'react';
import { Link } from 'react-router-dom';
import { getPosterPath } from '../utils/movieUtils';

/**
 * Component to display recommended movies from the API
 * @param {Object} props Component props
 * @param {Array} props.movies Array of recommended movies
 * @param {Function} props.onShowDetails Function to call when showing movie details
 * @param {Function} props.onAddToWatchlist Function to call when adding movie to watchlist
 */
const RecommendedMovies = ({ movies, onShowDetails, onAddToWatchlist }) => {
  if (!movies || movies.length === 0) {
    return null;
  }

  // Take only the first 10 recommendations for display
  const displayMovies = movies.slice(0, 10);

  return (
    <section className="bg-[#121212] pt-8 pb-16 px-4 sm:px-8 rounded-t-lg mx-auto w-full max-w-7xl my-4">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">
          <span className="border-b-4 border-red-600 pb-2">Personalized For You</span>
        </h2>
        <p className="text-gray-400">Recommended based on your favorite movies</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {displayMovies.map((movie) => (
          <div key={movie.id} className="bg-[#1A1A1A] rounded-lg overflow-hidden shadow-xl transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
            <div className="relative">
              <img 
                src={movie.poster_path || getPosterPath(movie) || `https://via.placeholder.com/300x450?text=${encodeURIComponent(movie.title || movie.Title || 'Movie')}`} 
                alt={movie.title || movie.Title || 'Movie poster'} 
                className="w-full h-64 object-cover"
              />
              
              {/* Rating badge */}
              {movie.rating > 0 && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-black font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
                  {movie.rating.toFixed(1)}
                </div>
              )}
              
              {/* Genre tags */}
              <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                {movie.genres && movie.genres.length > 0 ? (
                  // Display up to two genres
                  movie.genres.slice(0, 2).map((genre, index) => (
                    <span key={index} className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      {genre}
                    </span>
                  ))
                ) : movie.Genre ? (
                  // If no genres array, try to use the first genre from Genre string
                  <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {movie.Genre.split(',')[0].trim()}
                  </span>
                ) : null}
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-bold truncate mb-1">{movie.title || movie.Title}</h3>
              
              <div className="text-gray-400 text-sm mb-2 flex flex-col">
                <span>{movie.release_date || movie.Year}</span>
                {movie.Director && movie.Director !== 'N/A' && (
                  <span className="truncate">Dir: {movie.Director}</span>
                )}
              </div>
              
              <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                {movie.overview || movie.Plot || 'No description available'}
              </p>
              
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => onShowDetails && onShowDetails(movie)} 
                  className="bg-[#E50914] hover:bg-red-700 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors duration-300 flex items-center justify-center"
                >
                  <i className="fa-solid fa-info-circle mr-2"></i>
                  Details
                </button>
                
                <button 
                  onClick={() => onAddToWatchlist && onAddToWatchlist(movie)} 
                  className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors duration-300 flex items-center justify-center"
                >
                  <i className="fa-solid fa-plus mr-2"></i>
                  Add to Watchlist
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {displayMovies.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-bold mb-2">No movies found</h3>
          <p className="text-gray-400 mb-4">
            Try updating your preferences or search criteria
          </p>
          <Link 
            to="/preferences" 
            className="bg-[#E50914] hover:bg-red-700 text-white py-2 px-4 rounded-md font-medium transition-colors duration-300 inline-block"
          >
            Update Preferences
          </Link>
        </div>
      )}
    </section>
  );
};

export default RecommendedMovies; 