import database from '../db/database.js';
import logger from '../utils/logger.js';

class Classe {
  /**
   * Créer une nouvelle classe
   */
  static create(nom, niveau, capacite) {
    try {
      const query = database.prepare(`
        INSERT INTO classes (nom, niveau, capacite)
        VALUES (?, ?, ?)
      `);
      const result = query.run(nom, niveau, capacite);
      logger.info(`[Classe Model] Création réussie: class_id=${result.lastInsertRowid}, nom=${nom}`);
      return result;
    } catch (err) {
      logger.error(`[Classe Model] Erreur création: ${err.message}`);
      throw err;
    }
  }

  /**
   * Récupérer toutes les classes
   */
  static getAll() {
    const query = database.prepare('SELECT * FROM classes ORDER BY nom ASC');
    return query.all();
  }

  /**
   * Récupérer une classe par son ID
   */
  static getById(id) {
    const query = database.prepare('SELECT * FROM classes WHERE id = ?');
    return query.get(id);
  }

  /**
   * Récupérer une classe par son nom
   */
  static getByNom(nom) {
    const query = database.prepare('SELECT * FROM classes WHERE nom = ?');
    return query.get(nom);
  }

  /**
   * Rechercher des classes par nom ou niveau
   */
  static search(keyword) {
    const query = database.prepare(`
      SELECT * FROM classes
      WHERE nom LIKE ? OR niveau LIKE ?
      ORDER BY nom ASC
    `);
    const k = `%${keyword}%`;
    return query.all(k, k);
  }

  /**
   * Mettre à jour une classe
   */
  static update(id, nom, niveau, capacite) {
    try {
      const query = database.prepare(`
        UPDATE classes 
        SET nom = ?, niveau = ?, capacite = ?
        WHERE id = ?
      `);
      const result = query.run(nom, niveau, capacite, id);
      logger.info(`[Classe Model] Mise à jour réussie: class_id=${id}`);
      return result;
    } catch (err) {
      logger.error(`[Classe Model] Erreur mise à jour ID=${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * Supprimer une classe et réinitialiser les étudiants rattachés (SET NULL)
   */
  static delete(id) {
    try {
      // Exécution dans une transaction pour éviter les orphelins
      const deleteTransaction = database.transaction((classeId) => {
        // 1. Détacher les étudiants associés
        database.prepare('UPDATE students SET classe_id = NULL WHERE classe_id = ?').run(classeId);
        // 2. Détacher ou mettre à NULL les matières associées
        database.prepare('UPDATE subjects SET classe_id = NULL WHERE classe_id = ?').run(classeId);
        // 3. Supprimer la classe
        return database.prepare('DELETE FROM classes WHERE id = ?').run(classeId);
      });

      const result = deleteTransaction(id);
      logger.info(`[Classe Model] Suppression réussie: class_id=${id}`);
      return result;
    } catch (err) {
      logger.error(`[Classe Model] Erreur suppression ID=${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * Compter le nombre d'étudiants dans une classe
   */
  static countStudents(class_id) {
    const query = database.prepare(`
      SELECT COUNT(*) AS total 
      FROM students 
      WHERE classe_id = ?
    `);
    const result = query.get(class_id);
    return result ? result.total : 0;
  }

  /**
   * Récupérer les étudiants d'une classe
   */
  static getStudents(class_id) {
    const query = database.prepare(`
      SELECT id, matricule, nom, prenom, age, user_id 
      FROM students 
      WHERE classe_id = ?
      ORDER BY nom ASC, prenom ASC
    `);
    return query.all(class_id);
  }

  /**
   * Récupérer les matières associées à une classe
   */
  static getSubjects(class_id) {
    const query = database.prepare(`
      SELECT s.id, s.nom, t.nom AS teacher_nom
      FROM subjects s
      LEFT JOIN teachers t ON s.teacher_id = t.id
      WHERE s.classe_id = ?
      ORDER BY s.nom ASC
    `);
    return query.all(class_id);
  }
}

export default Classe;