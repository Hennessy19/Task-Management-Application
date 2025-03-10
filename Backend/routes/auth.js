import express from 'express';
import auth from '../middleware/auth.js';
import { registerValidation, loginValidation } from '../middleware/validators.js';
import * as authController from '../controllers/authController.js';  // Fix path here

const router = express.Router();

router.post('/register', registerValidation, authController.registerUser);
router.post('/login', loginValidation, authController.loginUser);
router.get('/user', auth, authController.getCurrentUser);

export default router;