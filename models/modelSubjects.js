<<<<<<< Updated upstream
import database from '../db/database.js';

class Subjects {
  static create(nom, classe, teacher_id = null) {
    const query = database.prepare(`
      INSERT INTO subjects (nom, classe, teacher_id)
      VALUES (?, ?, ?)
    `);
    return query.run(nom, classe, teacher_id);
  }

  static getAll() {
    const query = database.prepare('SELECT * FROM subjects');
    return query.all();
  }

  static getById(id) {
    const query = database.prepare('SELECT * FROM subjects WHERE id = ?');
    return query.get(id);
  }

  static getByTeacher(teacher_id) {
    const query = database.prepare('SELECT * FROM subjects WHERE teacher_id = ?');
    return query.all(teacher_id);
  }

  static getByClasse(classe) {
    const query = database.prepare('SELECT * FROM subjects WHERE classe = ?');
    return query.all(classe);
  }

  static search(keyword) {
    const query = database.prepare(`
      SELECT * FROM subjects
      WHERE nom LIKE ? OR classe LIKE ?
    `);
    const k = `%${keyword}%`;
    return query.all(k, k);
  }

  static update(id, nom, classe, teacher_id = null) {
    const query = database.prepare(`
      UPDATE subjects 
      SET nom = ?, classe = ?, teacher_id = ?
      WHERE id = ?
    `);
    return query.run(nom, classe, teacher_id, id);
  }

  static delete(id) {
    const query = database.prepare('DELETE FROM subjects WHERE id = ?');
    return query.run(id);
  }
}

=======
import { execute } from '../db/database.js';

class Subjects {
  static async create(nom, classe_id, teacher_id = null) {
    const query = `
      INSERT INTO subjects (nom, classe_id, teacher_id)
      VALUES (?, ?, ?)
    `;
    const result = await execute(query, [nom, classe_id, teacher_id]);
    return { lastInsertRowid: result.lastInsertRowid };
  }

  static async getAll() {
    const query = 'SELECT * FROM subjects';
    const result = await execute(query);
    return result.rows;
  }

  static async getById(id) {
    const query = 'SELECT * FROM subjects WHERE id = ?';
    const result = await execute(query, [id]);
    return result.rows[0];
  }

  static async getByTeacher(teacher_id) {
    const query = 'SELECT * FROM subjects WHERE teacher_id = ?';
    const result = await execute(query, [teacher_id]);
    return result.rows;
  }

  static async getByClasse(classe_id) {
    const query = 'SELECT * FROM subjects WHERE classe_id = ?';
    const result = await execute(query, [classe_id]);
    return result.rows;
  }

  static async search(keyword) {
    const query = `
      SELECT * FROM subjects
      WHERE nom LIKE ?
    `;
    const k = `%${keyword}%`;
    const result = await execute(query, [k]);
    return result.rows;
  }

  static async update(id, nom, classe_id, teacher_id = null) {
    const query = `
      UPDATE subjects 
      SET nom = ?, classe_id = ?, teacher_id = ?
      WHERE id = ?
    `;
    const result = await execute(query, [nom, classe_id, teacher_id, id]);
    return { changes: result.rowsAffected };
  }

  static async delete(id) {
    const query = 'DELETE FROM subjects WHERE id = ?';
    const result = await execute(query, [id]);
    return { changes: result.rowsAffected };
  }
}

>>>>>>> Stashed changes
export default Subjects;