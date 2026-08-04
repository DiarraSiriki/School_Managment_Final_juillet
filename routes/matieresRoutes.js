// routes/subjectRoutes.js
import express from 'express';
import {
    getMatieres,
    getMatiereParId,
    chercherMatiere,
    ajouterMatiere,
    modifierMatiere,
    supprimerMatiere
} from '../controllers/matieresControllers.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';


const router = express.Router();

// Protège toutes les routes avec verifyToken
router.use(verifyToken);

router.get('/', checkRole(['admin', 'teacher', 'student']), getMatieres);
router.get('/search', checkRole(['admin', 'teacher', 'student']), chercherMatiere);
router.get('/:id', checkRole(['admin', 'teacher', 'student']), getMatiereParId);


router.post('/', checkRole(['admin']), ajouterMatiere);
router.put('/:id', checkRole(['admin']), modifierMatiere);
router.delete('/:id', checkRole(['admin']), supprimerMatiere);

export default router;