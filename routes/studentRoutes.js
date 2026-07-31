// routes/studentRoutes.js
import express from 'express';
import {
    getEtudiants,
    getEtudiantParId,
    getEtudiantParMatricule,
    getMonProfilEtudiant,
    chercherEtudiant,
    ajouterEtudiant,
    modifierEtudiant,
    supprimerEtudiant
} from '../controllers/studentControllers.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';


const router = express.Router();

// Protège toutes les routes avec verifyToken
router.use(verifyToken);

// Routes de lecture (accessibles par admin et teacher)
router.get('/', checkRole(['admin', 'teacher']), getEtudiants);
router.get('/search', checkRole(['admin', 'teacher']), chercherEtudiant);
router.get('/me', checkRole(['student']), getMonProfilEtudiant);
router.get('/matricule/:matricule', checkRole(['admin', 'teacher', 'student']), getEtudiantParMatricule);
router.get('/:id', checkRole(['admin', 'teacher', 'student']), getEtudiantParId);

// Routes d'écriture (accessibles par admin uniquement)
router.post('/', checkRole(['admin']), ajouterEtudiant);
router.put('/:id', checkRole(['admin']), modifierEtudiant);
router.delete('/:id', checkRole(['admin']), supprimerEtudiant);

export default router;