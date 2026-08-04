import {
  createClasse,
  getAllClasses,
  getClasseById,
  updateClasse,
  deleteClasse,
  getClasseDetails
} from '../services/classeService.js';
import logger from '../utils/logger.js';


 const handleCreateClasse = (req, res) => {
  try {
    const newClasse = createClasse(req.body);
    res.status(201).json({
      success: true,
      message: 'Classe créée avec succès',
      data: newClasse
    });
  } catch (error) {
    logger.error(`[Classes Controller] Erreur création: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


const handleGetAllClasses = (req, res) => {
  try {
    const classes = getAllClasses();
    res.status(200).json({
      success: true,
      data: classes
    });
  } catch (error) {
    logger.error(`[Classes Controller] Erreur lecture des classes: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des classes.'
    });
  }
};


const handleGetClasseById = (req, res) => {
  try {
    const id = req.params.id;
    const classe = getClasseById(id);
    res.status(200).json({
      success: true,
      data: classe
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};


const handleGetClasseDetails = (req, res) => {
  try {
    const id = req.params.id;
    const details = getClasseDetails(id);
    res.status(200).json({
      success: true,
      data: details
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};


const handleUpdateClasse = (req, res) => {
  try {
    const id = req.params.id;
    updateClasse(id, req.body);
    res.status(200).json({
      success: true,
      message: 'Classe mise à jour avec succès'
    });
  } catch (error) {
    logger.error(`[Classes Controller] Erreur modification ID=${req.params.id}: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


const handleDeleteClasse = (req, res) => {
  try {
    const id = req.params.id;
    deleteClasse(id);
    res.status(200).json({
      success: true,
      message: 'Classe supprimée avec succès'
    });
  } catch (error) {
    logger.error(`[Classes Controller] Erreur suppression ID=${req.params.id}: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export {
  handleCreateClasse,
  handleGetAllClasses,
    handleGetClasseById,
    handleGetClasseDetails,
    handleUpdateClasse,
    handleDeleteClasse
};