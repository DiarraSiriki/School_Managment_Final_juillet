import Student from '../models/modelStudent.js';
import logger from '../utils/logger.js';
import { addUser } from './userService.js';
import { isClassFull, resolveClasseId } from './classeService.js';
import Classe from '../models/modelClass.js';

/**
 * Ajoute un étudiant.
 * classe_id OU classe (nom libre) est accepté.
 * Si le nom n'existe pas en base, la classe est créée automatiquement.
 */
function addStudent(matricule, nom, prenom, age, classe_id, email, mot_passe, classe = null) {
  if (!matricule || !String(matricule).trim()) {
    throw new Error('Le matricule est obligatoire.');
  }

  const cleanMatricule = String(matricule).trim();

  const existingStudent = findStudentByMatricule(cleanMatricule);
  if (existingStudent) {
    logger.warn(`Échec de l'ajout : Le matricule ${cleanMatricule} est déjà utilisé.`);
    throw new Error(`Le matricule '${cleanMatricule}' appartient déjà à un étudiant.`);
  }

  const resolvedClasseId = resolveClasseId({ classe_id, classe });

  if (isClassFull(resolvedClasseId)) {
    const classeInfo = Classe.getById(resolvedClasseId);
    logger.warn(`Échec de l'ajout : La classe "${classeInfo?.nom}" est pleine (${classeInfo?.capacite}).`);
    throw new Error(`Impossible d'ajouter l'étudiant : la classe "${classeInfo?.nom}" est pleine.`);
  }

  if (!email || !mot_passe) {
    throw new Error('Email et mot de passe sont obligatoires pour créer un étudiant.');
  }

  // Création user + fiche étudiant via addUser (évite le double insert)
  const userResult = addUser(
    `${prenom} ${nom}`.trim(),
    'student',
    email,
    mot_passe,
    {
      matricule: cleanMatricule,
      classe_id: resolvedClasseId,
      age,
      prenom,
      nom
    }
  );
  const userId = userResult?.id ?? userResult;

  const student = Student.getByUserId(userId) || Student.getByMatricule(cleanMatricule);
  const studentId = student?.id;

  logger.info(`Étudiant ajouté : ID=${studentId}, Matricule=${cleanMatricule}, ClasseID=${resolvedClasseId}, UserID=${userId}`);

  return { id: studentId, matricule: cleanMatricule, classe_id: resolvedClasseId };
}

function updateStudent(id, matricule, nom, prenom, age, classe_id, user_id = null, classe = null) {
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

  let targetClasseId = existingStudent.classe_id;
  if ((classe && String(classe).trim()) || (classe_id !== undefined && classe_id !== null && classe_id !== '')) {
    targetClasseId = resolveClasseId({ classe_id, classe });
  }

  if (targetClasseId && String(targetClasseId) !== String(existingStudent.classe_id)) {
    if (isClassFull(targetClasseId)) {
      const classeInfo = Classe.getById(targetClasseId);
      throw new Error(`Impossible de transférer l'étudiant : la classe "${classeInfo?.nom}" est pleine.`);
    }
  }

  const targetUserId = (user_id !== null && user_id !== undefined)
    ? user_id
    : existingStudent.user_id;

  const result = Student.update(id, targetMatricule, nom, prenom, age, targetClasseId, targetUserId);

  if (result.changes > 0) {
    logger.info(`Étudiant modifié: ID=${id}, ClasseID=${targetClasseId}`);
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
