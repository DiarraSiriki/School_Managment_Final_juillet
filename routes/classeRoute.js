import express from 'express';
import {
 handleCreateClasse,handleGetAllClasses,
    handleGetClasseById,handleGetClasseDetails,
    handleUpdateClasse,handleDeleteClasse
} from '../controllers/classesController.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);


router.get('/', checkRole(['admin', 'teacher']), handleGetAllClasses);
router.get('/:id', checkRole(['admin', 'teacher']), handleGetClasseById);
router.get('/:id/details', checkRole(['admin', 'teacher']), handleGetClasseDetails);

router.post('/', checkRole(['admin']), handleCreateClasse);
router.put('/:id', checkRole(['admin']), handleUpdateClasse);
router.delete('/:id', checkRole(['admin']), handleDeleteClasse);

export default router;