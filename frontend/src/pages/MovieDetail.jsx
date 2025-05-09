import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { toast } from 'react-hot-toast';
import { Button, CircularProgress } from '@mui/material';

const MovieDetail = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [movie, setMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState(false);
  const [isMarkingAsWatched, setIsMarkingAsWatched] = useState(false);
  const [isAlreadyWatched, setIsAlreadyWatched] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user/data', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          setIsAuthenticated(false);
          return;
        }

        const data = await response.json();
        setIsAuthenticated(data.success);
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchMovieDetails = async () => {
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
          const year = movie.release_date ? parseInt(movie.release_date.substring(0, 4)) : 0;
          
          return {
            ...movie,
            genres,
            rating,
            popularity,
            year,
            // Use consistent property names
            title: movie.title || movie.name,
            Year: movie.release_date ? movie.release_date.substring(0, 4) : '',
            Poster: movie.poster_path 
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
              : 'https://via.placeholder.com/300x450?text=No+Image',
            backdrop_path: movie.backdrop_path 
              ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` 
              : 'https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg'
          };
        });
        
        // Find the specific movie by ID
        const selectedMovie = moviesData.find(movie => String(movie.id) === String(movieId));
        
        if (selectedMovie) {
          setMovie(selectedMovie);
          
          // Get similar movies based on genres
          if (selectedMovie.genres && selectedMovie.genres.length > 0) {
            const similar = moviesData
              .filter(m => 
                m.id !== selectedMovie.id && 
                m.genres && 
                m.genres.some(genre => selectedMovie.genres.includes(genre))
              )
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 6);
              
            setSimilarMovies(similar);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching movie details:", error);
        setLoading(false);
      }
    };
    
    if (movieId) {
      fetchMovieDetails();
    }
  }, [movieId]);

  useEffect(() => {
    const checkIfWatched = async () => {
      try {
        const response = await fetch('/api/user/already-watched');
        if (response.ok) {
          const data = await response.json();
          setIsAlreadyWatched(data.some(movie => movie.movieId === movieId));
        }
      } catch (error) {
        console.error('Error checking watched status:', error);
      }
    };

    if (isAuthenticated) {
      checkIfWatched();
    }
  }, [movieId, isAuthenticated]);

  const handleMarkAsWatched = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to mark movies as watched');
      navigate('/login');
      return;
    }

    setIsMarkingAsWatched(true);
    try {
      const response = await fetch('/api/user/already-watched', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId,
          title: movie.title,
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          release_date: movie.release_date,
          overview: movie.overview,
          vote_average: movie.vote_average,
          genres: movie.genres,
          runtime: movie.runtime,
          original_language: movie.original_language
        }),
      });

      if (response.ok) {
        toast.success('Movie marked as watched!');
        setIsAlreadyWatched(true);
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to mark movie as watched');
      }
    } catch (error) {
      console.error('Error marking movie as watched:', error);
      toast.error('Failed to mark movie as watched');
    } finally {
      setIsMarkingAsWatched(false);
    }
  };

  const handleRemoveFromWatched = async () => {
    setIsMarkingAsWatched(true);
    try {
      const response = await fetch(`/api/user/already-watched/${movieId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Removed from watched movies');
        setIsAlreadyWatched(false);
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to remove from watched movies');
      }
    } catch (error) {
      console.error('Error removing movie from watched:', error);
      toast.error('Failed to remove from watched movies');
    } finally {
      setIsMarkingAsWatched(false);
    }
  };

  // Movie card component for similar movies
  const SimilarMovieCard = ({ movie }) => (
    <Link
      to={`/movie/${movie.id}`}
      className="block group"
    >
      <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg transition-all duration-300 h-full hover:shadow-xl">
        <div className="relative aspect-[2/3]">
          <img 
            src={movie.Poster} 
            alt={movie.title || 'Movie poster'} 
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
            }}
          />
          {movie.rating > 0 && (
            <div className="absolute top-2 right-2 z-10 bg-yellow-500 text-black font-bold px-2 py-1 rounded-md shadow-lg flex items-center gap-1">
              <i className="fas fa-star text-xs"></i>
              <span>{movie.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-white line-clamp-1 text-sm">{movie.title}</h3>
          <span className="text-xs text-gray-400">{movie.Year}</span>
        </div>
      </div>
    </Link>
  );

  const addToWatchlist = async () => {
    if (!movie) return;
    
    if (!isAuthenticated) {
      toast.error('Please login to add movies to your watchlist');
      navigate('/login');
      return;
    }
    
    try {
      setIsAddingToWatchlist(true);
      const response = await fetch('/api/user/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          movieId: movie.id.toString(),
          title: movie.title,
          poster_path: movie.poster_path || '',
          backdrop_path: movie.backdrop_path || '',
          release_date: movie.release_date || '',
          overview: movie.overview || '',
          vote_average: movie.vote_average || 0,
          genres: Array.isArray(movie.genres) ? movie.genres : [],
          runtime: movie.runtime || 0,
          original_language: movie.original_language || ''
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          setIsAuthenticated(false);
          toast.error('Please login to add movies to your watchlist');
          navigate('/login');
          return;
        }
        throw new Error(errorData.message || 'Failed to add to watchlist');
      }

      const data = await response.json();
      if (data.success) {
        toast.success('Added to your watchlist');
      } else {
        toast.error(data.message || 'Failed to add to watchlist');
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      toast.error(error.message || 'Failed to add to watchlist');
    } finally {
      setIsAddingToWatchlist(false);
    }
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

  if (!movie) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0D0D0D] text-white">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center">
          <i className="fas fa-film text-6xl text-gray-600 mb-4"></i>
          <h2 className="text-2xl font-bold mb-2">Movie Not Found</h2>
          <p className="text-gray-400 mb-6">The movie you're looking for doesn't exist or has been removed.</p>
          <Link to="/explore" className="bg-[#E50914] text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors">
            Back to Explore
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0D0D0D] text-white">
      {/* Hero section with backdrop */}
      <div 
        className="absolute inset-0 w-full bg-cover bg-center opacity-20"
        style={{ 
          backgroundImage: `url(${movie.backdrop_path})`,
          filter: 'blur(8px)',
          height: '100vh',
          zIndex: 0
        }}
      ></div>
      
      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/80 to-[#0D0D0D]/60" style={{ height: '100vh', zIndex: 1 }}></div>
      
      <Header />
      
      <main className="flex-grow z-10 relative container mx-auto px-4 py-8">
        {/* Back button */}
        <Link 
          to="/explore" 
          className="bg-gray-800/40 hover:bg-gray-700/60 rounded-full p-2 inline-flex items-center mb-6 transition-colors"
        >
          <i className="fas fa-arrow-left text-white mr-2"></i>
          <span>Back to Explore</span>
        </Link>
        
        {/* Movie details section */}
        <div className="flex flex-col md:flex-row gap-8 mb-16">
          {/* Poster */}
          <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
            <div className="rounded-lg overflow-hidden shadow-2xl transform transition-transform hover:scale-[1.02] duration-300">
              <img 
                src={movie.Poster} 
                alt={movie.title} 
                className="w-full h-auto"
              />
            </div>
            
            {/* Actions buttons */}
            <div className="flex gap-2 mt-4">
              <Button
                variant="contained"
                color={isAlreadyWatched ? "secondary" : "primary"}
                onClick={isAlreadyWatched ? handleRemoveFromWatched : handleMarkAsWatched}
                disabled={isMarkingAsWatched}
                sx={{
                  width: '100%',
                  marginTop: 2,
                  backgroundColor: isAlreadyWatched ? '#e74c3c' : '#3498db',
                  '&:hover': {
                    backgroundColor: isAlreadyWatched ? '#c0392b' : '#2980b9',
                  },
                }}
              >
                {isMarkingAsWatched ? (
                  <CircularProgress size={24} color="inherit" />
                ) : isAlreadyWatched ? (
                  'Remove from Watched'
                ) : (
                  'Mark as Watched'
                )}
              </Button>
              
              <button 
                onClick={addToWatchlist}
                disabled={isAddingToWatchlist}
                className="bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-md py-2 px-3 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToWatchlist ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <i className="fas fa-plus mr-2"></i> Add to List
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Movie info */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {movie.Year && <span className="text-gray-300">{movie.Year}</span>}
              {movie.runtime && <span className="text-gray-300">{movie.runtime} min</span>}
              {movie.rating > 0 && (
                <div className="flex items-center text-yellow-500">
                  <i className="fas fa-star mr-1"></i>
                  <span>{movie.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            
            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genres && movie.genres.map((genre, index) => (
                <Link 
                  key={index} 
                  to={`/genre/${genre.toLowerCase()}`}
                  className="bg-gray-800/60 hover:bg-gray-700 px-3 py-1 rounded-full text-sm transition-colors"
                >
                  {genre}
                </Link>
              ))}
            </div>
            
            {/* Overview */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Overview</h2>
              <p className="text-gray-300 leading-relaxed">{movie.overview || 'No overview available.'}</p>
            </div>
            
            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {movie.production_companies && (
                <div>
                  <h3 className="text-lg font-semibold mb-1">Production</h3>
                  <p className="text-gray-300">{movie.production_companies}</p>
                </div>
              )}
              
              {movie.spoken_languages && (
                <div>
                  <h3 className="text-lg font-semibold mb-1">Languages</h3>
                  <p className="text-gray-300">{movie.spoken_languages}</p>
                </div>
              )}
              
              {movie.production_countries && (
                <div>
                  <h3 className="text-lg font-semibold mb-1">Countries</h3>
                  <p className="text-gray-300">{movie.production_countries}</p>
                </div>
              )}
              
              {movie.popularity && (
                <div>
                  <h3 className="text-lg font-semibold mb-1">Popularity</h3>
                  <p className="text-gray-300">{movie.popularity.toFixed(1)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Similar Movies Section */}
        {similarMovies.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Similar Movies You May Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {similarMovies.map(movie => (
                <div key={movie.id}>
                  <SimilarMovieCard movie={movie} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default MovieDetail; 