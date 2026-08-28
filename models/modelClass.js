import { execute, executeBatch } from '../db/database.js';
import logger from '../utils/logger.js';

class Classe {
  /**
   * Créer une nouvelle classe
   */
  static async create(nom, niveau, capacite) {
    try {
      const query = `
        INSERT INTO classes (nom, niveau, capacite)
        VALUES (?, ?, ?)
      `;
      const result = await execute(query, [nom, niveau, capacite]);
      logger.info(`[Classe Model] Création réussie: class_id=${result.lastInsertRowid}, nom=${nom}`);
      return { lastInsertRowid: result.lastInsertRowid };
    } catch (err) {
      logger.error(`[Classe Model] Erreur création: ${err.message}`);
      throw err;
    }
  }

  /**
   * Récupérer toutes les classes
   */
  static async getAll() {
    const query = 'SELECT * FROM classes ORDER BY nom ASC';
    const result = await execute(query);
    return result.rows;
  }

  /**
   * Récupérer une classe par son ID
   */
  static async getById(id) {
    const query = 'SELECT * FROM classes WHERE id = ?';
    const result = await execute(query, [id]);
    return result.rows[0];
  }

  /**
   * Récupérer une classe par son nom
   */
  static async getByNom(nom) {
    const query = 'SELECT * FROM classes WHERE nom = ?';
    const result = await execute(query, [nom]);
    return result.rows[0];
  }

  /**
   * Rechercher des classes par nom ou niveau
   */
  static async search(keyword) {
    const query = `
      SELECT * FROM classes
      WHERE nom LIKE ? OR niveau LIKE ?
      ORDER BY nom ASC
    `;
    const k = `%${keyword}%`;
    const result = await execute(query, [k, k]);
    return result.rows;
  }

  /**
   * Mettre à jour une classe
   */
  static async update(id, nom, niveau, capacite) {
    try {
      const query = `
        UPDATE classes 
        SET nom = ?, niveau = ?, capacite = ?
        WHERE id = ?
      `;
      const result = await execute(query, [nom, niveau, capacite, id]);
      logger.info(`[Classe Model] Mise à jour réussie: class_id=${id}`);
      return { changes: result.rowsAffected };
    } catch (err) {
      logger.error(`[Classe Model] Erreur mise à jour ID=${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * Supprimer une classe et réinitialiser les étudiants rattachés (SET NULL)
   */
  static async delete(id) {
    try {
      // Exécution en batch pour éviter les orphelins
      const queries = [
        { sql: 'UPDATE students SET classe_id = NULL WHERE classe_id = ?', args: [id] },
        { sql: 'UPDATE subjects SET classe_id = NULL WHERE classe_id = ?', args: [id] },
        { sql: 'DELETE FROM classes WHERE id = ?', args: [id] }
      ];
      
      await executeBatch(queries);
      logger.info(`[Classe Model] Suppression réussie: class_id=${id}`);
      return { changes: 1 };
    } catch (err) {
      logger.error(`[Classe Model] Erreur suppression ID=${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * Compter le nombre d'étudiants dans une classe
   */
  static async countStudents(class_id) {
    const query = `
      SELECT COUNT(*) AS total 
      FROM students 
      WHERE classe_id = ?
    `;
    const result = await execute(query, [class_id]);
    return result.rows[0] ? result.rows[0].total : 0;
  }

  /**
   * Récupérer les étudiants d'une classe
   */
  static async getStudents(class_id) {
    const query = `
      SELECT id, matricule, nom, prenom, age, user_id 
      FROM students 
      WHERE classe_id = ?
      ORDER BY nom ASC, prenom ASC
    `;
    const result = await execute(query, [class_id]);
    return result.rows;
  }

  /**
   * Récupérer les matières associées à une classe
   */
  static async getSubjects(class_id) {
    const query = `
      SELECT s.id, s.nom, t.nom AS teacher_nom
      FROM subjects s
      LEFT JOIN teachers t ON s.teacher_id = t.id
      WHERE s.classe_id = ?
      ORDER BY s.nom ASC
    `;
    const result = await execute(query, [class_id]);
    return result.rows;
  }
}

export default Classe;