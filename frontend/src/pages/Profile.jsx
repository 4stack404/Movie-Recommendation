import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Profile() {
  const { userData, setUserData } = useContext(AppContent);
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData) {
      navigate('/login');
      return;
    }
    fetchFavoriteMovies();
  }, [userData, navigate]);

  const fetchFavoriteMovies = async () => {
    try {
      const response = await fetch('/api/user/data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.userData.favoriteMovies) {
          setFavoriteMovies(data.userData.favoriteMovies);
        } else {
          toast.error('Failed to fetch favorite movies');
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to fetch favorite movies');
      }
    } catch (error) {
      console.error('Error fetching favorite movies:', error);
      toast.error('Failed to load favorite movies');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromFavorites = async (movieId) => {
    try {
      const response = await fetch(`/api/user/favorite-movies/${movieId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setFavoriteMovies(prev => prev.filter(movie => movie.movieId !== movieId));
        // Also update the userData context
        setUserData(prev => ({
          ...prev,
          favoriteMovies: prev.favoriteMovies.filter(movie => movie.movieId !== movieId)
        }));
        toast.success('Movie removed from favorites');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to remove movie from favorites');
      }
    } catch (error) {
      console.error('Error removing movie from favorites:', error);
      toast.error('Failed to remove movie from favorites');
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
        <Header />
        <div className="container mx-auto text-center py-20 px-4">
          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">Please Login</h1>
          <Link 
            to="/login" 
            className="inline-block px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105"
          >
            Go to Login
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Header />
      <div className="container mx-auto py-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 mb-8 shadow-lg border border-gray-700/50">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0">
                <div className="w-28 h-28 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center text-5xl font-bold shadow-lg border-2 border-red-500/20">
                  {userData?.name ? userData.name.charAt(0).toUpperCase() : '?'}
                </div>
              </div>
              <div className="flex-grow">
                <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">{userData?.name}</h1>
                <p className="text-gray-400 text-lg">{userData?.email}</p>
                {userData && !userData.isAccountVerified && (
                  <p className="mt-3 text-yellow-500 flex items-center text-sm bg-yellow-500/10 px-4 py-2 rounded-full w-fit">
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    Account not verified
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link 
              to="/already-watched"
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 hover:bg-gray-700/50 transition-all duration-300 transform hover:scale-105 border border-gray-700/50"
            >
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-lg flex items-center justify-center group-hover:from-red-600/30 group-hover:to-red-800/30 transition-colors">
                  <i className="fas fa-check-circle text-2xl text-red-500"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Already Watched</h3>
                  <p className="text-gray-400 text-sm">View your watched movies</p>
                </div>
              </div>
            </Link>

            <Link 
              to="/watchlist"
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 hover:bg-gray-700/50 transition-all duration-300 transform hover:scale-105 border border-gray-700/50"
            >
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-lg flex items-center justify-center group-hover:from-red-600/30 group-hover:to-red-800/30 transition-colors">
                  <i className="fas fa-list text-2xl text-red-500"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">My List</h3>
                  <p className="text-gray-400 text-sm">Movies you want to watch</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Favorite Movies Section */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-gray-700/50">
            <h2 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Your Favorite Movies</h2>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : favoriteMovies.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {favoriteMovies.map((movie) => (
                  <div key={movie.movieId} className="relative group transform transition-all duration-300 hover:scale-105">
                    <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-700/50 shadow-lg">
                      {movie.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                          alt={movie.movieName}
                          className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          <i className="fas fa-film text-4xl"></i>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-16 left-4 right-4 text-white">
                          <p className="text-sm mb-1">{movie.release_date?.split('-')[0]}</p>
                          {movie.vote_average && (
                            <div className="flex items-center mb-2">
                              <i className="fas fa-star text-yellow-500 mr-1"></i>
                              <span>{movie.vote_average.toFixed(1)}</span>
                            </div>
                          )}
                          {movie.genres && movie.genres.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {movie.genres.slice(0, 2).map((genre, index) => (
                                <span 
                                  key={index}
                                  className="text-xs px-2 py-1 bg-red-600/50 rounded-full"
                                >
                                  {genre}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveFromFavorites(movie.movieId)}
                          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-red-600 text-white rounded-full flex items-center space-x-2 hover:bg-red-700 transition-colors"
                        >
                          <i className="fas fa-trash-alt"></i>
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                    <div className="mt-3">
                      <h3 className="text-sm font-semibold truncate text-white">{movie.movieName}</h3>
                      {movie.overview && (
                        <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                          {movie.overview}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <i className="fas fa-film text-5xl text-red-600/50 mb-4"></i>
                <p className="text-gray-400 text-lg mb-6">No favorite movies selected yet</p>
                <Link 
                  to="/explore" 
                  className="inline-block px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105"
                >
                  Explore Movies
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Profile; 