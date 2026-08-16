// routes/absenceRoutes.js
import express from 'express';
import {
    ajouterAbsence,
    getHistoriqueAbsences,
    getHistoriqueEtudiant,
    modifierStatutAbsence,
    justifierAbsence,
    injustifierAbsence,
    supprimerAbsence
} from '../controllers/absencesControllers.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';


const router = express.Router();


router.use(verifyToken);


// CONSULTATION
router.get('/', checkRole(['admin', 'teacher']), getHistoriqueAbsences);
router.get('/student/:student_id', checkRole(['admin', 'teacher', 'student']), getHistoriqueEtudiant);

// GESTION → Admin uniquement
router.post('/', checkRole(['admin']), ajouterAbsence);
router.put('/:id/status', checkRole(['admin']), modifierStatutAbsence);
router.patch('/:id/justify', checkRole(['admin']), justifierAbsence);
router.patch('/:id/unjustify', checkRole(['admin']), injustifierAbsence);
router.delete('/:id', checkRole(['admin']), supprimerAbsence);
export default router;