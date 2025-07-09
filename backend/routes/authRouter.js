import express from 'express';
import {registerUser,loginUser,forgotPassword,resetPassword,} from '../controllers/authController.js';

const authRouter = express.Router();

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);   
authRouter.post('/passwordReset', forgotPassword);
authRouter.post('/resetPassword', resetPassword);

export default authRouter;