import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { getUserData, updateUserPreferences, getFavoriteMovies, addToFavorites, removeFromFavorites } from '../controllers/userController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const userRouter = express.Router();

userRouter.get('/data', userAuth, getUserData);
userRouter.post('/update-preferences', userAuth, updateUserPreferences);

// Favorite movies routes
userRouter.get('/favorite-movies', verifyToken, getFavoriteMovies);
userRouter.post('/favorite-movies', verifyToken, addToFavorites);
userRouter.delete('/favorite-movies/:movieId', verifyToken, removeFromFavorites);

export default userRouter;