import User from '../models/modelUsers.js';
import logger from '../utils/logger.js';
import bcrypt from 'bcryptjs';

export { addUser, authenticate, removeUser, listUsers };

function addUser(name, role, email, mot_passe) {
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

      // Hasher le mot de passe avec bcrypt
      const saltRounds = 10;
      const hashedPassword = bcrypt.hashSync(passwordToSave, saltRounds);

      const result = User.create(name, role, emailToSave, hashedPassword);
      logger.info(`Utilisateur ajouté: ID=${result.lastInsertRowid}, Nom=${name}, Rôle=${role}`);
      return result.lastInsertRowid;
}

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

      let isValid = false;

      if (typeof storedPassword === 'string' && storedPassword.startsWith('$2')) {
            isValid = bcrypt.compareSync(passwordToVerify, storedPassword);
      } else {
            isValid = passwordToVerify === storedPassword;

            if (isValid) {
                  const saltRounds = 10;
                  const hashedPassword = bcrypt.hashSync(passwordToVerify, saltRounds);
                  User.update(user.id, user.name, user.role, user.email, hashedPassword);
            }
      }

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