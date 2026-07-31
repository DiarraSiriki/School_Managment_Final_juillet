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

export default Teacher;