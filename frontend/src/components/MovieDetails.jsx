import React from 'react';

/**
 * Component to display detailed information about a movie
 * @param {Object} props Component props
 * @param {Object} props.movie Movie object to display
 * @param {boolean} props.isOpen Whether the modal is open
 * @param {Function} props.onClose Function to call when closing the modal
 * @param {Function} props.onAddToWatchlist Function to call when adding movie to watchlist
 */
const MovieDetails = ({ movie, isOpen, onClose, onAddToWatchlist }) => {
  if (!isOpen || !movie) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-[#181818] rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {/* Backdrop image */}
          <div className="h-[300px] md:h-[400px] w-full bg-gradient-to-t from-[#181818] to-transparent absolute bottom-0 left-0 z-10"></div>
          <img 
            src={movie.backdrop_path || movie.Poster || 'https://via.placeholder.com/800x400?text=No+Backdrop'} 
            alt={movie.title || movie.Title || 'Movie backdrop'} 
            className="w-full h-[300px] md:h-[400px] object-cover"
          />
          
          {/* Close button */}
          <button 
            className="absolute top-4 right-4 bg-black/50 p-2 rounded-full z-20 hover:bg-black/80 transition-all"
            onClick={onClose}
            aria-label="Close details"
          >
            <i className="fa-solid fa-times text-white text-xl"></i>
          </button>
        </div>
        
        <div className="p-6 relative z-20 -mt-16">
          <h2 className="text-3xl font-bold mb-2">{movie.title || movie.Title}</h2>
          
          <div className="flex items-center text-gray-400 mb-4 flex-wrap gap-2">
            <span>{movie.release_date || movie.Year}</span>
            {movie.Runtime && (
              <>
                <span className="mx-1">•</span>
                <span>{movie.Runtime}</span>
              </>
            )}
            {movie.Rated && movie.Rated !== 'N/A' && (
              <>
                <span className="mx-1">•</span>
                <span>{movie.Rated}</span>
              </>
            )}
          </div>
          
          <div className="flex mb-4 flex-wrap gap-2">
            {(movie.rating || movie.imdbRating) && (
              <div className="bg-yellow-500 text-black py-1 px-3 rounded text-sm flex items-center font-semibold">
                <i className="fa-solid fa-star mr-1"></i>
                <span>{movie.rating || movie.imdbRating}/10</span>
              </div>
            )}
            
            <button 
              className="bg-[#333] text-white py-1 px-3 rounded flex items-center hover:bg-[#555] transition text-sm"
              onClick={() => onAddToWatchlist && onAddToWatchlist(movie)}
            >
              <i className="fa-solid fa-plus mr-1"></i>
              <span>Add to Watchlist</span>
            </button>
          </div>
          
          {/* Genres */}
          {(movie.genres?.length > 0 || movie.Genre) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {movie.genres ? (
                movie.genres.map((genre, index) => (
                  <span key={index} className="bg-[#333] text-white px-2 py-1 rounded text-xs">
                    {genre}
                  </span>
                ))
              ) : (
                movie.Genre.split(',').map((genre, index) => (
                  <span key={index} className="bg-[#333] text-white px-2 py-1 rounded text-xs">
                    {genre.trim()}
                  </span>
                ))
              )}
            </div>
          )}
          
          <p className="text-gray-300 mb-4">{movie.overview || movie.Plot || 'No plot description available.'}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              {movie.Director && movie.Director !== 'N/A' && (
                <p className="mb-2"><span className="text-gray-400">Director:</span> {movie.Director}</p>
              )}
              {movie.Writer && movie.Writer !== 'N/A' && (
                <p className="mb-2"><span className="text-gray-400">Writers:</span> {movie.Writer}</p>
              )}
              {movie.Actors && movie.Actors !== 'N/A' && (
                <p className="mb-2"><span className="text-gray-400">Stars:</span> {movie.Actors}</p>
              )}
            </div>
            <div>
              {movie.Language && movie.Language !== 'N/A' && (
                <p className="mb-2"><span className="text-gray-400">Language:</span> {movie.Language}</p>
              )}
              {movie.Awards && movie.Awards !== 'N/A' && (
                <p className="mb-2"><span className="text-gray-400">Awards:</span> {movie.Awards}</p>
              )}
              {movie.tagline && (
                <p className="mb-2"><span className="text-gray-400">Tagline:</span> {movie.tagline}</p>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails; 