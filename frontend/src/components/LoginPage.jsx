import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import Loader from './Loader';
import { loadMovieDataset, searchMovies } from '../utils/movieDataUtils';

function LoginPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    preferences: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPreferencesSection, setShowPreferencesSection] = useState(false);
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [movieDataset, setMovieDataset] = useState([]);
  const [isLoadingDataset, setIsLoadingDataset] = useState(false);
  const navigate = useNavigate();

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

  const validateForm = () => {
    let errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (Object.keys(errors).length === 0) {
      setShowPreferencesSection(true);
    } else {
      setFormErrors(errors);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

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

  const handleCompleteSignup = () => {
    // Update form data with selected preferences
    const updatedFormData = {
      ...formData,
      preferences: selectedMovies.map(movie => movie.title.toLowerCase())
    };
    
    setFormData(updatedFormData);
    setIsSubmitting(true);
    
    // Save user data and preferences to localStorage
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      
      // Save full movie objects to selectedMovies for the recommendation API
      localStorage.setItem('selectedMovies', JSON.stringify(selectedMovies));
      
      // Also save user data
      localStorage.setItem('user', JSON.stringify({ 
        name: updatedFormData.name, 
        email: updatedFormData.email,
        preferences: updatedFormData.preferences
      }));
      
      navigate('/home');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white font-[Montserrat] flex flex-col">
      <Loader loading={loading || isLoadingDataset} />
      
      <main className="flex-1 py-10 px-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-purple-600 mb-2">FlickOrbit</h1>
            <p className="text-gray-400">Your personalized movie recommendations</p>
          </div>
          
          {!showPreferencesSection ? (
            // Sign up form
            <div className="bg-[#181818] rounded-lg shadow-lg p-8">
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="name" className="block text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-[#333] text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter your name"
                  />
                  {formErrors.name && <p className="text-red-500 mt-1">{formErrors.name}</p>}
                </div>
                
                <div className="mb-6">
                  <label htmlFor="email" className="block text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[#333] text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter your email"
                  />
                  {formErrors.email && <p className="text-red-500 mt-1">{formErrors.email}</p>}
                </div>
                
                <div className="mb-6">
                  <label htmlFor="password" className="block text-gray-300 mb-2">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-[#333] text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter your password"
                  />
                  {formErrors.password && <p className="text-red-500 mt-1">{formErrors.password}</p>}
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded font-semibold hover:from-red-700 hover:to-red-800 transition-colors"
                >
                  Continue
                </button>
              </form>
            </div>
          ) : (
            // Movie preferences selection screen
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
                  onClick={() => setShowPreferencesSection(false)}
                  className="px-4 py-2 bg-[#333] text-white rounded hover:bg-[#444]"
                >
                  Back
                </button>
                <button
                  onClick={handleCompleteSignup}
                  className={`px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded font-semibold transition-colors ${
                    selectedMovies.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:from-red-700 hover:to-red-800'
                  }`}
                  disabled={selectedMovies.length === 0}
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default LoginPage; 