import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContent } from '../context/AppContext';
import { loadMovieDataset, searchMovies } from '../utils/movieDataUtils';

const GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Family', 'Fantasy', 'History',
  'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction',
  'TV Movie', 'Thriller', 'War', 'Western'
];

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian',
  'Japanese', 'Korean', 'Chinese', 'Hindi', 'Russian'
];

const FavoriteMovies = () => {
  const navigate = useNavigate();
  const { userData, setUserData } = useContext(AppContent);
  const [step, setStep] = useState(1); // 1: Movies, 2: Genres, 3: Languages
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [movieDataset, setMovieDataset] = useState([]);

  // Load movie dataset on component mount
  useEffect(() => {
    const fetchMovieDataset = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await loadMovieDataset();
        console.log('Dataset loaded in component:', data.length, 'movies'); // Debug log
        setMovieDataset(data);
      } catch (error) {
        console.error('Failed to load movie dataset:', error);
        setError('Failed to load movies. Please try refreshing the page.');
        toast.error('Failed to load movies');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDataset();
  }, []);

  // Handle search input changes
  useEffect(() => {
    if (!movieDataset.length) return;

    const updateSearchResults = () => {
      console.log('Searching with input:', searchInput); // Debug log
      const results = searchMovies(movieDataset, searchInput);
      console.log('Search results:', results); // Debug log
      setSearchResults(results);
    };

    // Debounce the search to avoid too many updates
    const timeoutId = setTimeout(updateSearchResults, 150);
    return () => clearTimeout(timeoutId);
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
    setSearchResults([]); // Clear search results after selection
  };

  const handleGenreToggle = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleLanguageToggle = (language) => {
    if (selectedLanguages.includes(language)) {
      setSelectedLanguages(selectedLanguages.filter(l => l !== language));
    } else {
      setSelectedLanguages([...selectedLanguages, language]);
    }
  };

  const handleNext = () => {
    if (step === 1 && selectedMovies.length === 0) {
      toast.error('Please select at least one movie');
      return;
    }
    if (step === 2 && selectedGenres.length === 0) {
      toast.error('Please select at least one genre');
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate(-1);
    }
  };

  const handleSubmit = async () => {
    if (selectedLanguages.length === 0) {
      toast.error('Please select at least one language');
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
          favoriteMovies: selectedMovies.map(movie => ({
            movieId: movie.id.toString(),
            movieName: movie.title
          })),
          favoriteGenres: selectedGenres,
          preferredLanguages: selectedLanguages
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Preferences saved successfully!');
        setUserData(prev => ({
          ...prev,
          favoriteMovies: data.userData.favoriteMovies,
          favoriteGenres: data.userData.favoriteGenres,
          preferredLanguages: data.userData.preferredLanguages
        }));
        navigate('/home');
      } else {
        toast.error(data.message || 'Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    }
  };

  const renderStepContent = () => {
    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading movies...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      );
    }

    switch (step) {
      case 1:
        return (
          <>
            <h2 className="text-xl font-bold mb-4">Step 1: Select Your Favorite Movies</h2>
            <p className="text-gray-400 mb-6">Search and select movies you enjoy watching.</p>
            
            <div className="relative mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Start typing to search movies..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full bg-[#333] text-white px-4 py-3 rounded-t focus:outline-none focus:ring-2 focus:ring-red-500"
                  disabled={loading}
                />
                {searchInput && (
                  <button
                    onClick={() => {
                      setSearchInput('');
                      setSearchResults([]);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                )}
              </div>
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full bg-[#333] border border-gray-700 rounded-b shadow-lg max-h-[400px] overflow-y-auto">
                  {searchResults.map((movie) => (
                    <div
                      key={movie.id}
                      className="px-4 py-3 hover:bg-[#444] cursor-pointer border-b border-gray-700 last:border-0 flex items-start gap-3 group"
                      onClick={() => handleAddFromSearch(movie)}
                    >
                      {movie.poster_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                          alt={movie.title}
                          className="w-12 h-18 object-cover rounded"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white flex items-center gap-2">
                          <span className="truncate">{movie.title}</span>
                          {movie.year && (
                            <span className="text-sm text-gray-400 flex-shrink-0">({movie.year})</span>
                          )}
                        </div>
                        {movie.overview && (
                          <div className="text-sm text-gray-400 mt-1 line-clamp-2 group-hover:text-gray-300">
                            {movie.overview}
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-1">
                          {movie.rating && (
                            <span className="text-sm text-yellow-500 flex items-center gap-1">
                              <span>★</span>
                              <span>{movie.rating}</span>
                            </span>
                          )}
                          {movie.genres && movie.genres.length > 0 && (
                            <span className="text-sm text-gray-500">
                              {movie.genres.slice(0, 3).join(' • ')}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 bg-red-600 text-white rounded text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddFromSearch(movie);
                        }}
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {searchInput && searchResults.length === 0 && (
                <div className="absolute z-10 w-full bg-[#333] border border-gray-700 rounded-b shadow-lg p-4 text-center text-gray-400">
                  No movies found matching "{searchInput}"
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-300">Selected Movies:</h3>
                {selectedMovies.length > 0 && (
                  <span className="text-sm text-gray-400">
                    {selectedMovies.length} movie{selectedMovies.length !== 1 ? 's' : ''} selected
                  </span>
                )}
              </div>
              {selectedMovies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedMovies.map((movie) => (
                    <div 
                      key={movie.id} 
                      className="bg-red-700 text-white px-3 py-1 rounded-full flex items-center gap-2 group hover:bg-red-800"
                    >
                      <span className="text-sm truncate">{movie.title}</span>
                      <button 
                        className="text-white/80 group-hover:text-white"
                        onClick={() => handleMovieToggle(movie)}
                        title="Remove movie"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No movies selected yet. Start typing to search and select movies.</p>
              )}
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h2 className="text-xl font-bold mb-4">Step 2: Select Your Favorite Genres</h2>
            <p className="text-gray-400 mb-6">Choose genres that interest you the most.</p>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => handleGenreToggle(genre)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedGenres.includes(genre)
                      ? 'bg-red-600 text-white'
                      : 'bg-[#333] text-gray-300 hover:bg-[#444]'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h2 className="text-xl font-bold mb-4">Step 3: Select Preferred Languages</h2>
            <p className="text-gray-400 mb-6">Choose languages you prefer for watching movies.</p>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {LANGUAGES.map((language) => (
                <button
                  key={language}
                  onClick={() => handleLanguageToggle(language)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedLanguages.includes(language)
                      ? 'bg-red-600 text-white'
                      : 'bg-[#333] text-gray-300 hover:bg-[#444]'
                  }`}
                >
                  {language}
                </button>
              ))}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white font-[Montserrat] flex flex-col">
      <main className="flex-1 py-10 px-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-purple-600 mb-2">FlickOrbit</h1>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-3 h-3 rounded-full ${
                    s === step ? 'bg-red-600' : 'bg-[#333]'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="bg-[#181818] rounded-lg shadow-lg p-8">
            {renderStepContent()}
            
            {!loading && !error && (
              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 bg-[#333] text-white rounded hover:bg-[#444]"
                >
                  {step === 1 ? 'Back' : 'Previous'}
                </button>
                {step < 3 ? (
                  <button
                    onClick={handleNext}
                    className={`px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded font-semibold transition-colors hover:from-red-700 hover:to-red-800`}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className={`px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded font-semibold transition-colors hover:from-red-700 hover:to-red-800`}
                  >
                    Finish
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FavoriteMovies; 