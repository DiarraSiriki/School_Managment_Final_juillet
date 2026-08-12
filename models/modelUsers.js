import database from '../db/database.js';

class User {
  
  static generateMatricule() {
    let matricule = '';
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 100;
    const year = new Date().getFullYear();

    while (!isUnique && attempts < maxAttempts) {
      attempts++;
      
      
      const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase().padStart(4, '0');
      matricule = `ETU-${year}-${randomCode}`;

    
      const existing = User.getByMatricule(matricule);
      if (!existing) {
        isUnique = true;
      }
    }

    if (!isUnique) {
      throw new Error("Impossible de générer un matricule unique après plusieurs tentatives. Veuillez réessayer.");
    }

    return matricule;
  }

  static create(name, role, email, mot_passe, matricule = null) {
    // Si aucun matricule n'est transmis (ex: depuis l'Admin Dashboard), on le génère automatiquement
    const finalMatricule = matricule || User.generateMatricule();

    const query = database.prepare(`
      INSERT INTO users (name, role, email, mot_passe, matricule) 
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = query.run(name, role, email, mot_passe, finalMatricule);

    return {
      id: result.lastInsertRowid,
      matricule: finalMatricule,
      changes: result.changes
    };
  }

  static getAll() {
    const query = database.prepare('SELECT id, name, role, email, matricule FROM users');
    return query.all();
  }

  static getById(id) {
    const query = database.prepare('SELECT id, name, role, email, matricule FROM users WHERE id = ?');
    return query.get(id);
  }

  static getByEmail(email) {
    const query = database.prepare('SELECT * FROM users WHERE email = ?');
    return query.get(email);
  }

  static getByMatricule(matricule) {
    const query = database.prepare('SELECT * FROM users WHERE matricule = ?');
    return query.get(matricule);
  }

  static update(id, name, role, email, mot_passe, matricule = null) {
    const currentUser = User.getById(id);
    const finalMatricule = matricule || currentUser?.matricule;

    const query = database.prepare(`
      UPDATE users 
      SET name = ?, role = ?, email = ?, mot_passe = ?, matricule = ?
      WHERE id = ?
    `);
    return query.run(name, role, email, mot_passe, finalMatricule, id);
  }

  static delete(id) {
    const query = database.prepare('DELETE FROM users WHERE id = ?');
    return query.run(id);
  }
}

export default User;