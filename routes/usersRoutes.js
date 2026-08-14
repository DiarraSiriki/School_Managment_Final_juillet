import express from 'express';
import {
    getUtilisateurs,
    getUtilisateurParMatricule,
    ajouterUtilisateur,
    supprimerUtilisateur
} from '../controllers/usersControllers.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);


router.get('/', checkRole(['admin']), getUtilisateurs);
router.get('/matricule/:matricule', checkRole(['admin']), getUtilisateurParMatricule);
router.post('/', checkRole(['admin']), ajouterUtilisateur);
router.delete('/:id', checkRole(['admin']), supprimerUtilisateur);

export default router;