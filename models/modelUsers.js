import database from '../db/database.js';

class User {
  static async create(name, role, email, mot_passe) {
    const query = await database.prepare(`
      INSERT INTO users (name, role, email, mot_passe)
      VALUES (?, ?, ?, ?)
    `);
    const result = query.run(name, role, email, mot_passe);
    return {
      id: result.lastInsertRowid,
      changes: result.changes
    };
  }

  static async getAll() {
    const query = await database.prepare(
      'SELECT id, name, role, email FROM users ORDER BY id ASC'
    );
    return query.all();
  }

  static async getById(id) {
    const query = await database.prepare(
      'SELECT id, name, role, email FROM users WHERE id = ?'
    );
    return query.get(id);
  }

  static async getByEmail(email) {
    const query = await database.prepare('SELECT * FROM users WHERE email = ?');
    return query.get(email);
  }

  static async update(id, name, role, email, mot_passe) {
    const query = await database.prepare(`
      UPDATE users
      SET name = ?, role = ?, email = ?, mot_passe = ?
      WHERE id = ?
    `);
    return query.run(name, role, email, mot_passe, id);
  }

  static async delete(id) {
    const query = await database.prepare('DELETE FROM users WHERE id = ?');
    return query.run(id);
  }
}

export default User;