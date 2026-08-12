import express from 'express';
import {
    getUtilisateurs,
    getUtilisateurParMatricule,
    ajouterUtilisateur,
    supprimerUtilisateur
} from '../controllers/usersControllers.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 1. Verrouille TOUTES les routes définies dans ce routeur avec le Token
router.use(verifyToken);

// 2. Applique la restriction de rôle 'admin' sur chaque endpoint
router.get('/', checkRole(['admin']), getUtilisateurs);
router.get('/matricule/:matricule', checkRole(['admin']), getUtilisateurParMatricule);
router.post('/', checkRole(['admin']), ajouterUtilisateur);
router.delete('/:id', checkRole(['admin']), supprimerUtilisateur);

export default router;