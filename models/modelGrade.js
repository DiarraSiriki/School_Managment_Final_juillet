<<<<<<< Updated upstream
import database from '../db/database.js';

class Grade {
  static create(student_id, subject_id, note) {
    const query = database.prepare('INSERT INTO grades (student_id, subject_id, note) VALUES (?, ?, ?)');
    return query.run(student_id, subject_id, note);
  }

  static getAll() {
    const query = database.prepare('SELECT * FROM grades');
    return query.all();
  }

  static getById(id) {
    const query = database.prepare('SELECT * FROM grades WHERE id = ?');
    return query.get(id);
  }

  static getByStudent(student_id) {
    const query = database.prepare('SELECT * FROM grades WHERE student_id = ?');
    return query.all(student_id);
  }

  static update(id, note) {
    const query = database.prepare('UPDATE grades SET note = ? WHERE id = ?');
    return query.run(note, id);
  }

  static delete(id) {
    const query = database.prepare('DELETE FROM grades WHERE id = ?');
    return query.run(id);
  }

  static getAverageByStudent(student_id) {
    const query = database.prepare('SELECT AVG(note) as average FROM grades WHERE student_id = ?');
    const result = query.get(student_id);
    
    // Si l'étudiant n'a pas de note, SQLite retourne null pour AVG(note)
    return result && result.average !== null ? result.average : null;
  }
}

export default Grade;
=======
import { execute } from '../db/database.js';

class Grade {
  static async create(student_id, subject_id, note) {
    const query = `
      INSERT INTO grades (student_id, subject_id, note)
      VALUES (?, ?, ?)
    `;
    const result = await execute(query, [student_id, subject_id, note]);
    return { lastInsertRowid: result.lastInsertRowid };
  }

  static async getAll() {
    const query = `
      SELECT 
        g.id,
        g.student_id,
        g.subject_id,
        g.note,
        s.nom AS subject_nom,
        st.nom AS student_nom,
        st.prenom AS student_prenom,
        c.nom AS classe_nom
      FROM grades g
      LEFT JOIN subjects s ON s.id = g.subject_id
      LEFT JOIN students st ON st.id = g.student_id
      LEFT JOIN classes c ON c.id = st.classe_id
      ORDER BY g.student_id, s.nom
    `;
    const result = await execute(query);
    return result.rows;
  }

  static async getById(id) {
    const query = `
      SELECT 
        g.id,
        g.student_id,
        g.subject_id,
        g.note,
        s.nom AS subject_nom,
        st.nom AS student_nom,
        st.prenom AS student_prenom
      FROM grades g
      LEFT JOIN subjects s ON s.id = g.subject_id
      LEFT JOIN students st ON st.id = g.student_id
      WHERE g.id = ?
    `;
    const result = await execute(query, [id]);
    return result.rows[0];
  }

  static async getByStudent(student_id) {
    const query = `
      SELECT 
        g.id,
        g.student_id,
        g.subject_id,
        g.note,
        s.nom AS subject_nom,
        c.nom AS classe_nom
      FROM grades g
      LEFT JOIN subjects s ON s.id = g.subject_id
      LEFT JOIN students st ON st.id = g.student_id
      LEFT JOIN classes c ON c.id = st.classe_id
      WHERE g.student_id = ?
      ORDER BY s.nom
    `;
    const result = await execute(query, [student_id]);
    return result.rows;
  }

  static async getBySubject(subject_id) {
    const query = `
      SELECT 
        g.id,
        g.student_id,
        g.subject_id,
        g.note,
        st.nom AS student_nom,
        st.prenom AS student_prenom,
        c.nom AS classe_nom
      FROM grades g
      LEFT JOIN students st ON st.id = g.student_id
      LEFT JOIN classes c ON c.id = st.classe_id
      WHERE g.subject_id = ?
      ORDER BY st.nom
    `;
    const result = await execute(query, [subject_id]);
    return result.rows;
  }

  static async update(id, student_id, subject_id, note) {
    const query = `
      UPDATE grades
      SET student_id = ?, subject_id = ?, note = ?
      WHERE id = ?
    `;
    const result = await execute(query, [student_id, subject_id, note, id]);
    return { changes: result.rowsAffected };
  }

  static async updateNoteOnly(id, note) {
    const query = `
      UPDATE grades
      SET note = ?
      WHERE id = ?
    `;
    const result = await execute(query, [note, id]);
    return { changes: result.rowsAffected };
  }

  static async delete(id) {
    const query = 'DELETE FROM grades WHERE id = ?';
    const result = await execute(query, [id]);
    return { changes: result.rowsAffected };
  }

  static async getAverageByStudent(student_id) {
    const grades = await Grade.getByStudent(student_id);
    if (grades.length === 0) return null;
    const sum = grades.reduce((acc, g) => acc + g.note, 0);
    return (sum / grades.length).toFixed(2);
  }
}

export default Grade;
>>>>>>> Stashed changes
