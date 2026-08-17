
import User from '../models/modelUsers.js';
import logger from '../utils/logger.js';

export {
  addUser,
  authenticate,
  removeUser,
  listUsers,
  getUserById,
  updateUser
};

function addUser(name, role, email, mot_passe) {
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

  const result = User.create(name, role, emailToSave, passwordToSave);
  logger.info(`Utilisateur ajouté: ID=${result.id}, Nom=${name}, Rôle=${role}`);
  return { id: result.id };
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
  const result = User.delete(id);
  if (result.changes > 0) {
    logger.info(`Utilisateur supprimé: ID=${id}`);
    return true;
  }
  return false;
}

function listUsers() {
  const users = User.getAll();
  logger.info(`Liste des utilisateurs consultée (${users.length} utilisateurs)`);
  return users;
}

function updateUser(id, name, role, email, mot_passe) {
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

  if (result.changes > 0) {
    logger.info(`Utilisateur modifié: ID=${id}, Nom=${nameToSave}, Rôle=${roleToSave}`);
    return true;
  }
  return false;
}
