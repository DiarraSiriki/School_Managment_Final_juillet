import database from '../db/database.js';

class Absence {
  static create(student_id, date, status) {
    const query = database.prepare(`
      INSERT INTO absences (student_id, date, status)
      VALUES (?, ?, ?)
    `);
    return query.run(student_id, date, status);
  }

  static getAll() {
    const query = database.prepare('SELECT * FROM absences');
    return query.all();
  }

  static getById(id) {
    const query = database.prepare('SELECT * FROM absences WHERE id = ?');
    return query.get(id);
  }

  static getByStudent(student_id) {
    const query = database.prepare('SELECT * FROM absences WHERE student_id = ?');
    return query.all(student_id);
  }

  static updateStatus(id, status) {
    const query = database.prepare('UPDATE absences SET status = ? WHERE id = ?');
    return query.run(status, id);
  }

  static delete(id) {
    const query = database.prepare('DELETE FROM absences WHERE id = ?');
    return query.run(id);
  }
}

export default Absence;