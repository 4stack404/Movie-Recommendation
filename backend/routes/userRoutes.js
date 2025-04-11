import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { getUserData, updateUserPreferences } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get('/data', userAuth, getUserData);
userRouter.post('/update-preferences', userAuth, updateUserPreferences);

export default userRouter;