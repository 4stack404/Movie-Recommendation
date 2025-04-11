import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContent } from '../context/AppContext';
import { loadMovieDataset, searchMovies } from '../utils/movieDataUtils';

const FavoriteMovies = () => {
  const navigate = useNavigate();
  const { userData, setUserData } = useContext(AppContent);
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [movieDataset, setMovieDataset] = useState([]);

  // Load movie dataset on component mount
  useEffect(() => {
    const fetchMovieDataset = async () => {
      setLoading(true);
      try {
        const data = await loadMovieDataset();
        setMovieDataset(data);
      } catch (error) {
        console.error('Failed to load movie dataset:', error);
        toast.error('Failed to load movies');
      } finally {
        setLoading(false);
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

  const handleMovieToggle = (movie) => {
    if (selectedMovies.some(m => m.id === movie.id)) {
      setSelectedMovies(selectedMovies.filter(m => m.id !== movie.id));
    } else {
      setSelectedMovies([...selectedMovies, movie]);
    }
  };

  const handleAddFromSearch = (movie) => {
    if (!selectedMovies.some(m => m.id === movie.id)) {
      setSelectedMovies([...selectedMovies, movie]);
    }
    setSearchInput('');
  };

  const handleSubmit = async () => {
    if (selectedMovies.length === 0) {
      toast.error('Please select at least one movie');
      return;
    }

    try {
      const response = await fetch('/api/user/update-preferences', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          moviePreferences: selectedMovies.map(movie => movie.id)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }

      const data = await response.json();
      if (data.success) {
        toast.success('Preferences updated successfully!');
        setUserData(prev => ({
          ...prev,
          preferences: selectedMovies
        }));
        navigate('/home');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white font-[Montserrat] flex flex-col">
      <main className="flex-1 py-10 px-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-purple-600 mb-2">FlickOrbit</h1>
            <p className="text-gray-400">Select your favorite movies</p>
          </div>

          <div className="bg-[#181818] rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-bold mb-4">Select Your Favorite Movies</h2>
            <p className="text-gray-400 mb-6">This helps us recommend movies you'll love. Search for movies you enjoy.</p>
            
            {/* Movie search box */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search for movies..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-[#333] text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {searchResults.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-[#333] border border-gray-700 rounded shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((movie) => (
                    <div
                      key={movie.id}
                      className="px-4 py-2 hover:bg-[#444] cursor-pointer"
                      onClick={() => handleAddFromSearch(movie)}
                    >
                      {movie.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Selected movies */}
            <div className="mb-6">
              <h3 className="text-gray-300 mb-3">Your Selected Movies:</h3>
              {selectedMovies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedMovies.map((movie) => (
                    <div 
                      key={movie.id} 
                      className="bg-red-700 text-white px-3 py-1 rounded-full flex items-center"
                    >
                      <span className="text-sm">{movie.title}</span>
                      <button 
                        className="ml-2 text-white/80 hover:text-white"
                        onClick={() => handleMovieToggle(movie)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No movies selected. Search and select movies above.</p>
              )}
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-[#333] text-white rounded hover:bg-[#444]"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className={`px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded font-semibold transition-colors ${
                  selectedMovies.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:from-red-700 hover:to-red-800'
                }`}
                disabled={selectedMovies.length === 0}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FavoriteMovies; 