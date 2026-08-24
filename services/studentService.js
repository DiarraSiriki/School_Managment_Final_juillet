import Student from '../models/modelStudent.js';
import logger from '../utils/logger.js';
import { addUser } from './userService.js';
import { isClassFull } from './classeService.js';
import Classe from '../models/modelClass.js';

function addStudent(matricule, nom, prenom, age, classe_id, email, mot_passe) {
  if (!matricule || !String(matricule).trim()) {
    throw new Error('Le matricule est obligatoire.');
  }

  const cleanMatricule = String(matricule).trim();

  const existingStudent = findStudentByMatricule(cleanMatricule);
  if (existingStudent) {
    logger.warn(`Échec de l'ajout : Le matricule ${cleanMatricule} est déjà utilisé.`);
    throw new Error(`Le matricule '${cleanMatricule}' appartient déjà à un étudiant.`);
  }

  if (!classe_id) {
    throw new Error('La classe est obligatoire.');
  }

  const classe = Classe.getById(classe_id);
  if (!classe) {
    logger.warn(`Échec de l'ajout : La classe ID=${classe_id} n'existe pas.`);
    throw new Error(`La classe sélectionnée n'existe pas.`);
  }

  if (isClassFull(classe_id)) {
    logger.warn(`Échec de l'ajout : La classe "${classe.nom}" est pleine (${classe.capacite}).`);
    throw new Error(`Impossible d'ajouter l'étudiant : la classe "${classe.nom}" est pleine.`);
  }

  if (!email || !mot_passe) {
    throw new Error('Email et mot de passe sont obligatoires pour créer un étudiant.');
  }

  // Création du compte utilisateur associé
  const userResult = addUser(`${prenom} ${nom}`.trim(), 'student', email, mot_passe, {
    matricule: cleanMatricule,
    nom,
    prenom,
    age,
    classe_id
  });
  const userId = userResult?.id ?? userResult;

  // La fiche étudiant est déjà créée par addUser, on récupère juste l'ID
  const student = Student.getByUserId(userId);
  const studentId = student ? student.id : null;

  if (!studentId) {
    logger.error(`Erreur: Fiche étudiant non trouvée après création pour user_id=${userId}`);
    throw new Error('Erreur lors de la création de la fiche étudiant');
  }

  logger.info(`Étudiant ajouté : ID=${studentId}, Matricule=${cleanMatricule}, ClasseID=${classe_id}, UserID=${userId}`);

  return { id: studentId, matricule: cleanMatricule };
}

function updateStudent(id, matricule, nom, prenom, age, classe_id, user_id = null) {
  const existingStudent = Student.getById(id);
  if (!existingStudent) {
    throw new Error(`Étudiant avec l'ID ${id} introuvable.`);
  }

  const targetMatricule = (matricule && String(matricule).trim())
    ? String(matricule).trim()
    : existingStudent.matricule;

  if (targetMatricule !== existingStudent.matricule) {
    const other = findStudentByMatricule(targetMatricule);
    if (other && String(other.id) !== String(id)) {
      throw new Error(`Le matricule '${targetMatricule}' appartient déjà à un autre étudiant.`);
    }
  }

  const targetClasseId = (classe_id !== undefined && classe_id !== null && classe_id !== '')
    ? classe_id
    : existingStudent.classe_id;

  if (targetClasseId && String(targetClasseId) !== String(existingStudent.classe_id)) {
    const classe = Classe.getById(targetClasseId);
    if (!classe) {
      throw new Error(`La classe sélectionnée n'existe pas.`);
    }
    if (isClassFull(targetClasseId)) {
      throw new Error(`Impossible de transférer l'étudiant : la classe "${classe.nom}" est pleine.`);
    }
  }

  const targetUserId = (user_id !== null && user_id !== undefined)
    ? user_id
    : existingStudent.user_id;

  const result = Student.update(id, targetMatricule, nom, prenom, age, targetClasseId, targetUserId);

  if (result.changes > 0) {
    logger.info(`Étudiant modifié: ID=${id}`);
  }

  return result.changes > 0;
}

function removeStudent(id) {
  const result = Student.delete(id);
  if (result.changes > 0) {
    logger.info(`Étudiant supprimé: ID=${id}`);
  }
  return result.changes > 0;
}

function searchStudent(keyword) {
  return Student.search(keyword);
}

function listStudents() {
  return Student.getAll();
}

function findStudentByMatricule(matricule) {
  return Student.getByMatricule(matricule);
}

function getStudentById(id) {
  return Student.getById(id);
}

function getStudentByUserId(user_id) {
  return Student.getByUserId(user_id);
}

export {
  addStudent,
  updateStudent,
  removeStudent,
  searchStudent,
  listStudents,
  findStudentByMatricule,
  getStudentById,
  getStudentByUserId
};