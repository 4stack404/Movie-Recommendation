import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { 
    getUserData, 
    updateUserPreferences, 
    getFavoriteMovies, 
    addToFavorites, 
    removeFromFavorites,
    getWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    getAlreadyWatched,
    addToAlreadyWatched,
    removeFromAlreadyWatched
} from '../controllers/userController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const userRouter = express.Router();

userRouter.get('/data', userAuth, getUserData);
userRouter.post('/update-preferences', userAuth, updateUserPreferences);

// Favorite movies routes
userRouter.get('/favorite-movies', verifyToken, getFavoriteMovies);
userRouter.post('/favorite-movies', verifyToken, addToFavorites);
userRouter.delete('/favorite-movies/:movieId', verifyToken, removeFromFavorites);

// Watchlist routes
userRouter.get('/watchlist', verifyToken, getWatchlist);
userRouter.post('/watchlist', verifyToken, addToWatchlist);
userRouter.delete('/watchlist/:movieId', verifyToken, removeFromWatchlist);

// Already watched routes
userRouter.get('/already-watched', verifyToken, getAlreadyWatched);
userRouter.post('/already-watched', verifyToken, addToAlreadyWatched);
userRouter.delete('/already-watched/:movieId', verifyToken, removeFromAlreadyWatched);

export default userRouter;