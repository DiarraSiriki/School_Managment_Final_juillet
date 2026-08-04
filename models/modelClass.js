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
      database.exec('PRAGMA optimize');
      return result;
    } catch (err) {
      logger.error(`Erreur lors de la création de la classe: ${err.message}`);
      logger.error(`Détails: ${JSON.stringify(err)}`);
      throw err;
    }
  }

 
  static getAll() {
    const query = database.prepare('SELECT * FROM classes ORDER BY nom ASC');
    return query.all();
  }

 
  static getById(id) {
    const query = database.prepare('SELECT * FROM classes WHERE id = ?');
    return query.get(id);
  }

  
  static getByNom(nom) {
    const query = database.prepare('SELECT * FROM classes WHERE nom = ?');
    return query.get(nom);
  }

 
  static search(keyword) {
    const query = database.prepare(`
      SELECT * FROM classes
      WHERE nom LIKE ? OR niveau LIKE ?
    `);
    const k = `%${keyword}%`;
    return query.all(k, k);
  }

 
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
      logger.error(`Erreur lors de la mise à jour de la classe ID=${id}: ${err.message}`);
      throw err;
    }
  }

  
  static delete(id) {
    try {
      const query = database.prepare('DELETE FROM classes WHERE id = ?');
      const result = query.run(id);
      logger.info(`[Classe Model] Suppression réussie: class_id=${id}`);
      return result;
    } catch (err) {
      logger.error(`Erreur lors de la suppression de la classe ID=${id}: ${err.message}`);
      throw err;
    }
  }


  static countStudents(class_id) {
    const query = database.prepare(`
      SELECT COUNT(*) AS total 
      FROM students 
      WHERE classe_id = ?
    `);
    const result = query.get(class_id);
    return result ? result.total : 0;
  }

  
  static getStudents(class_id) {
    const query = database.prepare(`
      SELECT id, matricule, nom, prenom, age, user_id 
      FROM students 
      WHERE classe_id = ?
      ORDER BY nom ASC, prenom ASC
    `);
    return query.all(class_id);
  }

  
  static getSubjects(class_id) {
    const query = database.prepare(`
      SELECT s.id, s.nom, t.nom AS teacher_nom
      FROM subjects s
      LEFT JOIN teachers t ON s.teacher_id = t.id
      WHERE s.classe_id = ?
    `);
    return query.all(class_id);
  }
}

export default Classe;
                        