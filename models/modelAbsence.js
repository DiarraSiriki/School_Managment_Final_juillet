import { execute } from '../db/database.js';

class Absence {
  static async create(student_id, date, status) {
    const query = `
      INSERT INTO absences (student_id, date, status)
      VALUES (?, ?, ?)
    `;
    const result = await execute(query, [student_id, date, status]);
    return { lastInsertRowid: result.lastInsertRowid };
  }

  static async getAll() {
    const query = 'SELECT * FROM absences';
    const result = await execute(query);
    return result.rows;
  }

  static async getById(id) {
    const query = 'SELECT * FROM absences WHERE id = ?';
    const result = await execute(query, [id]);
    return result.rows[0];
  }

  static async getByStudent(student_id) {
    const query = 'SELECT * FROM absences WHERE student_id = ?';
    const result = await execute(query, [student_id]);
    return result.rows;
  }

  static async updateStatus(id, status) {
    const query = 'UPDATE absences SET status = ? WHERE id = ?';
    const result = await execute(query, [status, id]);
    return { changes: result.rowsAffected };
  }

  static async delete(id) {
    const query = 'DELETE FROM absences WHERE id = ?';
    const result = await execute(query, [id]);
    return { changes: result.rowsAffected };
  }
}

export default Absence;