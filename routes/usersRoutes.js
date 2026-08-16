import express from 'express';
import {
    getUtilisateurs,
    getUtilisateurParMatricule,
    ajouterUtilisateur,
    supprimerUtilisateur,
    modifierUtilisateur

} from '../controllers/usersControllers.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);


router.get('/', checkRole(['admin']), getUtilisateurs);
router.get('/matricule/:matricule', checkRole(['admin']), getUtilisateurParMatricule);
router.post('/', checkRole(['admin']), ajouterUtilisateur);
router.delete('/:id', checkRole(['admin']), supprimerUtilisateur);
router.get('/profile', checkRole(['admin']), getUtilisateurParMatricule);
router.put('/:id', checkRole(['admin']), modifierUtilisateur);

export default router;