import Classe from '../models/modelClass.js';
import logger from '../utils/logger.js';


 const createClasse = (data) => {
  const { nom, niveau, capacite } = data;

  if (!nom || !niveau || capacite === undefined) {
    throw new Error('Les champs nom, niveau et capacité sont obligatoires.');
  }

  if (capacite <= 0) {
    throw new Error('La capacité doit être un nombre positif supérieur à zéro.');
  }

  const existing = Classe.getByNom(nom);
  if (existing) {
    throw new Error(`Une classe avec le nom "${nom}" existe déjà.`);
  }

  return Classe.create(nom, niveau, capacite);
};


const getAllClasses = () => {
  return Classe.getAll();
};


const getClasseById = (id) => {
  const classe = Classe.getById(id);
  if (!classe) {
    throw new Error(`Classe avec l'ID ${id} introuvable.`);
  }
  return classe;
};


const updateClasse = (id, data) => {
  const { nom, niveau, capacite } = data;

  const existingClasse = Classe.getById(id);
  if (!existingClasse) {
    throw new Error(`Classe avec l'ID ${id} introuvable.`);
  }

  if (nom && nom !== existingClasse.nom) {
    const duplicateNom = Classe.getByNom(nom);
    if (duplicateNom) {
      throw new Error(`Une autre classe utilise déjà le nom "${nom}".`);
    }
  }

  // Vérification de la capacité par rapport au nombre d'étudiants actuels
  const currentStudentsCount = Classe.countStudents(id);
  const newCapacite = capacite !== undefined ? capacite : existingClasse.capacite;

  if (newCapacite < currentStudentsCount) {
    throw new Error(
      `Impossible de réduire la capacité à ${newCapacite} : la classe contient déjà ${currentStudentsCount} étudiant(s).`
    );
  }

  const updatedNom = nom || existingClasse.nom;
  const updatedNiveau = niveau || existingClasse.niveau;

  return Classe.update(id, updatedNom, updatedNiveau, newCapacite);
};


const deleteClasse = (id) => {
  const existingClasse = Classe.getById(id);
  if (!existingClasse) {
    throw new Error(`Classe avec l'ID ${id} introuvable.`);
  }

  const studentsCount = Classe.countStudents(id);
  if (studentsCount > 0) {
    logger.warn(`[Classe Service] Suppression de la classe ID=${id} contenant ${studentsCount} élève(s). Les élèves auront leur classe_id réinitialisé à NULL.`);
  }

  return Classe.delete(id);
};


const isClassFull = (class_id) => {
  const classe = Classe.getById(class_id);
  if (!classe) {
    throw new Error(`Classe introuvable.`);
  }

  const currentCount = Classe.countStudents(class_id);
  return currentCount >= classe.capacite;
};


const getClasseDetails = (id) => {
  const classe = Classe.getById(id);
  if (!classe) {
    throw new Error(`Classe avec l'ID ${id} introuvable.`);
  }

  const students = Classe.getStudents(id);
  const subjects = Classe.getSubjects(id);

  return {
    ...classe,
    effectif_actuel: students.length,
    students,
    subjects
  };
};

export {
  createClasse,
  getAllClasses,
    getClasseById,
    updateClasse,
    deleteClasse,
    isClassFull,
    getClasseDetails
};