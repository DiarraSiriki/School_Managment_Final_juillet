<<<<<<< Updated upstream

import database from '../db/database.js';

class User {
  static create(name, role, email, mot_passe) {
    const query = database.prepare(`
      INSERT INTO users (name, role, email, mot_passe)
      VALUES (?, ?, ?, ?)
    `);
    const result = query.run(name, role, email, mot_passe);
    return {
      id: result.lastInsertRowid,
      changes: result.changes
    };
  }

  static getAll() {
    const query = database.prepare(
      'SELECT id, name, role, email FROM users ORDER BY id ASC'
    );
    return query.all();
  }

  static getById(id) {
    const query = database.prepare(
      'SELECT id, name, role, email FROM users WHERE id = ?'
    );
    return query.get(id);
  }

  static getByEmail(email) {
    const query = database.prepare('SELECT * FROM users WHERE email = ?');
    return query.get(email);
  }

  static update(id, name, role, email, mot_passe) {
    const query = database.prepare(`
      UPDATE users
      SET name = ?, role = ?, email = ?, mot_passe = ?
      WHERE id = ?
    `);
    return query.run(name, role, email, mot_passe, id);
  }

  static delete(id) {
    const query = database.prepare('DELETE FROM users WHERE id = ?');
    return query.run(id);
  }
}

export default User;
=======
import { execute } from '../db/database.js';

class User {
  static async create(name, role, email, mot_passe) {
    const query = `
      INSERT INTO users (name, role, email, mot_passe)
      VALUES (?, ?, ?, ?)
    `;
    const result = await execute(query, [name, role, email, mot_passe]);
    return {
      id: result.lastInsertRowid,
      changes: result.rowsAffected
    };
  }

  static async getAll() {
    const query = 'SELECT id, name, role, email FROM users ORDER BY id ASC';
    const result = await execute(query);
    return result.rows;
  }

  static async getById(id) {
    const query = 'SELECT id, name, role, email FROM users WHERE id = ?';
    const result = await execute(query, [id]);
    return result.rows[0];
  }

  static async getByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const result = await execute(query, [email]);
    return result.rows[0];
  }

  static async update(id, name, role, email, mot_passe) {
    const query = `
      UPDATE users
      SET name = ?, role = ?, email = ?, mot_passe = ?
      WHERE id = ?
    `;
    const result = await execute(query, [name, role, email, mot_passe, id]);
    return { changes: result.rowsAffected };
  }

  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = ?';
    const result = await execute(query, [id]);
    return { changes: result.rowsAffected };
  }
}

export default User;
>>>>>>> Stashed changes
