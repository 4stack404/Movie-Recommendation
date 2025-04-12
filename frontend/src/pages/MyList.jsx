import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';

function MyList() {
  const { isLoggedin, userData, getUserData } = useContext(AppContent);
  const [watchlist, setWatchlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      if (!isLoggedin) {
        const data = await getUserData();
        if (!data) {
          navigate('/login');
          return;
        }
      }
      fetchWatchlist();
    };

    checkAuthAndFetchData();
  }, [isLoggedin, navigate, getUserData]);

  const fetchWatchlist = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching watchlist...');
      
      const response = await fetch('/api/user/watchlist', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'include'
      });
      
      console.log('Watchlist response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Watchlist data:', data);
        
        if (data.success && Array.isArray(data.watchlist)) {
          setWatchlist(data.watchlist);
        } else {
          console.error('Invalid watchlist data:', data);
          toast.error('Failed to fetch watchlist');
        }
      } else {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        const errorData = await response.json();
        console.error('Watchlist error:', errorData);
        toast.error(errorData.message || 'Failed to fetch watchlist');
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      toast.error('Failed to load watchlist');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromWatchlist = async (movieId) => {
    try {
      const response = await fetch(`/api/user/watchlist/${movieId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setWatchlist(prev => prev.filter(movie => movie.movieId !== movieId));
        toast.success('Movie removed from watchlist');
        // Refresh the watchlist
        fetchWatchlist();
      } else {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to remove movie from watchlist');
      }
    } catch (error) {
      console.error('Error removing movie from watchlist:', error);
      toast.error('Failed to remove movie from watchlist');
    }
  };

  const handleWatchMovie = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
        <Header />
        <div className="container mx-auto flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Header />
      <div className="container mx-auto py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">My Watchlist</h1>
          
          {watchlist && watchlist.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {watchlist.map((movie) => (
                <div key={movie.movieId} className="relative group transform transition-all duration-300 hover:scale-105">
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-700/50 shadow-lg">
                    {movie.poster_path ? (
                      <img
                        src={movie.poster_path.startsWith('http') 
                          ? movie.poster_path 
                          : `https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <i className="fas fa-film text-4xl"></i>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-20 left-4 right-4 text-white">
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
                      <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2">
                        <button
                          onClick={() => handleWatchMovie(movie.movieId)}
                          className="w-full px-4 py-2 bg-red-600 text-white rounded-full flex items-center justify-center space-x-2 hover:bg-red-700 transition-colors"
                        >
                          <i className="fas fa-play"></i>
                          <span>Watch Now</span>
                        </button>
                        <button
                          onClick={() => handleRemoveFromWatchlist(movie.movieId)}
                          className="w-full px-4 py-2 bg-gray-600/50 text-white rounded-full flex items-center justify-center space-x-2 hover:bg-gray-500/50 transition-colors"
                        >
                          <i className="fas fa-times"></i>
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="text-sm font-semibold truncate text-white">{movie.title}</h3>
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
            <div className="text-center py-16 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50">
              <i className="fas fa-list text-5xl text-red-600/50 mb-4"></i>
              <h2 className="text-2xl font-bold text-white mb-2">Your watchlist is empty</h2>
              <p className="text-gray-400 text-lg mb-6">Start exploring movies and add them to your watchlist!</p>
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
      <Footer />
    </div>
  );
}

export default MyList; 