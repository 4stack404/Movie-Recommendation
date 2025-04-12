import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    if(!user) {
        return res.status(404).json({success: false, message: "User not found"});
    }

    res.json({
        success: true,
        userData: {
            name: user.name,
            email: user.email,
            isAccountVerified: user.isAccountVerified,
            favoriteMovies: user.favoriteMovies || [],
            favoriteGenres: user.favoriteGenres || [],
            preferredLanguages: user.preferredLanguages || []
        }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserPreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const { favoriteMovies, favoriteGenres, preferredLanguages } = req.body;

    // Validate input
    if (!favoriteMovies || !Array.isArray(favoriteMovies) || favoriteMovies.length === 0) {
      return res.status(400).json({ success: false, message: "Please select at least one movie" });
    }

    if (!favoriteGenres || !Array.isArray(favoriteGenres) || favoriteGenres.length === 0) {
      return res.status(400).json({ success: false, message: "Please select at least one genre" });
    }

    if (!preferredLanguages || !Array.isArray(preferredLanguages) || preferredLanguages.length === 0) {
      return res.status(400).json({ success: false, message: "Please select at least one language" });
    }

    // Update user preferences
    const user = await userModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          favoriteMovies,
          favoriteGenres,
          preferredLanguages,
        }
      },
      { new: true } // Return the updated document
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "Preferences updated successfully",
      userData: {
        name: user.name,
        email: user.email,
        isAccountVerified: user.isAccountVerified,
        favoriteMovies: user.favoriteMovies,
        favoriteGenres: user.favoriteGenres,
        preferredLanguages: user.preferredLanguages
      }
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's favorite movies
export const getFavoriteMovies = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await userModel.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Load the movie dataset
        const response = await fetch('http://localhost:3000/data/movies_dataset.json');
        if (!response.ok) {
            throw new Error('Failed to load movie dataset');
        }

        const jsonText = await response.text();
        const cleanedJson = jsonText.replace(/:\s*NaN\s*,/g, ': null,')
                                  .replace(/:\s*NaN\s*}/g, ': null}')
                                  .replace(/:\s*undefined\s*,/g, ': null,')
                                  .replace(/:\s*undefined\s*}/g, ': null}');
        const moviesData = JSON.parse(cleanedJson);

        // Map user's favorite movie IDs to full movie details
        const favoriteMovies = user.favoriteMovies.map(favMovie => {
            const movieDetails = moviesData.find(m => m.id.toString() === favMovie.movieId.toString());
            if (movieDetails) {
                return {
                    id: movieDetails.id,
                    title: movieDetails.title || movieDetails.name,
                    poster_path: movieDetails.poster_path,
                    release_date: movieDetails.release_date,
                    overview: movieDetails.overview,
                    vote_average: movieDetails.vote_average
                };
            }
            return null;
        }).filter(Boolean); // Remove any null values

        res.json({ movies: favoriteMovies });
    } catch (error) {
        console.error('Error fetching favorite movies:', error);
        res.status(500).json({ message: 'Error fetching favorite movies', error: error.message });
    }
};

// Add a movie to favorites
export const addToFavorites = async (req, res) => {
    try {
        const userId = req.user._id;
        const { movieId, movieName, poster_path, release_date, overview, vote_average, genres } = req.body;

        if (!movieId || !movieName) {
            return res.status(400).json({ message: 'Movie ID and name are required' });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if movie is already in favorites
        const isAlreadyFavorite = user.favoriteMovies.some(movie => movie.movieId === movieId);
        if (isAlreadyFavorite) {
            return res.status(400).json({ message: 'Movie already in favorites' });
        }

        // Add to favorites with all details
        user.favoriteMovies.push({
            movieId,
            movieName,
            poster_path,
            release_date,
            overview,
            vote_average,
            genres
        });
        await user.save();

        res.json({ message: 'Movie added to favorites', favoriteMovies: user.favoriteMovies });
    } catch (error) {
        console.error('Error adding to favorites:', error);
        res.status(500).json({ message: 'Error adding movie to favorites' });
    }
};

// Remove a movie from favorites
export const removeFromFavorites = async (req, res) => {
    try {
        const userId = req.user._id;
        const { movieId } = req.params;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove movie from favorites
        user.favoriteMovies = user.favoriteMovies.filter(movie => movie.movieId !== movieId);
        await user.save();

        res.json({ message: 'Movie removed from favorites', favoriteMovies: user.favoriteMovies });
    } catch (error) {
        console.error('Error removing from favorites:', error);
        res.status(500).json({ message: 'Error removing movie from favorites' });
    }
};
