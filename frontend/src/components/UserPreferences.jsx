import React, { useState, useEffect } from 'react';
import { loadMovieDataset, searchMovies } from '../utils/movieDataUtils';

/**
 * Component for users to select movie preferences for recommendations
 * @param {Object} props Component props
 * @param {Array} props.initialPreferences Initial movie preferences
 * @param {Function} props.onSavePreferences Function to call when preferences are saved
 * @param {Function} props.onClose Function to call when preferences are closed
 */
function UserPreferences({ initialPreferences = [], onSavePreferences, onClose }) {
  const [searchInput, setSearchInput] = useState('');
  const [preferences, setPreferences] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showPopular, setShowPopular] = useState(false);
  const [movieDataset, setMovieDataset] = useState([]);
  const [isLoadingDataset, setIsLoadingDataset] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  
  // Load movie dataset on component mount
  useEffect(() => {
    const fetchMovieDataset = async () => {
      setIsLoadingDataset(true);
      try {
        const data = await loadMovieDataset();
        setMovieDataset(data);
      } catch (error) {
        console.error('Failed to load movie dataset:', error);
      } finally {
        setIsLoadingDataset(false);
      }
    };

    fetchMovieDataset();
  }, []);

  // Handle search input changes
  useEffect(() => {
    if (searchInput.trim() !== '') {
      const results = searchMovies(movieDataset, searchInput);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchInput, movieDataset]);
  
  // Popular/Featured movies
  const popularMovieNames = [
    'The Matrix',
    'Titanic',
    'Avatar',
    'Forrest Gump',
    'The Lord of the Rings',
    'Star Wars',
    'Jurassic Park',
    'Harry Potter',
    'The Lion King',
    'Inception',
    'The Dark Knight',
    'The Godfather',
    'Pulp Fiction',
    'Fight Club',
    'The Shawshank Redemption'
  ];
  
  // Get popular movies from dataset
  const popularMovies = popularMovieNames
    .map(name => {
      const foundMovie = movieDataset.find(
        movie => movie.original_title.toLowerCase() === name.toLowerCase()
      );
      if (foundMovie) {
        return {
          id: foundMovie.id,
          title: name
        };
      }
      return null;
    })
    .filter(movie => movie !== null);
  
  // Load and format initial preferences
  useEffect(() => {
    // Convert string preferences to objects with id and title
    const formattedPrefs = initialPreferences.map(pref => {
      if (typeof pref === 'object' && pref.id && pref.title) {
        return pref;
      }
      
      // Try to find the movie in dataset
      const foundMovie = movieDataset.find(
        m => m.original_title.toLowerCase() === (typeof pref === 'string' ? pref.toLowerCase() : '')
      );
      
      if (foundMovie) {
        return {
          id: foundMovie.id,
          title: pref
        };
      }
      
      // Fallback for movies not in dataset
      return {
        id: `custom-${pref}`,
        title: pref
      };
    });
    
    setPreferences(formattedPrefs);
  }, [initialPreferences, movieDataset]);
  
  const handleAddPreference = (movie) => {
    // Check if movie already exists in preferences
    if (!preferences.some(p => p.id === movie.id)) {
      const updatedPreferences = [...preferences, movie];
      setPreferences(updatedPreferences);
      
      // Update user preferences in localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ 
        ...user, 
        preferences: updatedPreferences.map(p => p.title)
      }));
      
      // Also update selectedMovies in localStorage for API recommendations
      localStorage.setItem('selectedMovies', JSON.stringify(updatedPreferences));
    }
    
    // Clear input and hide suggestions
    setSearchInput('');
    setShowSuggestions(false);
  };
  
  const handleRemovePreference = (movieId) => {
    const updatedPreferences = preferences.filter(p => p.id !== movieId);
    setPreferences(updatedPreferences);
    
    // Update user preferences in localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({ 
      ...user, 
      preferences: updatedPreferences.map(p => p.title)
    }));
    
    // Also update selectedMovies in localStorage for API recommendations
    localStorage.setItem('selectedMovies', JSON.stringify(updatedPreferences));
  };
  
  const handleUpdateRecommendations = () => {
    // Save the current preferences to localStorage
    localStorage.setItem('selectedMovies', JSON.stringify(preferences));
    
    // Call the callback if provided
    if (onSavePreferences) {
      onSavePreferences(preferences.map(p => p.title));
    }
    
    // Close the preferences modal if this is in a modal
    if (onClose) {
      onClose();
    }
  };
  
  return (
    <div className="bg-[#181818] rounded-lg p-6 mb-8">
      <h3 className="text-xl font-bold mb-4">Your Movie Preferences</h3>
      <p className="text-gray-400 mb-4">Select movies you like to get better recommendations</p>
      
      {isLoadingDataset ? (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700"></div>
          <span className="ml-2 text-gray-400">Loading movie database...</span>
        </div>
      ) : (
        <>
          <div className="relative mb-4">
            <div className="flex gap-2 mb-3">
              <button
                className={`px-4 py-2 rounded ${showPopular ? 'bg-red-600 text-white' : 'bg-[#333] text-gray-300'}`}
                onClick={() => setShowPopular(!showPopular)}
              >
                {showPopular ? 'Hide Popular Movies' : 'Show Popular Movies'}
              </button>
              
              {preferences.length > 0 && (
                <button
                  className="px-4 py-2 rounded bg-[#333] text-gray-300 hover:bg-[#444]"
                  onClick={handleUpdateRecommendations}
                >
                  Update Recommendations
                </button>
              )}
            </div>
            
            <input
              type="text"
              placeholder="Search for a movie..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => {
                setShowSuggestions(true);
                setShowPopular(false);
              }}
              className="w-full bg-[#333] text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            
            {showSuggestions && searchInput.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-[#333] border border-gray-700 rounded shadow-lg max-h-60 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((movie) => (
                    <div
                      key={movie.id}
                      className="px-4 py-2 hover:bg-[#444] cursor-pointer"
                      onClick={() => handleAddPreference(movie)}
                    >
                      {movie.title}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-400">No movies found</div>
                )}
              </div>
            )}
          </div>
          
          {showPopular && (
            <div className="mb-6 mt-2 bg-[#222] p-4 rounded max-h-60 overflow-y-auto">
              <h4 className="text-sm text-gray-300 mb-3">Popular Movies</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {popularMovies.map((movie) => (
                  <div
                    key={movie.id}
                    className={`px-3 py-2 text-sm rounded cursor-pointer transition-all ${
                      preferences.some(p => p.id === movie.id)
                        ? 'bg-red-700 text-white' 
                        : 'bg-[#333] text-gray-300 hover:bg-[#444]'
                    }`}
                    onClick={() => 
                      preferences.some(p => p.id === movie.id)
                        ? handleRemovePreference(movie.id) 
                        : handleAddPreference(movie)
                    }
                  >
                    <div className="flex items-center">
                      <span className="truncate">{movie.title}</span>
                      {preferences.some(p => p.id === movie.id) && (
                        <span className="ml-auto">✓</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <h4 className="text-sm text-gray-300 mb-2">Your Selected Movies</h4>
            <div className="flex flex-wrap gap-2">
              {preferences.map((movie) => (
                <div 
                  key={movie.id} 
                  className="bg-[#333] px-3 py-1 rounded-full flex items-center"
                >
                  <span className="text-sm">{movie.title}</span>
                  <button 
                    className="ml-2 text-gray-400 hover:text-white"
                    onClick={() => handleRemovePreference(movie.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
              
              {preferences.length === 0 && (
                <p className="text-gray-500 text-sm">No preferences selected. Add some movies to get personalized recommendations.</p>
              )}
            </div>
          </div>
          
          {preferences.length > 0 && (
            <div className="mt-4">
              <button
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-2 px-4 rounded font-semibold hover:from-red-700 hover:to-red-800 transition-colors"
                onClick={handleUpdateRecommendations}
              >
                Update Recommendations
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default UserPreferences; 