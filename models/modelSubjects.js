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

export default Subjects;