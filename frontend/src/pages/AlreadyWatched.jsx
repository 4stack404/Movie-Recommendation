import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AlreadyWatched = () => {
  const { isLoggedin, getUserData } = useContext(AppContent);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
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
      fetchWatchedMovies();
    };

    checkAuthAndFetchData();
  }, [isLoggedin, navigate, getUserData]);

  const fetchWatchedMovies = async () => {
    try {
      setLoading(true);
      console.log('Fetching watched movies...');
      
      const response = await fetch('/api/user/already-watched', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'include'
      });
      
      console.log('Watched movies response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Watched movies data:', data);
        
        // Handle the specific API response format
        if (data.success && Array.isArray(data.alreadyWatched)) {
          setWatchedMovies(data.alreadyWatched);
        } else if (Array.isArray(data.watchedMovies)) {
          setWatchedMovies(data.watchedMovies);
        } else if (Array.isArray(data)) {
          setWatchedMovies(data);
        } else {
          console.error('Invalid watched movies data format:', data);
          toast.error('Failed to parse watched movies data');
        }
      } else {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        const errorData = await response.json();
        console.error('Watched movies error:', errorData);
        toast.error(errorData.message || 'Failed to fetch watched movies');
      }
    } catch (error) {
      console.error('Error fetching watched movies:', error);
      toast.error('Failed to load watched movies');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWatched = async (movieId) => {
    try {
      const response = await fetch(`/api/user/already-watched/${movieId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setWatchedMovies(prev => prev.filter(movie => movie.movieId !== movieId));
        toast.success('Movie removed from watched list');
      } else {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to remove movie from watched list');
      }
    } catch (error) {
      console.error('Error removing movie:', error);
      toast.error('Failed to remove movie from watched list');
    }
  };

  const MovieCard = ({ movie }) => (
    <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg transition-all duration-300 group hover:shadow-2xl relative">
      <Link to={`/movie/${movie.movieId}`}>
        <div className="aspect-[2/3] relative overflow-hidden">
          <img
            src={movie.poster_path ? 
              (movie.poster_path.startsWith('http') 
                ? movie.poster_path 
                : `https://image.tmdb.org/t/p/w500${movie.poster_path}`)
              : 'https://via.placeholder.com/300x450?text=No+Image'}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
            }}
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="text-white text-sm font-medium px-4 text-center">View Details</span>
          </div>
        </div>
      </Link>
      
      <div className="p-4">
        <h3 className="text-white font-semibold text-lg mb-1 line-clamp-1">{movie.title}</h3>
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">
            {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
          </span>
          {movie.vote_average > 0 && (
            <div className="flex items-center text-yellow-500">
              <i className="fas fa-star text-xs mr-1"></i>
              <span className="text-sm">{Number(movie.vote_average).toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <button
          onClick={(e) => {
            e.preventDefault();
            handleRemoveFromWatched(movie.movieId);
          }}
          className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <i className="fas fa-times"></i>
          Remove from Watched
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D]">
        <Header />
        <div className="container mx-auto flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Header />
      {/* Add padding-top to push content below the navbar */}
      <main className="container mx-auto px-4 pt-24 pb-8">
        {/* Simplified header that doesn't clash with the navbar */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/explore"
            className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors duration-200 flex items-center gap-2"
          >
            <i className="fas fa-compass"></i>
            Explore More Movies
          </Link>
        </div>

        {watchedMovies.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50">
            <i className="fas fa-film text-5xl text-red-600/50 mb-4"></i>
            <h2 className="text-2xl font-bold text-white mb-2">No Watched Movies Yet</h2>
            <p className="text-gray-400 text-lg mb-6">Start exploring and mark movies as watched to build your collection!</p>
            <Link
              to="/explore"
              className="inline-block px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105"
            >
              <i className="fas fa-compass mr-2"></i>
              Explore Movies
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {watchedMovies.map(movie => (
              <MovieCard key={movie.movieId} movie={movie} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AlreadyWatched;