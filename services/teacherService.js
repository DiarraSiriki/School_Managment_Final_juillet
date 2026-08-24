import Teacher from '../models/modelTeacher.js';
import User from '../models/modelUsers.js';
import database from '../db/database.js';
import logger from '../utils/logger.js';
import { addUser } from './userService.js';

export {
  addTeacher,
  updateTeacher,
  removeTeacher,
  searchTeacher,
  listTeachers,
  getTeacherById,
  getTeacherByUserId
};

function addTeacher(nom, matiere, email, password) {
  const userResult = addUser(nom, 'teacher', email, password, { matiere });
  const userId = userResult?.id ?? userResult;

  // La fiche professeur est déjà créée par addUser, on récupère juste l'ID
  const teacher = Teacher.getByUserId(userId);
  const teacherId = teacher ? teacher.id : null;

  if (!teacherId) {
    logger.error(`Erreur: Fiche professeur non trouvée après création pour user_id=${userId}`);
    throw new Error('Erreur lors de la création de la fiche professeur');
  }

  logger.info(`Professeur ajouté: ID=${teacherId}, Nom=${nom}, UserID=${userId}`);
  return teacherId;
}

function updateTeacher(id, nom, matiere, email = null, password = null) {
  const teacher = Teacher.getById(id);
  if (!teacher) {
    logger.error(`Professeur introuvable: ID=${id}`);
    return false;
  }

  let tableTeachersModifiee = false;
  let tableUsersModifiee = false;

  const resultTeacher = Teacher.update(id, nom, matiere, teacher.user_id);
  if (resultTeacher && resultTeacher.changes > 0) {
    tableTeachersModifiee = true;
  }

  if (teacher.user_id) {
    const updates = [];
    const values = [];

    if (nom) {
      updates.push('name = ?');
      values.push(nom);
    }
    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (password) {
      updates.push('mot_passe = ?');
      values.push(password);
    }

    if (updates.length > 0) {
      values.push(teacher.user_id);
      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

      const resultUser = database.prepare(query).run(...values);
      if (resultUser && resultUser.changes > 0) {
        tableUsersModifiee = true;
      }
    }
  }

  const modificationEffectuee = tableTeachersModifiee || tableUsersModifiee;

  if (modificationEffectuee) {
    logger.info(`Professeur modifié avec succès: ID=${id}`);
    return true;
  } else {
    logger.info(`Mise à jour demandée pour l'ID=${id} mais aucune donnée n'a changé.`);
    return true;
  }
}

function removeTeacher(id) {
  const result = Teacher.delete(id);
  if (result.changes > 0) {
    logger.info(`Professeur supprimé: ID=${id}`);
  }
  return result.changes > 0;
}

function searchTeacher(keyword) {
  return Teacher.search(keyword);
}

function listTeachers() {
  return Teacher.getAll();
}

function getTeacherById(id) {
  return Teacher.getById(id);
}

function getTeacherByUserId(user_id) {
  return Teacher.getByUserId(user_id);
}