import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';

function Header() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { userData, setIsLoggedin, setUserData } = useContext(AppContent);
  
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

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setIsLoggedin(false);
        setUserData(null);
        navigate('/');
        toast.success('Logged out successfully');
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const handleVerifyAccount = async () => {
    try {
      const response = await fetch('/api/auth/send-verify-otp', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('Verification email sent successfully');
        navigate('/email-verify');
      } else {
        throw new Error('Failed to send verification email');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to send verification email');
    }
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
      if (window.scrollY > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get first letter of user's name for avatar
  const getAvatarLetter = () => {
    if (userData?.name) {
      return userData.name.charAt(0).toUpperCase();
    }
    return '?';
  };

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
          <div className="hidden lg:flex items-center justify-between w-full ml-4">
            <ul className="flex">
              <li>
                <Link 
                  to="/" 
                  className="text-lg font-semibold text-white uppercase mx-4 mt-1 relative hover:text-white after:content-[''] after:absolute after:w-0 after:h-[3px] after:bottom-[-3px] after:left-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full"
                >
                  <i className="fa-solid fa-home mr-2"></i>
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/explore" 
                  className="text-lg font-semibold text-white uppercase mx-4 mt-1 relative hover:text-white after:content-[''] after:absolute after:w-0 after:h-[3px] after:bottom-[-3px] after:left-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full"
                >
                  <i className="fa-solid fa-compass mr-2"></i>
                  Explore
                </Link>
              </li>
              <li>
                <Link 
                  to="/already-watched" 
                  className="text-lg font-semibold text-white uppercase mx-4 mt-1 relative hover:text-white after:content-[''] after:absolute after:w-0 after:h-[3px] after:bottom-[-3px] after:left-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full"
                >
                  <i className="fa-solid fa-check-circle mr-2"></i>
                  Already Watch
                </Link>
              </li>
              <li>
                <Link 
                  to="/watchlist" 
                  className="text-lg font-semibold text-white uppercase mx-4 mt-1 relative hover:text-white after:content-[''] after:absolute after:w-0 after:h-[3px] after:bottom-[-3px] after:left-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full"
                >
                  <i className="fa-solid fa-list mr-2"></i>
                  My List
                </Link>
              </li>
            </ul>
            
            <div className="flex items-center">
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
              {userData ? (
                <div className="relative ml-2">
                  <div 
                    className="flex justify-center items-center w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-full cursor-pointer transition-all hover:scale-110 text-white font-semibold text-lg"
                    onClick={toggleDropdown}
                  >
                    {getAvatarLetter()}
                  </div>
                  
                  {showDropdown && (
                    <ul className="absolute top-[110%] right-0 bg-[rgba(51,51,51,0.95)] border border-white/10 rounded shadow-md list-none p-0 min-w-[200px] z-50">
                      <li className="px-4 py-3 border-b border-white/10">
                        <p className="text-white font-medium">{userData.name}</p>
                        <p className="text-gray-400 text-sm">{userData.email}</p>
                      </li>
                      {!userData.isAccountVerified && (
                        <li>
                          <button 
                            onClick={handleVerifyAccount}
                            className="w-full text-left px-4 py-2 text-gray-300 hover:bg-white/10 hover:text-white flex items-center"
                          >
                            <i className="fa-solid fa-envelope-circle-check mr-2"></i>
                            Verify Account
                          </button>
                        </li>
                      )}
                      <li>
                        <Link 
                          to="/profile" 
                          className="block px-4 py-2 text-gray-300 hover:bg-white/10 hover:text-white"
                        >
                          <i className="fa-solid fa-user mr-2"></i>
                          Profile
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/settings" 
                          className="block px-4 py-2 text-gray-300 hover:bg-white/10 hover:text-white"
                        >
                          <i className="fa-solid fa-gear mr-2"></i>
                          Settings
                        </Link>
                      </li>
                      <li>
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-gray-300 hover:bg-white/10 hover:text-white flex items-center"
                        >
                          <i className="fa-solid fa-right-from-bracket mr-2"></i>
                          Logout
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              ) : (
                <div className="relative ml-2">
                  <div 
                    className="flex justify-center items-center w-10 h-10 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full cursor-pointer transition-all hover:scale-110 text-white font-semibold text-lg"
                    onClick={toggleDropdown}
                  >
                    <i className="fa-regular fa-user"></i>
                  </div>
                  
                  {showDropdown && (
                    <ul className="absolute top-[110%] right-0 bg-[rgba(51,51,51,0.95)] border border-white/10 rounded shadow-md list-none p-0 min-w-[200px] z-50">
                      <li>
                        <Link 
                          to="/login" 
                          className="block px-4 py-2 text-gray-300 hover:bg-white/10 hover:text-white"
                        >
                          <i className="fa-solid fa-sign-in-alt mr-2"></i>
                          Login
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/register" 
                          className="block px-4 py-2 text-gray-300 hover:bg-white/10 hover:text-white"
                        >
                          <i className="fa-solid fa-user-plus mr-2"></i>
                          Register
                        </Link>
                      </li>
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden text-white text-xl p-2 rounded-md transition-all duration-300 hover:bg-white/10"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
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
              to="/already-watched" 
              className={`px-4 py-2 text-lg font-medium transition-all duration-300 rounded-md ${
                isActive('/already-watched') ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <i className="fa-solid fa-check-circle mr-2"></i> Already Watch
            </Link>
            <Link 
              to="/watchlist" 
              className={`px-4 py-2 text-lg font-medium transition-all duration-300 rounded-md ${
                isActive('/watchlist') ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <i className="fa-solid fa-list mr-2"></i> My List
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