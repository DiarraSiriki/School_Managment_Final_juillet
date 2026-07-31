// routes/authRoutes.js
import express from 'express';
import { login, logout } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Route de connexion (publique, pas besoin de token)
router.post('/login', login);

// Route de déconnexion (nécessite un token)
router.post('/logout', verifyToken, logout);

export default router;
