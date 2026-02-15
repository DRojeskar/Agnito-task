
import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';
import { requireFields } from '../middlewares/validation.js';

const router = express.Router();

router.post('/register',requireFields('email','password','name'),authController.register);

router.post('/login',requireFields('email', 'password'),authController.login);

router.get('/me',authenticate, authController.me);

export default router;
