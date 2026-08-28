
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


export default Subjects;