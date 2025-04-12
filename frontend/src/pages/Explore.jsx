import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MovieCarousel from '../components/MovieCarousel';
import axios from 'axios';

const Explore = () => {
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState([]);
  const [genreSections, setGenreSections] = useState({});
  const [carouselMovies, setCarouselMovies] = useState([]);
  const [latestMovies, setLatestMovies] = useState([]);
  const [backdropImage, setBackdropImage] = useState('');
  const [showBackdrop, setShowBackdrop] = useState(false);
  // Track scrolling positions for each genre
  const [scrollPositions, setScrollPositions] = useState({});
  // Track how many movies to show per genre
  const [visibleMovieCounts, setVisibleMovieCounts] = useState({});
  
  // References to scroll containers
  const scrollContainerRefs = useRef({});
  // Store the full movie lists by genre
  const fullGenreMoviesRef = useRef({});

  // Initial number of movies to show
  const INITIAL_MOVIES_COUNT = 20;
  // How many more to load when scrolling
  const LOAD_MORE_COUNT = 0; // Disabled as we're now using "Show More" button instead

  // Popular genre categories to display
  const featuredGenres = [
    "Action", 
    "Adventure",
    "Animation",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Family",
    "Fantasy",
    "History",
    "Horror",
    "Music",
    "Mystery",
    "Romance",
    "Science Fiction",
    "Thriller",
    "TV Movie",
    "War",
    "Western"
  ];

  // Track loading state for each genre row when scrolling
  const [scrollLoading, setScrollLoading] = useState({});
  // Track scroll direction for loading indicators
  const [scrollDirection, setScrollDirection] = useState({});
  // Store preloaded images
  const preloadedImagesRef = useRef({});

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
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
          const releaseYear = movie.release_date ? parseInt(movie.release_date.substring(0, 4)) : 0;
          
          return {
            ...movie,
            genres,
            rating,
            popularity,
            releaseYear,
            // Use consistent property names
            title: movie.title || movie.name,
            Year: movie.release_date ? movie.release_date.substring(0, 4) : '',
            Poster: movie.poster_path 
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
              : '',
            backdrop_path: movie.backdrop_path 
              ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` 
              : 'https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg'
          };
        });
        
        setMovies(moviesData);
        
        // Get top 5 highly rated movies for carousel
        const topRatedMovies = [...moviesData]
          .filter(movie => movie.rating > 7.5 && movie.popularity > 50)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 5);
          
        setCarouselMovies(topRatedMovies);
        
        // Get latest released movies (last 3 years) with good quality posters/backdrops
        const currentYear = new Date().getFullYear();
        const latestReleases = [...moviesData]
          .filter(movie => 
            movie.releaseYear >= currentYear - 3 && 
            movie.popularity > 30 && 
            movie.backdrop_path && 
            !movie.backdrop_path.includes('placeholder') &&
            movie.overview && 
            movie.overview.length > 100
          )
          .sort((a, b) => {
            // Sort by year first, then by popularity
            if (b.releaseYear !== a.releaseYear) {
              return b.releaseYear - a.releaseYear;
            }
            return b.popularity - a.popularity;
          })
          .slice(0, 5);
          
        setLatestMovies(latestReleases);
        
        // Create genre sections with initial counts
        const genreMoviesMap = {};
        const initialVisibleCounts = {};
        const fullGenreMovies = {};
        
        // Populate each genre with its movies
        featuredGenres.forEach(genre => {
          const genreMovies = moviesData.filter(movie => 
            Array.isArray(movie.genres) && movie.genres.includes(genre)
          );
          
          // Sort by a combination of rating and popularity
          const sortedMovies = genreMovies
            .sort((a, b) => {
              const scoreA = (a.rating * 0.7) + (a.popularity * 0.3);
              const scoreB = (b.rating * 0.7) + (b.popularity * 0.3);
              return scoreB - scoreA;
            });
            
          if (sortedMovies.length > 0) {
            // Store the full list for reference
            fullGenreMovies[genre] = sortedMovies;
            // Show only the initial set of movies (strictly capped at INITIAL_MOVIES_COUNT)
            genreMoviesMap[genre] = sortedMovies.slice(0, Math.min(INITIAL_MOVIES_COUNT, sortedMovies.length));
            // Set the initial count
            initialVisibleCounts[genre] = Math.min(INITIAL_MOVIES_COUNT, sortedMovies.length);
          }
        });
        
        fullGenreMoviesRef.current = fullGenreMovies;
        setGenreSections(genreMoviesMap);
        setVisibleMovieCounts(initialVisibleCounts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching movies:", error);
        setLoading(false);
      }
    };
    
    fetchMovies();
  }, []);

  // Load more movies for a genre when scrolling to the end
  const loadMoreMovies = (genre) => {
    // This function is now disabled as we're using the "Show More" button
    // that redirects to the genre page instead of loading more movies inline
    return;
  };

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

  // Preload images for the next batch of movies
  const preloadImages = useCallback((genre, direction) => {
    const container = scrollContainerRefs.current[genre];
    if (!container) return;
    
    // Get visible movie elements
    const movieElements = container.querySelectorAll('.movie-card-container');
    if (!movieElements.length) return;
    
    const containerWidth = container.clientWidth;
    const scrollPosition = container.scrollLeft;
    
    // Determine which movies are visible
    let visibleEndIndex = 0;
    let totalWidth = 0;
    
    for (let i = 0; i < movieElements.length; i++) {
      const movieElement = movieElements[i];
      totalWidth += movieElement.offsetWidth + 16; // width + margin
      
      if (totalWidth > scrollPosition + containerWidth) {
        visibleEndIndex = i;
        break;
      }
    }
    
    // Calculate preload range based on scroll direction
    let startPreloadIndex, endPreloadIndex;
    if (direction === 'right') {
      startPreloadIndex = visibleEndIndex;
      endPreloadIndex = Math.min(startPreloadIndex + 8, movieElements.length - 1);
    } else {
      endPreloadIndex = Math.max(0, visibleEndIndex - 8);
      startPreloadIndex = Math.max(0, endPreloadIndex - 8);
    }
    
    // Create array if it doesn't exist yet
    if (!preloadedImagesRef.current[genre]) {
      preloadedImagesRef.current[genre] = [];
    }
    
    // Preload images
    for (let i = startPreloadIndex; i <= endPreloadIndex; i++) {
      const movieElement = movieElements[i];
      if (!movieElement) continue;
      
      const poster = movieElement.querySelector('img');
      if (poster && poster.src) {
        const img = new Image();
        img.src = poster.src;
        preloadedImagesRef.current[genre].push(img);
      }
    }
  }, []);

  // Handle scroll navigation for genre rows with improved performance
  const scrollGenreMovies = (genre, direction) => {
    const container = scrollContainerRefs.current[genre];
    if (!container || scrollLoading[genre]) return;
    
    // Set loading state and direction for this genre
    setScrollLoading(prev => ({ ...prev, [genre]: true }));
    setScrollDirection(prev => ({ ...prev, [genre]: direction }));
    
    // Preload images before scrolling
    preloadImages(genre, direction);
    
    // Get screen width to determine scroll behavior
    const screenWidth = window.innerWidth;
    
    // Calculate scroll amount based on container width and screen size
    const containerWidth = container.clientWidth;
    
    // Calculate number of cards visible and card width based on screen size
    let cardWidth;
    if (screenWidth < 640) { // mobile
      cardWidth = 140 + 8; // card width + gap (140px + 8px gap)
    } else if (screenWidth < 768) { // small tablet
      cardWidth = 160 + 12; // card width + gap (160px + 12px gap)
    } else if (screenWidth < 1024) { // large tablet
      cardWidth = 180 + 16; // card width + gap (180px + 16px gap)
    } else { // desktop
      cardWidth = 200 + 16; // card width + gap (200px + 16px gap)
    }
    
    // Calculate number of full cards to scroll (between 1-4 depending on screen size)
    let cardsToScroll = Math.floor(containerWidth / cardWidth);
    cardsToScroll = Math.max(1, Math.min(4, cardsToScroll - 1)); // Ensure between 1-4 cards, with overlap
    
    // Calculate exact pixels to scroll
    const scrollAmount = cardsToScroll * cardWidth;
    const currentScroll = container.scrollLeft;
    
    // Small delay to allow images to preload and show loading indicator
    setTimeout(() => {
      if (direction === 'left') {
        container.scrollTo({
          left: Math.max(0, currentScroll - scrollAmount),
          behavior: 'smooth'
        });
      } else {
        container.scrollTo({
          left: currentScroll + scrollAmount,
          behavior: 'smooth'
        });
      }
      
      // Update scroll position to control arrow visibility
      setScrollPositions(prev => ({
        ...prev,
        [genre]: container.scrollLeft
      }));
      
      // Remove loading state after scroll animation completes
      setTimeout(() => {
        setScrollLoading(prev => ({ ...prev, [genre]: false }));
      }, 400); // Slightly longer than the scroll animation
    }, 250);
  };
  
  // Check if we can scroll in a direction for a genre
  const canScroll = (genre, direction) => {
    const container = scrollContainerRefs.current[genre];
    if (!container) return false;
    
    const { scrollLeft, scrollWidth, clientWidth } = container;
    
    // For left, check if we're at the beginning
    if (direction === 'left') {
      return scrollLeft > 0;
    } 
    // For right, check if we're at the end
    else {
      // Allow 10px margin of error for browser rounding issues
      return scrollLeft + clientWidth < scrollWidth - 10;
    }
  };

  // Movie card component for reusability
  const MovieCard = ({ movie }) => {
    const [imageError, setImageError] = useState(false);
    
    // Generate a consistent background color based on movie title
    const getColorFromTitle = (title) => {
      if (!title) return 'rgb(31, 41, 55)'; // default dark gray
      
      // Simple hash function to get a number from a string
      let hash = 0;
      for (let i = 0; i < title.length; i++) {
        hash = title.charCodeAt(i) + ((hash << 5) - hash);
      }
      
      // Generate hsl color with consistent saturation and lightness
      const hue = hash % 360;
      return `hsl(${hue}, 70%, 25%)`; // dark but colorful background
    };
    
    const backgroundColor = getColorFromTitle(movie.title);
    
    return (
      <Link
        to={`/movie/${movie.id}`}
        className="block min-w-[140px] sm:min-w-[160px] md:min-w-[180px] lg:min-w-[200px] group relative"
      >
        <div 
          className="bg-gray-900 rounded-lg overflow-hidden shadow-lg relative h-full
          transform transition-all duration-300 origin-center
          group-hover:scale-105 group-hover:shadow-xl group-hover:z-30"
          onMouseEnter={() => handleCardHover(movie.backdrop_path)}
          onMouseLeave={handleCardLeave}
        >
          {/* Main card content */}
          <div className="relative aspect-[2/3] overflow-hidden">
            {movie.Poster && !imageError ? (
              <img 
                src={movie.Poster} 
                alt={movie.title || 'Movie poster'} 
                className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-90"
                loading="lazy"
                onError={() => setImageError(true)}
              />
            ) : (
              <div 
                className="w-full h-full flex flex-col items-center justify-center text-center p-2 sm:p-3 md:p-4 transition-all duration-300 group-hover:brightness-90"
                style={{ background: backgroundColor }}
              >
                <div className="text-white font-bold text-sm sm:text-base md:text-lg leading-tight mt-auto text-center">
                  {movie.title || 'Untitled'}
                </div>
                
                {movie.Year && (
                  <div className="text-white/80 text-xs sm:text-sm mb-auto mt-1 sm:mt-2">
                    {movie.Year}
                  </div>
                )}
                
                {movie.genres && Array.isArray(movie.genres) && movie.genres.length > 0 && (
                  <div className="absolute bottom-2 left-0 right-0 text-center">
                    <span className="text-xs text-white/60 px-2 py-1 bg-black/30 rounded-full">
                      {movie.genres[0]}
                    </span>
                  </div>
                )}
              </div>
            )}
            
            {/* Badge for rating */}
            {movie.rating > 0 && (
              <div className="absolute top-2 right-2 z-20 bg-yellow-500 text-black font-bold px-1 py-0.5 sm:px-2 sm:py-1 rounded-md shadow-lg flex items-center gap-1 text-xs sm:text-sm">
                <i className="fas fa-star text-xs"></i>
                <span>{movie.rating.toFixed(1)}</span>
              </div>
            )}
            
            {/* Bottom info bar - visible always (only when image is shown) */}
            {movie.Poster && !imageError && (
              <div className="absolute bottom-0 inset-x-0 p-2 sm:p-3 bg-gradient-to-t from-black to-transparent">
                <h3 
                  className="font-bold text-white text-sm sm:text-base line-clamp-1" 
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                >
                  {movie.title || 'Untitled'}
                </h3>
                <span className="text-xs text-gray-300">{movie.Year || 'N/A'}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Expanded hover card - only visible on desktop */}
        <div className="absolute inset-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible 
          transition-all duration-300 delay-700 transform translate-y-2 group-hover:translate-y-0 
          pointer-events-none z-40 hidden lg:block">
          <div className="absolute -inset-3 bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-4 flex flex-col h-full">
              <h3 className="font-bold text-lg text-white mb-1">{movie.title}</h3>
              
              <div className="flex items-center text-sm space-x-2 mb-2">
                <span className="text-gray-400">{movie.Year}</span>
                {movie.rating > 0 && (
                  <span className="flex items-center text-yellow-500">
                    <i className="fas fa-star mr-1"></i>
                    <span>{movie.rating.toFixed(1)}</span>
                  </span>
                )}
              </div>
              
              {movie.overview && (
                <p className="text-gray-300 text-sm line-clamp-3 mb-auto">
                  {movie.overview}
                </p>
              )}
              
              {movie.genres && Array.isArray(movie.genres) && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {movie.genres.slice(0, 3).map((genre, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-gray-800 text-white/80 rounded-full">
                      {genre}
                    </span>
                  ))}
                </div>
              )}
              
              <button 
                className="mt-3 bg-white/10 hover:bg-white/20 text-white text-sm py-1.5 rounded-md
                  transition-colors pointer-events-auto flex items-center justify-center"
              >
                <i className="fas fa-info-circle mr-1.5"></i>
                View Details
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  // Latest Movies Hero Carousel Component
  const LatestMoviesHero = () => {
    const [activeSlide, setActiveSlide] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const autoplayRef = useRef(null);
    
    // Auto-advance slides if not hovering
    useEffect(() => {
      const startAutoplay = () => {
        autoplayRef.current = setInterval(() => {
          if (!isHovering) {
            setActiveSlide(prev => (prev + 1) % latestMovies.length);
          }
        }, 6000);
      };
      
      startAutoplay();
      
      return () => {
        if (autoplayRef.current) {
          clearInterval(autoplayRef.current);
        }
      };
    }, [isHovering, latestMovies.length]);
    
    const pauseCarousel = () => {
      setIsHovering(true);
    };
    
    const resumeCarousel = () => {
      setIsHovering(false);
    };
    
    const goToSlide = (index) => {
      setActiveSlide(index);
    };
    
    return (
      <div 
        className="relative w-full"
        onMouseEnter={pauseCarousel}
        onMouseLeave={resumeCarousel}
      >
        {/* Carousel Slides */}
        <div className="relative w-full h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden bg-black">
          {latestMovies.map((movie, index) => (
            <div 
              key={movie.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* Backdrop Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${movie.backdrop_path})` }}
              ></div>
              
              {/* Gradient overlays for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-transparent opacity-100"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D] via-[#0D0D0D]/20 to-transparent opacity-80"></div>
              
              {/* Movie information overlay */}
              <div className="absolute bottom-0 left-0 w-full px-4 sm:px-8 md:px-16 pb-8 sm:pb-12 md:pb-16 z-20">
                <div className="container mx-auto">
                  <div className="w-full md:w-2/3 lg:w-1/2">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2 md:mb-3 text-white leading-tight">
                      {movie.title}
                    </h2>
                    
                    <div className="flex items-center space-x-2 sm:space-x-4 mb-2 sm:mb-3 md:mb-4 text-sm sm:text-base">
                      <span className="text-gray-300">{movie.Year}</span>
                      
                      {movie.rating > 0 && (
                        <span className="flex items-center text-yellow-500">
                          <i className="fas fa-star mr-1"></i>
                          <span>{movie.rating.toFixed(1)}</span>
                        </span>
                      )}
                      
                      {movie.runtime && <span className="text-gray-300">{movie.runtime} min</span>}
                    </div>
                    
                    {/* Genres */}
                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                      {movie.genres && Array.isArray(movie.genres) && movie.genres.map((genre, idx) => (
                        <Link 
                          key={idx} 
                          to={`/genre/${genre.toLowerCase()}`}
                          className="px-2 py-1 bg-gray-800/60 hover:bg-gray-700 text-white text-xs sm:text-sm rounded-full transition-colors"
                        >
                          {genre}
                        </Link>
                      ))}
                    </div>
                    
                    {/* Overview */}
                    <p className="text-gray-200 mb-4 sm:mb-6 text-sm sm:text-base line-clamp-2 sm:line-clamp-3 md:line-clamp-4 lg:line-clamp-5">
                      {movie.overview}
                    </p>
                    
                    {/* Action buttons */}
                    <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-4">
                      <Link 
                        to={`/movie/${movie.id}`}
                        className="px-4 py-2 sm:px-6 sm:py-3 bg-[#E50914] hover:bg-red-700 text-white text-sm sm:text-base font-medium rounded-md transition-colors flex items-center justify-center"
                      >
                        <i className="fas fa-play mr-2"></i> More Details
                      </Link>
                      
                      <button 
                        onClick={() => addToWatchlist(movie)}
                        className="px-4 py-2 sm:px-6 sm:py-3 bg-gray-800 hover:bg-gray-700 text-white text-sm sm:text-base font-medium rounded-md transition-colors flex items-center justify-center"
                      >
                        <i className="fas fa-plus mr-2"></i> Add to List
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Navigation Indicators */}
        {latestMovies.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center space-x-2">
            {latestMovies.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
                  index === activeSlide 
                    ? 'bg-white scale-125' 
                    : 'bg-gray-500 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
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
      
      <main className="flex-grow z-10 relative pt-0">
        {/* Latest Movies Hero Carousel */}
        <section className="w-full">
          <LatestMoviesHero />
        </section>
        
        {/* Genre Sections */}
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8 border-b border-gray-800 pb-4 mt-4">Explore Movies by Genre</h2>
          
          {Object.entries(genreSections).map(([genre, movies]) => (
            <div key={genre} className="mb-6 sm:mb-8 md:mb-10">
              <div className="flex justify-between items-center mb-2 sm:mb-4">
                <Link to={`/genre/${genre.toLowerCase()}`} className="group">
                  <h3 className="text-xl sm:text-2xl font-bold group-hover:text-[#E50914] transition-colors">
                    {genre} 
                    <span className="inline-block ml-2 transform transition-transform group-hover:translate-x-1">
                      <i className="fas fa-chevron-right text-xs sm:text-sm"></i>
                    </span>
                  </h3>
                </Link>
                
                <div className="flex space-x-1 sm:space-x-2">
                  <button 
                    onClick={() => scrollGenreMovies(genre, 'left')}
                    className={`p-1 sm:p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/80 transition-colors relative ${
                      !canScroll(genre, 'left') || scrollLoading[genre] ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={!canScroll(genre, 'left') || scrollLoading[genre]}
                    aria-label="Scroll left"
                  >
                    {scrollLoading[genre] && scrollDirection[genre] === 'left' ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-white rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <i className="fas fa-chevron-left text-sm sm:text-base"></i>
                    )}
                  </button>
                  <button 
                    onClick={() => scrollGenreMovies(genre, 'right')}
                    className={`p-1 sm:p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/80 transition-colors relative ${
                      !canScroll(genre, 'right') || scrollLoading[genre] ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={!canScroll(genre, 'right') || scrollLoading[genre]}
                    aria-label="Scroll right"
                  >
                    {scrollLoading[genre] && scrollDirection[genre] === 'right' ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-white rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <i className="fas fa-chevron-right text-sm sm:text-base"></i>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="relative">
                <div 
                  className="flex space-x-2 sm:space-x-3 md:space-x-4 overflow-x-hidden overflow-y-hidden py-2 sm:py-4 scrollbar-hide genre-row"
                  ref={el => { scrollContainerRefs.current[genre] = el; }}
                  onScroll={() => {
                    // Update scroll position to control arrow visibility
                    if (scrollContainerRefs.current[genre]) {
                      setScrollPositions(prev => ({
                        ...prev,
                        [genre]: scrollContainerRefs.current[genre].scrollLeft
                      }));
                    }
                  }}
                >
                  {/* Add shadow fade effect on the sides */}
                  <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-12 z-10 pointer-events-none bg-gradient-to-r from-[#0D0D0D] to-transparent"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-12 z-10 pointer-events-none bg-gradient-to-l from-[#0D0D0D] to-transparent"></div>
                  
                  {movies.map(movie => (
                    <div key={movie.id} className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] movie-card-container">
                      <MovieCard movie={movie} />
                    </div>
                  ))}
                  
                  {/* Show More Button */}
                  {fullGenreMoviesRef.current[genre]?.length > INITIAL_MOVIES_COUNT && (
                    <div className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] flex items-center justify-center">
                      <Link 
                        to={`/genre/${genre.toLowerCase()}`}
                        className="bg-gray-800/70 hover:bg-gray-700 text-white w-full h-[calc(100%-0.5rem)] rounded-lg flex flex-col items-center justify-center transition-all hover:scale-105 shadow-md group"
                      >
                        <span className="text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2 group-hover:scale-110 transition-transform">
                          <i className="fas fa-angle-right"></i>
                        </span>
                        <span className="font-medium text-xs sm:text-sm">Show All</span>
                      </Link>
                    </div>
                  )}
                  
                  {/* Loading indicator overlay during scrolling */}
                  {scrollLoading[genre] && (
                    <div className="absolute inset-0 bg-black/5 flex items-center justify-center z-20 pointer-events-none">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 border-t-2 border-white rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Explore; 