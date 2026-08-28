<<<<<<< Updated upstream
﻿import Subjects from '../models/modelSubjects.js';
import logger from '../utils/logger.js';

export {
  addSubject,
  updateSubject,
  removeSubject,
  searchSubject,
  getSubjectById,
  listSubjects
};

function addSubject(nom, classe, teacher_id = null) {
  const result = Subjects.create(nom, classe, teacher_id);
  logger.info(`Matière ajoutée: ID=${result.lastInsertRowid}, Nom=${nom}, Classe=${classe}, Professeur ID=${teacher_id}`);
  return result.lastInsertRowid;
}

function updateSubject(id, nom, classe, teacher_id = null) {
  const result = Subjects.update(id, nom, classe, teacher_id);
  if (result.changes > 0) {
    logger.info(`Matière modifiée: ID=${id}, Nom=${nom}, Classe=${classe}, Professeur ID=${teacher_id}`);
  }
  return result.changes > 0;
}

function removeSubject(id) {
  const result = Subjects.delete(id);
  if (result.changes > 0) {
    logger.info(`Matière supprimée: ID=${id}`);
  }
  return result.changes > 0;
}

function searchSubject(keyword) {
  const results = Subjects.search(keyword);
  logger.info(`Recherche de matière: Mot-clé='${keyword}' (${results.length} résultats)`);
  return results;
}

function getSubjectById(id) {
  const subject = Subjects.getById(id);
  if (subject) {
    logger.info(`Matière trouvée par ID: ${id}`);
  }
  return subject;
}

function listSubjects() {
  const subjects = Subjects.getAll();
  logger.info(`Liste des matières consultée (${subjects.length} matières)`);
  return subjects;
}
=======
﻿import Subjects from '../models/modelSubjects.js';
import logger from '../utils/logger.js';

export {
  addSubject,
  updateSubject,
  removeSubject,
  searchSubject,
  getSubjectById,
  listSubjects
};

// ─────────────────────────────────────────────
// Ajoute une nouvelle matière
// ─────────────────────────────────────────────
async function addSubject(nom, classe_id, teacher_id = null) {
  const result = await Subjects.create(nom, classe_id, teacher_id);
  logger.info(`Matière ajoutée: ID=${result.lastInsertRowid}, Nom=${nom}, Classe ID=${classe_id}, Professeur ID=${teacher_id}`);
  return result.lastInsertRowid;
}

// ─────────────────────────────────────────────
// Met à jour une matière existante
// ─────────────────────────────────────────────
async function updateSubject(id, nom, classe_id, teacher_id = null) {
  const result = await Subjects.update(id, nom, classe_id, teacher_id);
  if (result.changes > 0) {
    logger.info(`Matière modifiée: ID=${id}, Nom=${nom}, Classe ID=${classe_id}, Professeur ID=${teacher_id}`);
  }
  return result.changes > 0;
}

// ─────────────────────────────────────────────
// Supprime une matière par son ID
// ─────────────────────────────────────────────
async function removeSubject(id) {
  const result = await Subjects.delete(id);
  if (result.changes > 0) {
    logger.info(`Matière supprimée: ID=${id}`);
  }
  return result.changes > 0;
}

// ─────────────────────────────────────────────
// Recherche des matières par mot-clé
// ─────────────────────────────────────────────
async function searchSubject(keyword) {
  const results = await Subjects.search(keyword);
  logger.info(`Recherche de matière: Mot-clé='${keyword}' (${results.length} résultats)`);
  return results;
}

// ─────────────────────────────────────────────
// Récupère une matière par son ID
// ─────────────────────────────────────────────
async function getSubjectById(id) {
  const subject = await Subjects.getById(id);
  if (subject) {
    logger.info(`Matière trouvée par ID: ${id}`);
  }
  return subject;
}

// ─────────────────────────────────────────────
// Liste toutes les matières
// ─────────────────────────────────────────────
async function listSubjects() {
  const subjects = await Subjects.getAll();
  logger.info(`Liste des matières consultée (${subjects.length} matières)`);
  return subjects;
}
>>>>>>> Stashed changes
