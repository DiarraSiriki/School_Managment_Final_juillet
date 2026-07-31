// routes/teacherRoutes.js
import express from 'express';
import {
    getProfesseurs,
    getProfesseurParId,
    getMonProfilProfesseur,
    chercherProfesseur,
    ajouterProfesseur,
    modifierProfesseur,
    supprimerProfesseur
} from '../controllers/teacherControllers.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protège toutes les routes avec verifyToken
router.use(verifyToken);

// Routes de lecture (accessibles par admin et teacher)
router.get('/', checkRole(['admin', 'teacher']), getProfesseurs);
router.get('/search', checkRole(['admin', 'teacher']), chercherProfesseur);
router.get('/me', checkRole(['teacher']), getMonProfilProfesseur);
router.get('/:id', checkRole(['admin', 'teacher']), getProfesseurParId);

// Routes d'écriture (accessibles par admin uniquement)
router.post('/', checkRole(['admin']), ajouterProfesseur);
router.put('/:id', checkRole(['admin']), modifierProfesseur);
router.delete('/:id', checkRole(['admin']), supprimerProfesseur);

export default router;