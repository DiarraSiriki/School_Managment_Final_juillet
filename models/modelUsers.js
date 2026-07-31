import database from '../db/database.js';

class User {
  static create(name, role, email, mot_passe) {
    const query = database.prepare(`
      INSERT INTO users (name, role, email, mot_passe) 
      VALUES (?, ?, ?, ?)
    `);
    return query.run(name, role, email, mot_passe);
  }

  static getAll() {
    const query = database.prepare('SELECT * FROM users');
    return query.all();
  }

  static getById(id) {
    const query = database.prepare('SELECT * FROM users WHERE id = ?');
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