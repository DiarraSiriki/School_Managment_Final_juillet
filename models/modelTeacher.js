<<<<<<< Updated upstream
import database from '../db/database.js';

class Teacher {
  static create(nom, matiere, user_id = null) {
    const query = database.prepare(`
      INSERT INTO teachers (nom, matiere, user_id) 
      VALUES (?, ?, ?)
    `);
    return query.run(nom, matiere, user_id);
  }

  static getAll() {
    const query = database.prepare('SELECT * FROM teachers');
    return query.all();
  }

  static getById(id) {
    const query = database.prepare('SELECT * FROM teachers WHERE id = ?');
    return query.get(id);
  }

  static getByUserId(user_id) {
    const query = database.prepare('SELECT * FROM teachers WHERE user_id = ?');
    return query.get(user_id);
  }

  static search(keyword) {
    const query = database.prepare(`
      SELECT * FROM teachers
      WHERE nom LIKE ? OR matiere LIKE ?
    `);
    const k = `%${keyword}%`;
    return query.all(k, k);
  }

  static update(id, nom, matiere, user_id = null) {
    const query = database.prepare(`
      UPDATE teachers 
      SET nom = ?, matiere = ?, user_id = ?
      WHERE id = ?
    `);
    return query.run(nom, matiere, user_id, id);
  }

  static delete(id) {
    const query = database.prepare('DELETE FROM teachers WHERE id = ?');
    return query.run(id);
  }
}

=======
import { execute } from '../db/database.js';

class Teacher {
  static async create(nom, matiere, classe_id = null, user_id = null) {
    const query = `
      INSERT INTO teachers (nom, matiere, classe_id, user_id) 
      VALUES (?, ?, ?, ?)
    `;
    const result = await execute(query, [nom, matiere, classe_id, user_id]);
    return { lastInsertRowid: result.lastInsertRowid };
  }

  static async getAll() {
    const query = 'SELECT * FROM teachers';
    const result = await execute(query);
    return result.rows;
  }

  static async getById(id) {
    const query = 'SELECT * FROM teachers WHERE id = ?';
    const result = await execute(query, [id]);
    return result.rows[0];
  }

  static async getByUserId(user_id) {
    const query = 'SELECT * FROM teachers WHERE user_id = ?';
    const result = await execute(query, [user_id]);
    return result.rows[0];
  }

  static async search(keyword) {
    const query = `
      SELECT * FROM teachers
      WHERE nom LIKE ? OR matiere LIKE ?
    `;
    const k = `%${keyword}%`;
    const result = await execute(query, [k, k]);
    return result.rows;
  }

  static async update(id, nom, matiere, classe_id = null, user_id = null) {
    const query = `
      UPDATE teachers 
      SET nom = ?, matiere = ?, classe_id = ?, user_id = ?
      WHERE id = ?
    `;
    const result = await execute(query, [nom, matiere, classe_id, user_id, id]);
    return { changes: result.rowsAffected };
  }

  static async delete(id) {
    const query = 'DELETE FROM teachers WHERE id = ?';
    const result = await execute(query, [id]);
    return { changes: result.rowsAffected };
  }
}

>>>>>>> Stashed changes
export default Teacher;