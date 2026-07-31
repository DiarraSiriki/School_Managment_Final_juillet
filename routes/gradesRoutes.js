// routes/gradeRoutes.js
import express from 'express';
import {
    getNotes,
    getNoteParId,
    getNotesParEtudiant,
    getMoyenneEtudiant,
    ajouterNote,
    modifierNote,
    supprimerNote
} from '../controllers/gradesControllers.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';


const router = express.Router();

// Protège toutes les routes avec verifyToken
router.use(verifyToken);

// Routes de lecture (accessibles par admin, teacher et student)
router.get('/', checkRole(['admin', 'teacher']), getNotes);
router.get('/student/:student_id', checkRole(['admin', 'teacher', 'student']), getNotesParEtudiant);
router.get('/student/:student_id/average', checkRole(['admin', 'teacher', 'student']), getMoyenneEtudiant);
router.get('/:id', checkRole(['admin', 'teacher', 'student']), getNoteParId);

// Routes d'écriture (accessibles par admin et teacher)
router.post('/', checkRole(['admin', 'teacher']), ajouterNote);
router.put('/:id', checkRole(['admin', 'teacher']), modifierNote);
router.delete('/:id', checkRole(['admin']), supprimerNote);

export default router;