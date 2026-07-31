// routes/statsRoutes.js
import express from 'express';
import {
    getMoyenneGenerale,
    getClassement,
    getMeilleurEtudiant,
    getStatsAbsencesGlobales,
    getStatsAbsencesParEtudiant,
    getStats
} from '../controllers/statsControllers.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';


const router = express.Router();

// Protège toutes les routes avec verifyToken
router.use(verifyToken);

// Routes de statistiques (accessibles par admin et teacher)
router.get('/', checkRole(['admin', 'teacher']), getStats);
router.get('/average', checkRole(['admin', 'teacher']), getMoyenneGenerale);
router.get('/rankings', checkRole(['admin', 'teacher']), getClassement);
router.get('/best-student', checkRole(['admin', 'teacher']), getMeilleurEtudiant);
router.get('/absences', checkRole(['admin', 'teacher']), getStatsAbsencesGlobales);
router.get('/absences/student/:student_id', checkRole(['admin', 'teacher', 'student']), getStatsAbsencesParEtudiant);

export default router;