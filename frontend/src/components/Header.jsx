import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("selectedMovies");
    localStorage.removeItem("user");
    navigate('/');
  };

  // Search movies when query changes
  useEffect(() => {
    const searchMovies = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      setIsSearching(true);
      try {
        // Fetch the full movie dataset
        const response = await fetch('/data/movies_dataset.json');
        const jsonText = await response.text();
        
        // Clean the JSON to handle NaN values
        const cleanedJson = jsonText.replace(/:\s*NaN\s*,/g, ': null,').replace(/:\s*NaN\s*}/g, ': null}');
        const data = JSON.parse(cleanedJson);
        
        // Filter movies by title containing the search query
        const query = searchQuery.toLowerCase();
        const filteredMovies = data
          .filter(movie => {
            const title = (movie.title || movie.name || '').toLowerCase();
            return title.includes(query);
          })
          .map(movie => ({
            id: movie.id,
            title: movie.title || movie.name || 'Untitled',
            year: movie.release_date ? movie.release_date.substring(0, 4) : '',
            poster: movie.poster_path 
              ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` 
              : '',
            rating: parseFloat(movie.vote_average) || 0
          }))
          .slice(0, 8); // Limit to 8 results
        
        setSearchResults(filteredMovies);
        setShowSearchResults(filteredMovies.length > 0);
      } catch (error) {
        console.error("Error searching movies:", error);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce search to avoid excessive API calls
    const debounceTimeout = setTimeout(() => {
      if (searchQuery) {
        searchMovies();
      }
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value) {
      setShowSearchResults(true);
    }
  };

  // Handle selecting a movie from search results
  const handleSelectMovie = (movieId) => {
    setSearchQuery('');
    setShowSearchResults(false);
    navigate(`/movie/${movieId}`);
  };

  // Handle pressing enter in search box
  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchResults.length > 0) {
      handleSelectMovie(searchResults[0].id);
    }
  };

  // Focus the search input when clicking the search icon
  const focusSearchInput = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Handle scroll event to change header background with throttling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    // Throttle scroll event for better performance
    let timeoutId;
    const throttledScroll = () => {
      if (!timeoutId) {
        timeoutId = setTimeout(() => {
          handleScroll();
          timeoutId = null;
        }, 100);
      }
    };
    
    window.addEventListener('scroll', throttledScroll);
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showDropdown) setShowDropdown(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showDropdown]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Render search results dropdown
  const renderSearchResults = () => {
    if (!showSearchResults) return null;

    return (
      <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-gray-900/95 backdrop-blur-md rounded-lg border border-gray-700 shadow-2xl z-50 max-h-[400px] overflow-y-auto">
        {isSearching ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
          </div>
        ) : searchResults.length > 0 ? (
          <ul>
            {searchResults.map((movie) => (
              <li key={movie.id} className="border-b border-gray-800 last:border-none">
                <button
                  className="w-full p-3 flex items-center space-x-3 hover:bg-white/10 transition-colors text-left"
                  onClick={() => handleSelectMovie(movie.id)}
                >
                  {movie.poster ? (
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-10 h-15 object-cover rounded"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '';
                        e.target.className = 'w-10 h-15 bg-gray-800 rounded flex items-center justify-center';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-15 bg-gray-800 rounded flex items-center justify-center text-xs text-white">
                      No Image
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-white font-medium line-clamp-1">
                      {movie.title}
                    </p>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{movie.year}</span>
                      {movie.rating > 0 && (
                        <span className="flex items-center gap-1">
                          <i className="fas fa-star text-yellow-500"></i>
                          {movie.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            ))}
            <li className="p-2 bg-gray-800/50">
              <Link 
                to={`/search?q=${encodeURIComponent(searchQuery)}`}
                className="block w-full text-center text-sm text-gray-300 hover:text-white py-1"
                onClick={() => setShowSearchResults(false)}
              >
                View all results
              </Link>
            </li>
          </ul>
        ) : (
          <div className="py-6 text-center text-gray-400">
            No movies found matching "{searchQuery}"
          </div>
        )}
      </div>
    );
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        scrolled 
          ? 'bg-black/80 backdrop-blur-md shadow-lg shadow-black/20 py-2' 
          : 'bg-gradient-to-b from-black/30 to-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            className="text-4xl font-black text-white relative group" 
            to="/"
          >
            <span className="relative z-10 bg-clip-text bg-gradient-to-r from-white to-gray-300 transition-all duration-500 group-hover:text-transparent">
              Flick<span className="text-[#E50914]">Orbit</span>
            </span>
            <span className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-0 group-hover:opacity-20 transition-all duration-500"></span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <NavLink to="/" label="Home" isActive={isActive('/')} />
            <NavLink to="/explore" label="Explore" isActive={isActive('/explore')} />
            <NavLink to="/genres" label="Genres" isActive={isActive('/genres')} />
            <NavLink to="/watchlist" label="My List" isActive={isActive('/watchlist')} />
          </nav>
          
          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden text-white text-xl p-2 rounded-md transition-all duration-300 hover:bg-white/10"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
          
          {/* Search and User Controls */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative group" ref={searchRef}>
              <input 
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchSubmit}
                placeholder="Search movies..." 
                className="w-64 h-10 px-4 pr-10 py-2 bg-black/40 text-gray-200 border border-gray-700 
                  rounded-full focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent
                  transition-all duration-300 group-hover:bg-black/60"
              />
              <button 
                onClick={focusSearchInput}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 
                group-hover:text-white transition-all duration-300">
                {isSearching ? (
                  <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin"></div>
                ) : (
                  <i className="fa-solid fa-magnifying-glass"></i>
                )}
              </button>
              
              {/* Animated search focus effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full 
                opacity-0 group-hover:opacity-100 blur-sm transition-all duration-300 -z-10"></span>
              
              {/* Search Results Dropdown */}
              {renderSearchResults()}
            </div>
            
            {/* User Menu */}
            <div className="relative">
              <div 
                className="flex justify-center items-center w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 
                  border border-white/10 rounded-full shadow-md cursor-pointer 
                  transition-all duration-300 hover:scale-110 hover:shadow-white/20 hover:shadow-sm"
                onClick={toggleDropdown}
              >
                <i className="fa-regular fa-user text-white"></i>
              </div>
              
              {/* User Dropdown Menu with Animation */}
              <div 
                className={`absolute top-[110%] right-0 transform origin-top-right transition-all duration-300 ease-in-out
                  ${showDropdown ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}
              >
                <ul className="bg-gray-900/95 backdrop-blur-md border border-gray-800 rounded-lg shadow-xl overflow-hidden
                  min-w-[170px] py-1">
                  <li>
                    <Link 
                      to="/profile" 
                      className="flex items-center px-4 py-2 text-gray-300 hover:bg-white/10 transition-colors duration-200"
                    >
                      <i className="fa-solid fa-user-circle mr-2"></i>
                      <span>Profile</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/settings" 
                      className="flex items-center px-4 py-2 text-gray-300 hover:bg-white/10 transition-colors duration-200"
                    >
                      <i className="fa-solid fa-cog mr-2"></i>
                      <span>Settings</span>
                    </Link>
                  </li>
                  <li className="border-t border-gray-700">
                    <button 
                      className="w-full text-left flex items-center px-4 py-2 text-gray-300 hover:bg-red-800/30 transition-colors duration-200"
                      onClick={handleLogout}
                    >
                      <i className="fa-solid fa-sign-out-alt mr-2"></i>
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <div 
          className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            mobileMenuOpen ? 'max-h-[300px] opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="flex flex-col space-y-2 py-3">
            <Link 
              to="/" 
              className={`px-4 py-2 text-lg font-medium transition-all duration-300 rounded-md ${
                isActive('/') ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <i className="fa-solid fa-home mr-2"></i> Home
            </Link>
            <Link 
              to="/explore" 
              className={`px-4 py-2 text-lg font-medium transition-all duration-300 rounded-md ${
                isActive('/explore') ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <i className="fa-solid fa-compass mr-2"></i> Explore
            </Link>
            <Link 
              to="/genres" 
              className={`px-4 py-2 text-lg font-medium transition-all duration-300 rounded-md ${
                isActive('/genres') ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <i className="fa-solid fa-film mr-2"></i> Genres
            </Link>
            <Link 
              to="/watchlist" 
              className={`px-4 py-2 text-lg font-medium transition-all duration-300 rounded-md ${
                isActive('/watchlist') ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <i className="fa-solid fa-bookmark mr-2"></i> My List
            </Link>
            
            {/* Mobile search */}
            <div className="px-4 py-2">
              <div className="relative">
                <input 
                  type="search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchSubmit} 
                  placeholder="Search movies..." 
                  className="w-full px-4 pr-10 py-2 bg-black/50 text-white border border-gray-700 
                    rounded-full focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  {isSearching ? (
                    <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin"></div>
                  ) : (
                    <i className="fa-solid fa-magnifying-glass"></i>
                  )}
                </button>
                
                {/* Mobile Search Results (Simplified) */}
                {showSearchResults && searchQuery && (
                  <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-gray-900/95 backdrop-blur-md rounded-lg border border-gray-700 shadow-xl z-50 max-h-[300px] overflow-y-auto">
                    {searchResults.length > 0 ? (
                      <ul>
                        {searchResults.map((movie) => (
                          <li key={movie.id} className="border-b border-gray-800 last:border-none">
                            <button
                              className="w-full px-3 py-2 text-left text-white hover:bg-white/10"
                              onClick={() => handleSelectMovie(movie.id)}
                            >
                              {movie.title} {movie.year && `(${movie.year})`}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="py-4 text-center text-gray-400">No results found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Mobile account links */}
            <div className="border-t border-gray-800 pt-2 mt-2">
              <Link 
                to="/profile" 
                className="flex items-center px-4 py-2 text-gray-300 hover:bg-white/5 transition-colors rounded-md"
              >
                <i className="fa-solid fa-user-circle mr-2"></i>
                <span>Profile</span>
              </Link>
              <button 
                className="w-full text-left flex items-center px-4 py-2 text-gray-300 hover:bg-red-800/30 transition-colors rounded-md"
                onClick={handleLogout}
              >
                <i className="fa-solid fa-sign-out-alt mr-2"></i>
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

// NavLink component for desktop menu
const NavLink = ({ to, label, isActive }) => (
  <Link
    to={to}
    className="relative px-4 py-2 text-lg font-medium transition-all duration-300 group"
  >
    <span className={`relative z-10 ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
      {label}
    </span>
    
    {/* Animated underline */}
    <span className={`absolute bottom-0 left-0 w-full h-[3px] transform transition-all duration-300 
      ${isActive 
        ? 'scale-x-100 bg-gradient-to-r from-[#E50914] to-[#ff6b6b]' 
        : 'scale-x-0 group-hover:scale-x-100 bg-white'}`}
      style={{ transformOrigin: 'left center' }}
    ></span>
    
    {/* Hover glow effect */}
    <span className="absolute inset-0 bg-white/5 scale-0 group-hover:scale-100 rounded-md blur-sm transition-all duration-300"></span>
  </Link>
);

export default Header; 