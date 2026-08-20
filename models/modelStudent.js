import database from '../db/database.js';
import logger from '../utils/logger.js';

class Student {

  static create(matricule, nom, prenom, age, classe_id, user_id = null) {
    try {
      if (!matricule || !String(matricule).trim()) {
        throw new Error('Le matricule est obligatoire.');
      }

      const finalMatricule = String(matricule).trim();

      const query = database.prepare(`
        INSERT INTO students (matricule, nom, prenom, age, classe_id, user_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const result = query.run(finalMatricule, nom, prenom, age, classe_id, user_id);

      logger.info(`[Student Model] Insertion réussie: student_id=${result.lastInsertRowid}, matricule=${finalMatricule}, user_id=${user_id}`);
      database.exec('PRAGMA optimize');

      return {
        lastInsertRowid: result.lastInsertRowid,
        changes: result.changes,
        matricule: finalMatricule
      };
    } catch (err) {
      logger.error(`Erreur lors de l'insertion d'un étudiant: ${err.message}`);
      throw err;
    }
  }

  static getAll() {
    return database.prepare('SELECT * FROM students').all();
  }

  static getById(id) {
    return database.prepare('SELECT * FROM students WHERE id = ?').get(id);
  }

  static getByMatricule(matricule) {
    return database.prepare('SELECT * FROM students WHERE matricule = ?').get(matricule);
  }

  static getByUserId(user_id) {
    return database.prepare('SELECT * FROM students WHERE user_id = ?').get(user_id);
  }

  static search(keyword) {
    const query = database.prepare(`
      SELECT * FROM students
      WHERE nom LIKE ? OR prenom LIKE ? OR matricule LIKE ?
         OR CAST(classe_id AS TEXT) LIKE ?
    `);
    const k = `%${keyword}%`;
    return query.all(k, k, k, k);
  }

  static update(id, matricule, nom, prenom, age, classe_id, user_id = null) {
    const query = database.prepare(`
      UPDATE students
      SET matricule = ?, nom = ?, prenom = ?, age = ?, classe_id = ?, user_id = ?
      WHERE id = ?
    `);
    return query.run(matricule, nom, prenom, age, classe_id, user_id, id);
  }

  static delete(id) {
    return database.prepare('DELETE FROM students WHERE id = ?').run(id);
  }
}

export default Student;