// routes/adminRoutes.js
import express from 'express';
import {
   
    getUtilisateurs,
    ajouterUtilisateur,
    supprimerUtilisateur
} from '../controllers/usersControllers.js';


const router = express.Router();
    
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';



// 1. Verrouille TOUTES les routes définies ci-dessous avec le Token
router.use(verifyToken);

//  2. Applique le filtre de rôle selon l'action
router.get('/', checkRole(['admin']), getUtilisateurs);
router.post('/', checkRole(['admin']), ajouterUtilisateur);
router.delete('/:id', checkRole(['admin']), supprimerUtilisateur);

export default router;