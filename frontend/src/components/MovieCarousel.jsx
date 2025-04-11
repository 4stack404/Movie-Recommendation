import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPosterPath, getBackdropPath } from '../utils/movieUtils';

const MovieCarousel = ({ movies, onAddToWatchlist }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-rotate carousel every 6 seconds
  useEffect(() => {
    if (movies.length <= 1) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);
    
    return () => clearInterval(interval);
  }, [currentSlide, movies.length]);

  const nextSlide = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === movies.length - 1 ? 0 : prev + 1));
    
    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === 0 ? movies.length - 1 : prev - 1));
    
    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  const goToSlide = (index) => {
    if (isTransitioning || index === currentSlide) return;
    
    setIsTransitioning(true);
    setCurrentSlide(index);
    
    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full overflow-hidden">
      {/* Carousel slides */}
      <div 
        className="flex transition-transform duration-500 ease-in-out h-[600px] sm:h-[500px] md:h-[600px] lg:h-[700px]"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {movies.map((movie, index) => (
          <div key={index} className="w-full flex-shrink-0 relative">
            {/* Backdrop image */}
            <div className="absolute inset-0 bg-black">
              <img 
                src={movie.backdrop_path || getBackdropPath(movie) || `https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg`}
                alt={movie.title || movie.Title || ''} 
                className="w-full h-full object-cover opacity-60"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent"></div>
            </div>
            
            {/* Content */}
            <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-16 lg:px-24 max-w-7xl mx-auto">
              <div className="max-w-lg">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white">{movie.title || movie.Title}</h1>
                
                <div className="flex items-center gap-3 mb-4">
                  {movie.rating > 0 && (
                    <span className="flex items-center gap-1 bg-yellow-500 text-black px-2 py-1 rounded-md font-semibold">
                      <i className="fa-solid fa-star"></i> 
                      {movie.rating.toFixed(1)}
                    </span>
                  )}
                  
                  <span className="text-gray-300">{movie.release_date || movie.Year}</span>
                  
                  {movie.genres && movie.genres.length > 0 && (
                    <span className="text-gray-300 border border-gray-600 px-2 py-1 rounded">
                      {movie.genres.slice(0, 2).join(', ')}
                    </span>
                  )}
                </div>
                
                <p className="text-gray-300 mb-6 line-clamp-3 md:line-clamp-4">
                  {movie.overview || movie.Plot || ''}
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Link 
                    to={`/movie/${movie.id}`} 
                    className="bg-[#E50914] hover:bg-red-700 text-white py-3 px-6 rounded-md font-semibold transition-colors duration-300 flex items-center gap-2"
                  >
                    <i className="fa-solid fa-play"></i> 
                    Watch Now
                  </Link>
                  
                  <button 
                    onClick={() => onAddToWatchlist && onAddToWatchlist(movie)}
                    className="bg-gray-800 hover:bg-gray-700 text-white py-3 px-6 rounded-md font-semibold transition-colors duration-300 flex items-center gap-2"
                  >
                    <i className="fa-solid fa-plus"></i> 
                    Add to Watchlist
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Navigation arrows */}
      {movies.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 z-20"
            disabled={isTransitioning}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 z-20"
            disabled={isTransitioning}
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
          
          {/* Dots indicators */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
            {movies.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MovieCarousel; 