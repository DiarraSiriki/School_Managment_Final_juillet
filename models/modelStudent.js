import database from '../db/database.js';
import logger from '../utils/logger.js';

class Student {
 
  static generateMatricule() {
    let matricule = '';
    let isUnique = false;
    const year = new Date().getFullYear();

    while (!isUnique) {
      const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
      matricule = `ETU-${year}-${randomCode}`;

      // Vérifie l'unicité en base de données
      const existing = Student.getByMatricule(matricule);
      if (!existing) {
        isUnique = true;
      }
    }

    return matricule;
  }

  static create(matricule, nom, prenom, age, classe, user_id = null) {
    try {
      // Auto-génération du matricule s'il n'est pas transmis
      const finalMatricule = matricule || Student.generateMatricule();

      const query = database.prepare(`
        INSERT INTO students (matricule, nom, prenom, age, classe, user_id) 
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const result = query.run(finalMatricule, nom, prenom, age, classe, user_id);
      
      logger.info(`[Student Model] Insertion réussie: student_id=${result.lastInsertRowid}, matricule=${finalMatricule}, user_id=${user_id}`);
      database.exec('PRAGMA optimize');
      
      return {
        lastInsertRowid: result.lastInsertRowid,
        changes: result.changes,
        matricule: finalMatricule
      };
    } catch (err) {
      logger.error(`Erreur lors de l'insertion d'un étudiant: ${err.message}`);
      logger.error(`Détails: ${JSON.stringify(err)}`);
      throw err;
    }
  }

  static getAll() {
    const query = database.prepare('SELECT * FROM students');
    return query.all();
  }

  static getById(id) {
    const query = database.prepare('SELECT * FROM students WHERE id = ?');
    return query.get(id);
  }

  static getByMatricule(matricule) {
    const query = database.prepare('SELECT * FROM students WHERE matricule = ?');
    return query.get(matricule);
  }

  static getByUserId(user_id) {
    const query = database.prepare('SELECT * FROM students WHERE user_id = ?');
    return query.get(user_id);
  }

  static search(keyword) {
    const query = database.prepare(`
      SELECT * FROM students
      WHERE nom LIKE ? OR prenom LIKE ? OR matricule LIKE ? OR classe LIKE ?
    `);
    const k = `%${keyword}%`;
    return query.all(k, k, k, k);
  }

  static update(id, matricule, nom, prenom, age, classe, user_id = null) {
    const query = database.prepare(`
      UPDATE students 
      SET matricule = ?, nom = ?, prenom = ?, age = ?, classe = ?, user_id = ?
      WHERE id = ?
    `);
    return query.run(matricule, nom, prenom, age, classe, user_id, id);
  }

  static delete(id) {
    const query = database.prepare('DELETE FROM students WHERE id = ?');
    return query.run(id);
  }
}

export default Student;