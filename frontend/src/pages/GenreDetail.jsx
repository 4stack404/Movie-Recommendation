import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const GenreDetail = () => {
  const { genreId } = useParams();
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState([]);
  const [backdropImage, setBackdropImage] = useState('');
  const [showBackdrop, setShowBackdrop] = useState(false);
  const [sortBy, setSortBy] = useState('rating'); // 'rating', 'popularity', 'year'
  const [genreName, setGenreName] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [moviesPerPage, setMoviesPerPage] = useState(20);
  const [totalMovies, setTotalMovies] = useState(0);

  useEffect(() => {
    const fetchMoviesByGenre = async () => {
      setLoading(true);
      try {
        // Convert genreId URL param to proper genre name
        const formattedGenreName = genreId.charAt(0).toUpperCase() + genreId.slice(1);
        setGenreName(formattedGenreName);
        
        // Fetch the JSON file as text to handle NaN values
        const response = await fetch('/data/movies_dataset.json');
        const jsonText = await response.text();
        
        // Replace NaN with null before parsing
        const cleanedJson = jsonText.replace(/:\s*NaN\s*,/g, ': null,').replace(/:\s*NaN\s*}/g, ': null}');
        const data = JSON.parse(cleanedJson);
        
        const moviesArray = Array.isArray(data) ? data : [];
        
        // Process the data
        const moviesData = moviesArray.map(movie => {
          // Process genres - convert from string to array if needed
          let genres = movie.genres;
          if (typeof genres === 'string') {
            try {
              // Try to parse genres if it's a stringified array
              genres = JSON.parse(genres.replace(/'/g, '"'));
            } catch (e) {
              // If parsing fails, split by comma
              genres = genres.split(',').map(g => g.trim());
            }
          }
          
          // Ensure numeric fields are numbers
          const rating = parseFloat(movie.vote_average) || 0;
          const popularity = parseFloat(movie.popularity) || 0;
          const year = movie.release_date ? parseInt(movie.release_date.substring(0, 4)) : 0;
          
          return {
            ...movie,
            genres,
            rating,
            popularity,
            year,
            // Use consistent property names
            title: movie.title || movie.name,
            Year: movie.release_date ? movie.release_date.substring(0, 4) : '',
            Poster: movie.poster_path 
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
              : 'https://via.placeholder.com/300x450?text=No+Image',
            backdrop_path: movie.backdrop_path 
              ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` 
              : 'https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg'
          };
        });
        
        // Filter movies by the selected genre
        const genreMovies = moviesData.filter(movie => 
          Array.isArray(movie.genres) && 
          movie.genres.some(g => g.toLowerCase() === genreId.toLowerCase())
        );
        
        setMovies(genreMovies);
        setTotalMovies(genreMovies.length);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching movies:", error);
        setLoading(false);
      }
    };
    
    fetchMoviesByGenre();
  }, [genreId]);

  // Handle card hover - show backdrop image
  const handleCardHover = (backdropPath) => {
    setBackdropImage(backdropPath);
    setShowBackdrop(true);
  };

  const handleCardLeave = () => {
    setShowBackdrop(false);
  };

  const addToWatchlist = (movie) => {
    // This would be implemented with real functionality
    alert(`Added ${movie.title} to watchlist`);
  };
  
  // Sort and paginate movies
  const paginatedMovies = useMemo(() => {
    // Sort movies based on current sort selection
    const sorted = [...movies].sort((a, b) => {
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      } else if (sortBy === 'popularity') {
        return b.popularity - a.popularity;
      } else if (sortBy === 'year') {
        return b.year - a.year;
      }
      return 0;
    });
    
    // Calculate pagination indexes
    const indexOfLastMovie = currentPage * moviesPerPage;
    const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
    
    // Return the current page's movies
    return sorted.slice(indexOfFirstMovie, indexOfLastMovie);
  }, [movies, sortBy, currentPage, moviesPerPage]);
  
  // Handle movies per page change
  const handleMoviesPerPageChange = (e) => {
    setMoviesPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  // Reset to page 1 when sort criteria changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy]);

  // Change page
  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= Math.ceil(totalMovies / moviesPerPage)) {
      // Get the current scroll position
      const scrollPosition = window.scrollY;
      const mainElement = document.querySelector('main');
      
      // Only scroll if we're below the header
      if (mainElement && scrollPosition > mainElement.offsetTop) {
        // Scroll to the top of the main content area, not the entire page
        window.scrollTo({
          top: mainElement.offsetTop - 20, // Slight offset for visual spacing
          behavior: 'smooth'
        });
      }
      
      setCurrentPage(pageNumber);
    }
  };

  // Movie card component for reusability
  const MovieCard = ({ movie }) => (
    <Link
      to={`/movie/${movie.id}`}
      className="block group h-full"
    >
      <div 
        className="bg-gray-900 rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 cursor-pointer relative h-full
        group-hover:scale-[1.08] group-hover:shadow-xl group-hover:z-10 group-hover:rotate-1"
        style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
        onMouseEnter={() => handleCardHover(movie.backdrop_path)}
        onMouseLeave={handleCardLeave}
      >
        {/* Glass effect overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 z-10 transition-all duration-300"></div>
        
        {/* Badge for rating */}
        {movie.rating > 0 && (
          <div className="absolute top-2 right-2 z-20 bg-yellow-500 text-black font-bold px-2 py-1 rounded-md shadow-lg flex items-center gap-1 transform transition-transform duration-300 group-hover:scale-110">
            <i className="fas fa-star text-xs"></i>
            <span>{movie.rating.toFixed(1)}</span>
          </div>
        )}
        
        <div className="relative aspect-[2/3] overflow-hidden">
          <img 
            src={movie.Poster} 
            alt={movie.title || 'Movie poster'} 
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
            }}
          />
          
          {/* Hover content */}
          <div className="absolute inset-0 flex flex-col justify-end p-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
            <h3 className="font-bold text-lg mb-2 text-white drop-shadow-lg line-clamp-2">{movie.title || 'Untitled'}</h3>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-200 text-sm">{movie.Year || 'N/A'}</span>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addToWatchlist(movie);
                }}
                className="bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-sm transition-colors transform hover:scale-110"
              >
                <i className="fas fa-plus text-sm"></i>
              </button>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-3">
              {movie.genres && Array.isArray(movie.genres) && movie.genres.slice(0, 3).map((genre, index) => (
                <span key={index} className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
                  {genre}
                </span>
              ))}
            </div>
            
            {/* Additional movie details on hover */}
            <div className="text-xs text-white/80 mb-1 line-clamp-2 transform translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-100">
              <p className="line-clamp-2">{movie.overview || 'No description available'}</p>
            </div>
            
            <div className="text-white text-sm flex items-center justify-center mt-2 bg-[#E50914]/80 py-2 rounded-md 
              transform translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-150">
              <i className="fas fa-play mr-2"></i> View Details
            </div>
          </div>
        </div>
        
        {/* Bottom info bar - visible always */}
        <div className="p-3 flex justify-between items-center bg-gradient-to-r from-gray-900 to-gray-800">
          <h3 className="font-semibold text-white line-clamp-1 text-sm">{movie.title || 'Untitled'}</h3>
          <span className="text-xs text-gray-400">{movie.Year || 'N/A'}</span>
        </div>
      </div>
    </Link>
  );

  // Pagination component
  const Pagination = () => {
    const totalPages = Math.ceil(totalMovies / moviesPerPage);
    
    // If only one page, don't show pagination
    if (totalPages <= 1) return null;
    
    // Generate page numbers to display (max 5 pages at a time)
    const getPageNumbers = () => {
      const pageNumbers = [];
      
      // Handle small number of pages (show all if 7 or fewer pages)
      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
        return pageNumbers;
      }
      
      // For larger page counts, show a window around current page
      // Always show first and last page, with ... if needed
      
      // Start with page 1
      pageNumbers.push(1);
      
      // Calculate range around current page
      let rangeStart = Math.max(2, currentPage - 1);
      let rangeEnd = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust range to always show 3 pages if possible
      if (rangeEnd - rangeStart < 2) {
        if (rangeStart === 2) {
          rangeEnd = Math.min(totalPages - 1, rangeStart + 2);
        } else if (rangeEnd === totalPages - 1) {
          rangeStart = Math.max(2, rangeEnd - 2);
        }
      }
      
      // Add ellipsis if there's a gap after page 1
      if (rangeStart > 2) {
        pageNumbers.push('...');
      }
      
      // Add the range of pages
      for (let i = rangeStart; i <= rangeEnd; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis if there's a gap before the last page
      if (rangeEnd < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Add the last page if we're not already at it
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
      
      return pageNumbers;
    };
    
    return (
      <div className="flex flex-col items-center mt-8 space-y-4">
        <div className="flex items-center text-sm text-gray-400">
          {totalMovies > 0 ? (
            <>
              Showing {(currentPage - 1) * moviesPerPage + 1}-
              {Math.min(currentPage * moviesPerPage, totalMovies)} of {totalMovies} movies
            </>
          ) : (
            <>No movies found</>
          )}
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-2">
          {/* Previous page button */}
          <button 
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 sm:px-4 py-2 rounded-md flex items-center justify-center ${
              currentPage === 1 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
            aria-label="Previous page"
          >
            <i className="fas fa-chevron-left mr-1"></i> <span className="hidden sm:inline">Prev</span>
          </button>
          
          {/* Page numbers */}
          {getPageNumbers().map((number, index) => (
            number === '...' ? (
              <span key={`ellipsis-${index}`} className="px-1 sm:px-2 text-gray-500">...</span>
            ) : (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`px-3 sm:px-4 py-2 rounded-md ${
                  currentPage === number
                    ? 'bg-[#E50914] text-white'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                {number}
              </button>
            )
          ))}
          
          {/* Next page button */}
          <button 
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 sm:px-4 py-2 rounded-md flex items-center justify-center ${
              currentPage === totalPages 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span> <i className="fas fa-chevron-right ml-1"></i>
          </button>
        </div>
        
        {/* Items per page selector */}
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-400">Movies per page:</span>
          <select 
            value={moviesPerPage} 
            onChange={handleMoviesPerPageChange}
            className="bg-gray-800 text-white px-2 py-1 rounded-md border border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-500"
          >
            <option value={12}>12</option>
            <option value={20}>20</option>
            <option value={40}>40</option>
            <option value={60}>60</option>
          </select>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0D0D0D] text-white">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0D0D0D] text-white">
      {/* Backdrop image that appears on hover */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center z-0 transition-all duration-700"
        style={{ 
          backgroundImage: `url(${backdropImage})`,
          filter: 'blur(8px)',
          opacity: showBackdrop ? 0.2 : 0,
          transform: showBackdrop ? 'scale(1.03)' : 'scale(1)'
        }}
      ></div>
      
      <Header />
      
      <main className="flex-grow z-10 relative container mx-auto px-4 py-8 pt-20">
        {/* Header with back button and genre name */}
        <div className="flex items-center mb-8">
          <Link 
            to="/explore" 
            className="bg-gray-800/40 hover:bg-gray-700/60 rounded-full p-2 mr-4 transition-colors"
          >
            <i className="fas fa-arrow-left text-white"></i>
          </Link>
          <h1 className="text-4xl font-bold">{genreName} Movies</h1>
        </div>
        
        {/* Stats summary */}
        <div className="mb-8 text-gray-400">
          Found {totalMovies} {genreName} movies
        </div>
        
        {/* Sorting options */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button 
            className={`px-4 py-2 rounded-full transition-all ${
              sortBy === 'rating' 
                ? 'bg-[#E50914] text-white' 
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
            onClick={() => setSortBy('rating')}
          >
            Top Rated
          </button>
          
          <button 
            className={`px-4 py-2 rounded-full transition-all ${
              sortBy === 'popularity' 
                ? 'bg-[#E50914] text-white' 
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
            onClick={() => setSortBy('popularity')}
          >
            Most Popular
          </button>
          
          <button 
            className={`px-4 py-2 rounded-full transition-all ${
              sortBy === 'year' 
                ? 'bg-[#E50914] text-white' 
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
            onClick={() => setSortBy('year')}
          >
            Newest
          </button>
        </div>
        
        {/* No results message */}
        {paginatedMovies.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <i className="fas fa-film text-4xl text-gray-600 mb-4"></i>
            <h3 className="text-xl font-medium text-gray-400">No movies found</h3>
            <p className="text-gray-500 mt-2">Try changing your filters or check back later.</p>
          </div>
        )}
        
        {/* Movie grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {paginatedMovies.map(movie => (
            <div key={movie.id} className="h-full">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
        
        {/* Pagination controls */}
        <Pagination />
      </main>
      
      <Footer />
    </div>
  );
};

export default GenreDetail; 