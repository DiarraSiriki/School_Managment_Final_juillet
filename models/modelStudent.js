import { execute } from '../db/database.js';
import logger from '../utils/logger.js';

class Student {

  static async create(matricule, nom, prenom, age, classe_id, user_id = null) {
    try {
      if (!matricule || !String(matricule).trim()) {
        throw new Error('Le matricule est obligatoire.');
      }

      const finalMatricule = String(matricule).trim();

      const query = `
        INSERT INTO students (matricule, nom, prenom, age, classe_id, user_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const result = await execute(query, [finalMatricule, nom, prenom, age, classe_id, user_id]);

      logger.info(`[Student Model] Insertion réussie: student_id=${result.lastInsertRowid}, matricule=${finalMatricule}, user_id=${user_id}`);

      return {
        lastInsertRowid: result.lastInsertRowid,
        changes: result.rowsAffected,
        matricule: finalMatricule
      };
    } catch (err) {
      logger.error(`Erreur lors de l'insertion d'un étudiant: ${err.message}`);
      throw err;
    }
  }

  static async getAll() {
    const query = 'SELECT * FROM students';
    const result = await execute(query);
    return result.rows;
  }

  static async getById(id) {
    const query = 'SELECT * FROM students WHERE id = ?';
    const result = await execute(query, [id]);
    return result.rows[0];
  }

  static async getByMatricule(matricule) {
    const query = 'SELECT * FROM students WHERE matricule = ?';
    const result = await execute(query, [matricule]);
    return result.rows[0];
  }

  static async getByUserId(user_id) {
    const query = 'SELECT * FROM students WHERE user_id = ?';
    const result = await execute(query, [user_id]);
    return result.rows[0];
  }

  static async search(keyword) {
    const query = `
      SELECT * FROM students
      WHERE nom LIKE ? OR prenom LIKE ? OR matricule LIKE ?
         OR CAST(classe_id AS TEXT) LIKE ?
    `;
    const k = `%${keyword}%`;
    const result = await execute(query, [k, k, k, k]);
    return result.rows;
  }

  static async update(id, matricule, nom, prenom, age, classe_id, user_id = null) {
    const query = `
      UPDATE students
      SET matricule = ?, nom = ?, prenom = ?, age = ?, classe_id = ?, user_id = ?
      WHERE id = ?
    `;
    const result = await execute(query, [matricule, nom, prenom, age, classe_id, user_id, id]);
    return { changes: result.rowsAffected };
  }

  static async delete(id) {
    const query = 'DELETE FROM students WHERE id = ?';
    const result = await execute(query, [id]);
    return { changes: result.rowsAffected };
  }
}

export default Student;