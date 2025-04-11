import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loader from '../components/Loader';
import RecommendedMovies from '../components/RecommendedMovies';
import MovieDetails from '../components/MovieDetails';
import UserPreferences from '../components/UserPreferences';
import { getMovieRecommendations, getMovieDetails } from '../services/api';
import { mapApiMovieToAppMovie, filterMoviesByGenre, getPosterPath, getBackdropPath } from '../utils/movieUtils';
import MovieCarousel from '../components/MovieCarousel';
import '../styles/home.css';

function Home() {
  const navigate = useNavigate();
  const mainRef = useRef(null);
  const carouselRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState([]);
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [carouselMovies, setCarouselMovies] = useState([]);
  const [showPreferences, setShowPreferences] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  
  // State for modals and movie details
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showMovieModal, setShowMovieModal] = useState(false);
  
  // State for genres and filtering
  const [selectedGenre, setSelectedGenre] = useState('');
  
  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [backdropImage, setBackdropImage] = useState('');
  const [showBackdrop, setShowBackdrop] = useState(false);
  
  // Sample movie data for testing
  const dummyMovies = [
    {
      id: 1,
      title: "The Shawshank Redemption",
      original_title: "The Shawshank Redemption",
      Year: "1994",
      Poster: "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg",
      backdrop_path: "https://image.tmdb.org/t/p/original/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
      overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
      Plot: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
      Director: "Frank Darabont",
      Writer: "Stephen King, Frank Darabont",
      Actors: "Tim Robbins, Morgan Freeman, Bob Gunton",
      Genre: "Drama",
      Language: "English",
      Awards: "Nominated for 7 Oscars. 21 wins & 43 nominations total",
      imdbRating: "9.3",
      Runtime: "142 min",
      Rated: "R",
      rating: "9.3",
      release_date: "1994",
      genres: ["Drama", "Crime"]
    },
    {
      id: 2,
      title: "The Godfather",
      original_title: "The Godfather",
      Year: "1972",
      Poster: "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
      backdrop_path: "https://image.tmdb.org/t/p/original/tmU7GeKVybMWFButWEGl2M4GeiP.jpg",
      overview: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
      Plot: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
      Director: "Francis Ford Coppola",
      Writer: "Mario Puzo, Francis Ford Coppola",
      Actors: "Marlon Brando, Al Pacino, James Caan",
      Genre: "Crime, Drama",
      Language: "English, Italian, Latin",
      Awards: "Won 3 Oscars. 31 wins & 30 nominations total",
      imdbRating: "9.2",
      Runtime: "175 min",
      Rated: "R",
      rating: "9.2",
      release_date: "1972",
      genres: ["Crime", "Drama"]
    },
    {
      id: 3,
      title: "The Dark Knight",
      original_title: "The Dark Knight",
      Year: "2008",
      Poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg",
      backdrop_path: "https://image.tmdb.org/t/p/original/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg",
      overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
      Plot: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
      Director: "Christopher Nolan",
      Writer: "Jonathan Nolan, Christopher Nolan",
      Actors: "Christian Bale, Heath Ledger, Aaron Eckhart",
      Genre: "Action, Crime, Drama",
      Language: "English, Mandarin",
      Awards: "Won 2 Oscars. 159 wins & 163 nominations total",
      imdbRating: "9.0",
      Runtime: "152 min",
      Rated: "PG-13",
      rating: "9.0",
      release_date: "2008",
      genres: ["Action", "Crime", "Drama"]
    },
    {
      id: 4,
      title: "Pulp Fiction",
      original_title: "Pulp Fiction",
      Year: "1994",
      Poster: "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
      backdrop_path: "https://image.tmdb.org/t/p/original/qdIMHd4sEfJSckfVJfKQvisL02a.jpg",
      overview: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
      Plot: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
      Director: "Quentin Tarantino",
      Writer: "Quentin Tarantino, Roger Avary",
      Actors: "John Travolta, Uma Thurman, Samuel L. Jackson",
      Genre: "Crime, Drama",
      Language: "English, Spanish, French",
      Awards: "Won 1 Oscar. 70 wins & 75 nominations total",
      imdbRating: "8.9",
      Runtime: "154 min",
      Rated: "R",
      rating: "8.9",
      release_date: "1994",
      genres: ["Crime", "Drama"]
    },
    {
      id: 5,
      title: "Inception",
      original_title: "Inception",
      Year: "2010",
      Poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
      backdrop_path: "https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
      overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
      Plot: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
      Director: "Christopher Nolan",
      Writer: "Christopher Nolan",
      Actors: "Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page",
      Genre: "Action, Adventure, Sci-Fi",
      Language: "English, Japanese, French",
      Awards: "Won 4 Oscars. 157 wins & 220 nominations total",
      imdbRating: "8.8",
      Runtime: "148 min",
      Rated: "PG-13",
      rating: "8.8",
      release_date: "2010",
      genres: ["Action", "Adventure", "Sci-Fi"]
    }
  ];

  // Sample movie details for the carousel
  const dummyMovieDetails = [
    {
      id: 1,
      backdrop_path: "https://image.tmdb.org/t/p/original/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
      poster_path: "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg",
      vote_average: 9.3
    },
    {
      id: 2,
      backdrop_path: "https://image.tmdb.org/t/p/original/tmU7GeKVybMWFButWEGl2M4GeiP.jpg",
      poster_path: "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
      vote_average: 9.2
    },
    {
      id: 3,
      backdrop_path: "https://image.tmdb.org/t/p/original/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg",
      poster_path: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg",
      vote_average: 9.0
    },
    {
      id: 4,
      backdrop_path: "https://image.tmdb.org/t/p/original/qdIMHd4sEfJSckfVJfKQvisL02a.jpg",
      poster_path: "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
      vote_average: 8.9
    },
    {
      id: 5,
      backdrop_path: "https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
      poster_path: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
      vote_average: 8.8
    }
  ];

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        
        // Get favorite movies from localStorage
        const storedMovies = localStorage.getItem('selectedMovies');
        const favoriteMovies = storedMovies ? JSON.parse(storedMovies) : [];
        
        setSelectedMovies(favoriteMovies);
        
        if (favoriteMovies.length === 0) {
          console.log('No favorite movies found in localStorage');
          
          // Use dummy movie data if no favorites
          // Add TMDB poster paths to dummy movies
          const enhancedDummyMovies = await Promise.all(
            dummyMovies.map(async (movie) => {
              // If the movie already has a TMDB ID, fetch real poster path
              if (movie.id && typeof movie.id === 'number') {
                try {
                  const tmdbData = await getMovieDetails(movie.id);
                  if (tmdbData && tmdbData.poster_path) {
                    return {
                      ...movie,
                      poster_path: tmdbData.poster_path,
                      backdrop_path: tmdbData.backdrop_path || movie.backdrop_path
                    };
                  }
                } catch (error) {
                  console.error(`Error fetching movie details for ${movie.id}:`, error);
                }
              }
              return movie;
            })
          );
          
          setMovies(enhancedDummyMovies);
          setCarouselMovies(enhancedDummyMovies.slice(0, 5));
          setLoading(false);
          return;
        }
        
        console.log('Favorite movies from localStorage:', favoriteMovies);
        
        // Format movie titles for API call - ensure we're getting the title property
        const movieTitles = favoriteMovies.map(movie => {
          // Movie might have title with lowercase t or Title with uppercase T
          const movieTitle = movie.title || movie.Title;
          if (!movieTitle) {
            console.warn('Movie without title:', movie);
            return '';
          }
          return movieTitle;
        }).filter(title => title !== ''); // Remove any empty titles
        
        if (movieTitles.length === 0) {
          console.log('No valid movie titles found');
          setRecommendedMovies([]);
          setCarouselMovies([]);
          setLoading(false);
          return;
        }
        
        console.log('Calling API with movie titles:', movieTitles);
        
        // Call the recommendation API
        const recommendations = await getMovieRecommendations(movieTitles);
        console.log('API response:', recommendations);
        
        if (recommendations && recommendations.length > 0) {
          setRecommendedMovies(recommendations);
          
          // Take top 3 for carousel
          const topThree = recommendations.slice(0, 3);
          console.log('Top 3 for carousel:', topThree);
          setCarouselMovies(topThree);
        } else {
          console.log('No recommendations returned or empty array');
          setRecommendedMovies([]);
          setCarouselMovies([]);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setError('Failed to load recommendations. Please try again later.');
        setRecommendedMovies([]);
        setCarouselMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  // Filter recommendedMovies based on searchQuery
  const filteredMovies = recommendedMovies.filter(movie => 
    !searchQuery || 
    (movie.title && movie.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (movie.Title && movie.Title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter movies when selectedGenre changes
  useEffect(() => {
    if (movies.length > 0) {
      const filtered = filterMoviesByGenre(movies, selectedGenre);
      setMovies(filtered);
    }
  }, [selectedGenre, movies]);

  // Set up auto-slide for carousel
  useEffect(() => {
    const interval = setInterval(() => {
      const maxSlides = carouselMovies.length > 0 ? carouselMovies.length : 3;
      moveSlider((currentSlide + 1) % maxSlides);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [currentSlide, carouselMovies.length]);

  const showMovieDetails = (movie) => {
    setSelectedMovie(movie);
    setShowMovieModal(true);
  };

  const addToWatchlist = (movie) => {
    // Get existing watchlist
    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    
    // Check if movie is already in watchlist
    const movieExists = watchlist.some(item => item.id === movie.id);
    
    if (!movieExists) {
      // Add movie to watchlist
      watchlist.push(movie);
      localStorage.setItem('watchlist', JSON.stringify(watchlist));
      alert(`"${movie.title || movie.Title}" has been added to your watchlist.`);
    } else {
      alert(`"${movie.title || movie.Title}" is already in your watchlist.`);
    }
  };

  const moveSlider = (index) => {
    setCurrentSlide(index);
  };

  const moveCarousel = (direction) => {
    if (!carouselRef.current) return;
    
    const cards = carouselRef.current.children;
    if (cards.length === 0) return;
    
    const cardWidth = cards[0].offsetWidth + 20; // width + gap
    const containerWidth = carouselRef.current.parentNode.offsetWidth;
    const maxPosition = Math.max(0, (cards.length * cardWidth) - containerWidth);
    
    let newPosition = currentPosition;
    
    if (direction === 'right' && currentPosition < maxPosition) {
      newPosition = Math.min(maxPosition, currentPosition + cardWidth);
    } else if (direction === 'left' && currentPosition > 0) {
      newPosition = Math.max(0, currentPosition - cardWidth);
    }
    
    setCurrentPosition(newPosition);
  };

  const handleCardHover = (backdropPath) => {
    setBackdropImage(backdropPath);
    setShowBackdrop(true);
  };

  const handleCardLeave = () => {
    setShowBackdrop(false);
  };

  const selectedMovieDetailsSection = selectedMovie && (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-[#181818] rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <div className="h-[300px] md:h-[400px] w-full bg-gradient-to-t from-[#181818] to-transparent absolute bottom-0 left-0 z-10"></div>
          <img 
            src={selectedMovie.Poster !== 'N/A' ? selectedMovie.Poster : 'https://via.placeholder.com/800x400?text=No+Backdrop'} 
            alt={selectedMovie.Title} 
            className="w-full h-[300px] md:h-[400px] object-cover"
          />
          <button 
            className="absolute top-4 right-4 bg-black/50 p-2 rounded-full z-20 hover:bg-black/80 transition-all"
            onClick={() => setSelectedMovie(null)}
          >
            <i className="fa-solid fa-times text-white text-xl"></i>
          </button>
        </div>
        
        <div className="p-6 relative z-20 -mt-16">
          <h2 className="text-3xl font-bold mb-2">{selectedMovie.Title}</h2>
          <div className="flex items-center text-gray-400 mb-4">
            <span>{selectedMovie.Year}</span>
            <span className="mx-2">•</span>
            <span>{selectedMovie.Runtime}</span>
            <span className="mx-2">•</span>
            <span>{selectedMovie.Rated}</span>
          </div>
          
          <div className="flex mb-4">
            <div className="mr-4 bg-[#E50914] text-white py-1 px-3 rounded text-sm flex items-center">
              <i className="fa-solid fa-star mr-1"></i>
              <span>{selectedMovie.imdbRating}/10</span>
            </div>
            <button 
              className="bg-[#333] text-white py-1 px-3 rounded flex items-center hover:bg-[#555] transition text-sm"
              onClick={() => addToWatchlist(selectedMovie)}
            >
              <i className="fa-solid fa-plus mr-1"></i>
              <span>Add to Watchlist</span>
            </button>
          </div>
          
          <p className="text-gray-300 mb-4">{selectedMovie.Plot}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><span className="text-gray-400">Director:</span> {selectedMovie.Director}</p>
              <p><span className="text-gray-400">Writers:</span> {selectedMovie.Writer}</p>
              <p><span className="text-gray-400">Stars:</span> {selectedMovie.Actors}</p>
            </div>
            <div>
              <p><span className="text-gray-400">Genre:</span> {selectedMovie.Genre}</p>
              <p><span className="text-gray-400">Language:</span> {selectedMovie.Language}</p>
              <p><span className="text-gray-400">Awards:</span> {selectedMovie.Awards}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const handleUpdatePreferences = async (newPreferences) => {
    if (newPreferences && newPreferences.length > 0) {
      setLoading(true);
      try {
        const recommendations = await getMovieRecommendations(newPreferences);
        
        if (recommendations && recommendations.length > 0) {
          // Format the recommendations
          const formattedRecommendations = recommendations.map(movie => mapApiMovieToAppMovie(movie));
          
          // Update recommendations state
          setRecommendedMovies(formattedRecommendations);
          
          // Update carousel with top 3
          setCarouselMovies(formattedRecommendations.slice(0, 3));
          
          // Update all movies
          const updatedMovies = [...dummyMovies, ...formattedRecommendations];
          setMovies(updatedMovies);
          setMovies(filterMoviesByGenre(updatedMovies, selectedGenre));
        }
      } catch (error) {
        console.error("Error updating recommendations:", error);
      } finally {
        setLoading(false);
        setShowPreferences(false);
      }
    }
  };

  return (
    <div className="bg-[#0D0D0D] text-white font-[Montserrat] min-h-screen h-screen flex flex-col overflow-hidden">
      <Header />
      <Loader loading={loading} />
      
      <main ref={mainRef} className="flex-1 overflow-y-auto overflow-x-hidden pb-0">
        {error && (
          <div className="text-red-500 p-4 text-center">{error}</div>
        )}
        
        {carouselMovies.length > 0 ? (
          <section className="mt-4">
            <MovieCarousel movies={carouselMovies} onAddToWatchlist={addToWatchlist} />
          </section>
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px] bg-gradient-to-r from-gray-900 to-black p-8 mb-8">
            <h2 className="text-3xl font-bold mb-4">Welcome to MovieMind</h2>
            <p className="text-xl text-center max-w-2xl">
              Discover personalized movie recommendations based on your preferences.
              Go to the preferences page to select your favorite movies and get tailored suggestions.
            </p>
            <Link 
              to="/preferences" 
              className="mt-8 bg-[#E50914] hover:bg-red-700 text-white py-3 px-6 rounded-md font-semibold transition-colors duration-300"
            >
              Set Your Preferences
            </Link>
          </div>
        )}
        
        <div className="search-container mx-auto w-full max-w-3xl px-4 mb-8 mt-8">
          <input
            type="text"
            placeholder="Search movies by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input w-full p-4 bg-[#1A1A1A] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-transparent transition-all duration-300 hover:border-gray-500"
          />
        </div>
        
        {recommendedMovies.length > 0 ? (
          <RecommendedMovies movies={filteredMovies} onShowDetails={showMovieDetails} onAddToWatchlist={addToWatchlist} />
        ) : (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">No Recommendations Yet</h2>
            <p className="text-gray-400">
              Select your favorite movies in the preferences page to get personalized recommendations.
            </p>
            <Link 
              to="/preferences" 
              className="inline-block mt-6 bg-[#E50914] hover:bg-red-700 text-white py-2 px-4 rounded-md font-medium transition-colors duration-300"
            >
              Go to Preferences
            </Link>
          </div>
        )}
        
        {filteredMovies.length === 0 && searchQuery && (
          <div className="text-center p-8">
            <h3 className="text-xl font-bold mb-2">No results found</h3>
            <p className="text-gray-400">
              Try a different search term or clear the search to see all recommendations.
            </p>
          </div>
        )}

        {/* User Preferences Section */}
        <section className={`fixed inset-0 bg-black bg-opacity-90 z-50 ${showPreferences ? 'flex' : 'hidden'} items-center justify-center p-4`}>
          <div className="bg-[#1A1A1A] p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Update Your Preferences</h2>
              <button 
                onClick={() => setShowPreferences(false)}
                className="text-gray-400 hover:text-white"
              >
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>
            <UserPreferences onClose={() => setShowPreferences(false)} />
          </div>
        </section>

        {/* TOP 10 Recommendations Section */}
        <section className="py-5">
          <div className="relative max-w-[85%] mx-auto my-5 py-5 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <div className="top10-Text">
                <h3 className="text-2xl font-bold">
                  <span className="border-b-4 border-red-600 pb-2">TOP 10 Recommendations</span>
                </h3>
              </div>
              <div className="movie-type bg-[#181818] p-2 rounded">
                <select 
                  className="text-white text-center bg-transparent focus:outline-none"
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  value={selectedGenre}
                >
                  <option value="">All Genres</option>
                  <option value="action">Action</option>
                  <option value="comedy">Comedy</option>
                  <option value="drama">Drama</option>
                  <option value="horror">Horror</option>
                  <option value="sci-fi">Sci-Fi</option>
                </select>
              </div>
            </div>
            
            {/* Top 10 Carousel - Using recommendations from API */}
            <div className="relative mt-10 mb-6 overflow-hidden">
              <button 
                className="absolute top-1/2 -translate-y-1/2 left-[-20px] bg-black/50 text-white border-none text-2xl p-2 rounded-full z-10 cursor-pointer hover:bg-black/80 transition-colors"
                onClick={() => moveCarousel('left')}
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              
              <div className="overflow-hidden no-scrollbar">
                <div 
                  ref={carouselRef}
                  className="flex gap-5 transition-transform duration-500 ease-in-out no-scrollbar"
                  style={{ transform: `translateX(-${currentPosition}px)` }}
                >
                  {(recommendedMovies.length > 0 ? recommendedMovies.slice(0, 10) : filteredMovies).map((movie, index) => (
                    <div 
                      key={movie.id} 
                      className="flex-none w-[220px] p-2 relative transition-all duration-300 hover:scale-110 hover:-translate-y-[5px] hover:z-10 hover:shadow-lg"
                      onMouseEnter={() => handleCardHover(movie.backdrop_path)}
                      onMouseLeave={handleCardLeave}
                    >
                      <img 
                        src={movie.Poster} 
                        alt={movie.Title || movie.title} 
                        className="w-full aspect-[2/3] object-cover rounded"
                      />
                      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-3">
                        <h4 className="text-lg font-bold truncate">{movie.Title || movie.title}</h4>
                        <p className="text-sm text-gray-300">{movie.Year || movie.release_date}</p>
                      </div>
                      <div className="absolute top-2 right-2 flex flex-col gap-2 items-end">
                        <button 
                          onClick={() => showMovieDetails(movie)}
                          className="bg-black/70 text-white p-2 rounded-full hover:bg-white hover:text-black transition-colors"
                        >
                          <i className="fa-solid fa-info text-sm"></i>
                        </button>
                        <button 
                          onClick={() => addToWatchlist(movie)}
                          className="bg-black/70 text-white p-2 rounded-full hover:bg-white hover:text-black transition-colors"
                        >
                          <i className="fa-solid fa-plus text-sm"></i>
                        </button>
                      </div>
                      <div className="absolute bottom-[-10px] left-[-10px] text-5xl text-white font-bold opacity-80">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <button 
                className="absolute top-1/2 -translate-y-1/2 right-[-20px] bg-black/50 text-white border-none text-2xl p-2 rounded-full z-10 cursor-pointer hover:bg-black/80 transition-colors"
                onClick={() => moveCarousel('right')}
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
            
            {/* Movies grid */}
            <div className="mt-10 mb-10">
              <h3 className="text-2xl font-bold mb-6">
                <span className="border-b-4 border-red-600 pb-2">More Movies</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {filteredMovies.map((movie) => (
                  <div 
                    key={movie.id} 
                    className="bg-[#181818] rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105"
                  >
                    <div className="relative h-[250px]">
                      <img 
                        src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/280x400?text=No+Poster'} 
                        alt={movie.Title || movie.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          className="bg-[#E50914] text-white py-2 px-4 rounded hover:bg-[#C2000B] transition mr-2"
                          onClick={() => showMovieDetails(movie)}
                        >
                          Details
                        </button>
                        <button 
                          className="bg-[#333] text-white py-2 px-4 rounded hover:bg-[#555] transition"
                          onClick={() => addToWatchlist(movie)}
                        >
                          + Watchlist
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold truncate" title={movie.Title || movie.title}>
                        {movie.Title || movie.title}
                      </h3>
                      <p className="text-gray-400">{movie.Year || movie.release_date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Movie Detail Modal */}
        {showMovieModal && selectedMovie && (
          <MovieDetails 
            movie={selectedMovie} 
            isOpen={showMovieModal} 
            onClose={() => setShowMovieModal(false)}
            onAddToWatchlist={addToWatchlist}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default Home;

