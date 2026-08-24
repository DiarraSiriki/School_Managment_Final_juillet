import User from '../models/modelUsers.js';
import Student from '../models/modelStudent.js';
import Teacher from '../models/modelTeacher.js';
import Classe from '../models/modelClass.js';
import logger from '../utils/logger.js';

export {
  addUser,
  authenticate,
  removeUser,
  listUsers,
  getUserById,
  updateUser
};

/**
 * Découpe un nom complet en (prenom, nom).
 * "Jean Dupont" -> prenom=Jean, nom=Dupont
 * "Dupont"     -> prenom="", nom=Dupont
 */
function splitFullName(fullName) {
  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { prenom: '', nom: '' };
  if (parts.length === 1) return { prenom: '', nom: parts[0] };
  return { prenom: parts[0], nom: parts.slice(1).join(' ') };
}

function addUser(name, role, email, mot_passe, extra = {}) {
  const emailToSave = (email || '').toLowerCase().trim();
  const passwordToSave = mot_passe;

  if (!passwordToSave) {
    logger.error(`Tentative d'ajout de l'utilisateur ${name} sans mot de passe.`);
    throw new Error('Le mot de passe ne peut pas être vide.');
  }

  if (!name || !role || !emailToSave) {
    throw new Error('name, role et email sont requis.');
  }

  const allowedRoles = ['admin', 'teacher', 'student'];
  if (!allowedRoles.includes(role)) {
    throw new Error(`Rôle invalide. Valeurs autorisées : ${allowedRoles.join(', ')}`);
  }

  const existingUser = User.getByEmail(emailToSave);
  if (existingUser) {
    logger.error(`Email déjà utilisé : ${emailToSave}`);
    throw new Error('Cet email est déjà utilisé.');
  }

  // Validations spécifiques avant création du user
  if (role === 'teacher') {
    if (!extra.matiere || !String(extra.matiere).trim()) {
      throw new Error('La matière est obligatoire pour un professeur.');
    }
  }

  if (role === 'student') {
    if (!extra.matricule || !String(extra.matricule).trim()) {
      throw new Error('Le matricule est obligatoire pour un étudiant.');
    }
    if (!extra.classe_id) {
      throw new Error('La classe est obligatoire pour un étudiant.');
    }
    const classe = Classe.getById(extra.classe_id);
    if (!classe) {
      throw new Error('La classe sélectionnée n\'existe pas.');
    }
  }

  const result = User.create(name, role, emailToSave, passwordToSave);
  const userId = result.id;

  logger.info(`Utilisateur ajouté: ID=${userId}, Nom=${name}, Rôle=${role}`);

  // Créer la fiche liée dans teachers / students
  try {
    if (role === 'teacher') {
      const matiere = String(extra.matiere).trim();
      Teacher.create(name, matiere, userId);
      logger.info(`Fiche professeur créée pour user_id=${userId}, matière=${matiere}`);
    } else if (role === 'student') {
      const { prenom, nom } = extra.prenom && extra.nom
        ? { prenom: extra.prenom, nom: extra.nom }
        : splitFullName(name);
      const matricule = String(extra.matricule).trim();
      const age = extra.age != null && extra.age !== '' ? Number(extra.age) : 18;
      Student.create(matricule, nom || name, prenom, age, extra.classe_id, userId);
      logger.info(`Fiche étudiant créée pour user_id=${userId}, matricule=${matricule}`);
    }
  } catch (err) {
    // Rollback du user si la fiche liée échoue
    logger.error(`Échec création fiche liée pour user ${userId}: ${err.message}`);
    try { User.delete(userId); } catch (_) {}
    throw err;
  }

  return { id: userId };
}

function getUserById(id) {
  return User.getById(id);
}

function authenticate(email, mot_passe) {
  const emailToVerify = (email || '').toLowerCase().trim();
  if (!emailToVerify || !mot_passe) return null;

  const user = User.getByEmail(emailToVerify);
  if (!user || !user.mot_passe) return null;

  return mot_passe === user.mot_passe ? user : null;
}

function removeUser(id) {
  // Supprimer d'abord les fiches liées
  try {
    const teacher = Teacher.getByUserId(id);
    if (teacher) Teacher.delete(teacher.id);
  } catch (e) {
    logger.warn(`Suppression teacher liée user ${id}: ${e.message}`);
  }
  try {
    const student = Student.getByUserId(id);
    if (student) Student.delete(student.id);
  } catch (e) {
    logger.warn(`Suppression student liée user ${id}: ${e.message}`);
  }

  const result = User.delete(id);
  if (result.changes > 0) {
    logger.info(`Utilisateur supprimé: ID=${id}`);
    return true;
  }
  return false;
}

function listUsers() {
  const users = User.getAll();

  // Joindre les infos students / teachers liés par user_id
  const usersWithDetails = users.map(user => {
    let details = {};

    if (user.role === 'student') {
      const student = Student.getByUserId(user.id);
      if (student) {
        details = {
          matricule: student.matricule,
          nom: student.nom,
          prenom: student.prenom,
          age: student.age,
          classe_id: student.classe_id
        };
      }
    } else if (user.role === 'teacher') {
      const teacher = Teacher.getByUserId(user.id);
      if (teacher) {
        details = {
          nom: teacher.nom,
          matiere: teacher.matiere,
          classe_id: teacher.classe_id
        };
      }
    }

    return {
      ...user,
      ...details
    };
  });

  // Inclure aussi les étudiants/profs orphelins (sans user_id valide)
  const linkedStudentUserIds = new Set(
    users.filter(u => u.role === 'student').map(u => u.id)
  );
  const linkedTeacherUserIds = new Set(
    users.filter(u => u.role === 'teacher').map(u => u.id)
  );

  const orphanStudents = Student.getAll()
    .filter(s => !s.user_id || !linkedStudentUserIds.has(s.user_id))
    .map(s => ({
      id: `student-${s.id}`,
      name: `${s.prenom || ''} ${s.nom || ''}`.trim() || s.nom,
      role: 'student',
      email: null,
      matricule: s.matricule,
      nom: s.nom,
      prenom: s.prenom,
      age: s.age,
      classe_id: s.classe_id,
      _orphan: true
    }));

  const orphanTeachers = Teacher.getAll()
    .filter(t => !t.user_id || !linkedTeacherUserIds.has(t.user_id))
    .map(t => ({
      id: `teacher-${t.id}`,
      name: t.nom,
      role: 'teacher',
      email: null,
      nom: t.nom,
      matiere: t.matiere,
      classe_id: t.classe_id,
      _orphan: true
    }));

  const all = [...usersWithDetails, ...orphanStudents, ...orphanTeachers];
  logger.info(`Liste des utilisateurs consultée (${all.length} entrées)`);
  return all;
}

function updateUser(id, name, role, email, mot_passe, extra = {}) {
  const currentUser = User.getById(id);
  if (!currentUser) return false;

  let passwordToSave = mot_passe;
  if (!passwordToSave) {
    const fullUser = User.getByEmail(currentUser.email);
    passwordToSave = fullUser?.mot_passe;
  }

  const emailToSave = email ? email.toLowerCase().trim() : currentUser.email;
  const nameToSave = name || currentUser.name;
  const roleToSave = role || currentUser.role;

  const result = User.update(id, nameToSave, roleToSave, emailToSave, passwordToSave);

  // Mettre à jour / créer la fiche liée selon le rôle
  try {
    if (roleToSave === 'teacher') {
      let teacher = Teacher.getByUserId(id);
      const matiere = (extra.matiere != null && String(extra.matiere).trim())
        ? String(extra.matiere).trim()
        : (teacher ? teacher.matiere : 'Non spécifiée');

      if (teacher) {
        Teacher.update(teacher.id, nameToSave, matiere, id);
      } else {
        Teacher.create(nameToSave, matiere, id);
      }
    } else if (roleToSave === 'student') {
      let student = Student.getByUserId(id);
      const { prenom, nom } = splitFullName(nameToSave);

      if (student) {
        const matricule = (extra.matricule && String(extra.matricule).trim())
          ? String(extra.matricule).trim()
          : student.matricule;
        const classe_id = (extra.classe_id != null && extra.classe_id !== '')
          ? extra.classe_id
          : student.classe_id;
        const age = (extra.age != null && extra.age !== '')
          ? Number(extra.age)
          : student.age;

        Student.update(student.id, matricule, nom || nameToSave, prenom, age, classe_id, id);
      } else {
        // Création d'une fiche manquante
        if (!extra.matricule || !extra.classe_id) {
          logger.warn(`Impossible de créer la fiche étudiant pour user ${id}: matricule/classe manquants`);
        } else {
          const age = extra.age != null && extra.age !== '' ? Number(extra.age) : 18;
          Student.create(String(extra.matricule).trim(), nom || nameToSave, prenom, age, extra.classe_id, id);
        }
      }
    }
  } catch (err) {
    logger.error(`Erreur mise à jour fiche liée user ${id}: ${err.message}`);
  }

  if (result.changes > 0) {
    logger.info(`Utilisateur modifié: ID=${id}, Nom=${nameToSave}, Rôle=${roleToSave}`);
    return true;
  }
  return true;
}