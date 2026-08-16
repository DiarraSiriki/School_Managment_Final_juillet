import User from '../models/modelUsers.js';
import logger from '../utils/logger.js';

export { addUser, authenticate, removeUser, listUsers, getUserById , updateUser};

function addUser(name, role, email, mot_passe, matricule = null) {
  let passwordToSave = mot_passe;
  let emailToSave = email.toLowerCase().trim(); // Nettoyage systématique de l'email

  if (!passwordToSave) {
    logger.error(`Tentative d'ajout de l'utilisateur ${name} sans mot de passe.`);
    throw new Error("Le mot de passe ne peut pas être vide (NOT NULL constraint).");
  }

  const existingUser = User.getByEmail(emailToSave);

  if (existingUser) {
    logger.error(`Tentative d'ajout de l'utilisateur ${name} avortée : l'email ${emailToSave} est déjà utilisé.`);
    throw new Error("UNIQUE constraint failed: users.email");
  }

  // Hachage temporairement désactivé : stockage en clair
  const passwordToStore = passwordToSave;

  // Création via le modèle (génère ou applique le matricule)
  const result = User.create(name, role, emailToSave, passwordToStore, matricule);
  
  logger.info(`Utilisateur ajouté: ID=${result.id}, Nom=${name}, Rôle=${role}, Matricule=${result.matricule}`);
  
  // Retourne l'ID généré pour conserver la compatibilité
  return result.id;
}

function getUserById(id) {
  return User.getById(id);
};

function authenticate(email, mot_passe) {
  let emailToVerify = (email || '').toLowerCase().trim();
  let passwordToVerify = mot_passe;

  const user = User.getByEmail(emailToVerify);

  if (!user || !passwordToVerify) {
    return null;
  }

  const storedPassword = user.mot_passe;

  if (!storedPassword) {
    return null;
  }

  const isValid = passwordToVerify === storedPassword;

  return isValid ? user : null;
}

function removeUser(id) {
  let idToDelete = id;

  const result = User.delete(idToDelete);

  if (result.changes > 0) {
    logger.info(`Utilisateur supprimé: ID=${idToDelete}`);
    return true;
  } else {
    return false;
  }
}

function listUsers() {
  const users = User.getAll();

  logger.info(`Liste des utilisateurs consultée (${users.length} utilisateurs)`);
  return users;
}

function updateUser(id, name, role, email, mot_passe, matricule = null) {
  const currentUser = User.getById(id); 
  if (!currentUser) {
    return false;
  }

  // Si aucun nouveau mot de passe n'est fourni, on garde l'ancien
  let passwordToSave = mot_passe;
  if (!passwordToSave) {
    const fullUser = User.getByEmail(currentUser.email); 
    passwordToSave = fullUser?.mot_passe;
  }

  const result = User.update(id, name, role, email, passwordToSave, matricule);

  if (result.changes > 0) {
    logger.info(`Utilisateur modifié: ID=${id}, Nom=${name}, Rôle=${role}`);
    return true;
  }
  return false;
}