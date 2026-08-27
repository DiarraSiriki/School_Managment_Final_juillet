import database from '../db/database.js';

class Grade {
  static create(student_id, subject_id, note) {
    const query = database.prepare(`
      INSERT INTO grades (student_id, subject_id, note)
      VALUES (?, ?, ?)
    `);
    return query.run(student_id, subject_id, note);
  }

  static getAll() {
    const query = database.prepare(`
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
    `);
    return query.all();
  }

  static getById(id) {
    const query = database.prepare(`
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
    `);
    return query.get(id);
  }

  static getByStudent(student_id) {
    const query = database.prepare(`
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
    `);
    return query.all(student_id);
  }

  static getBySubject(subject_id) {
    const query = database.prepare(`
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
    `);
    return query.all(subject_id);
  }

  static update(id, student_id, subject_id, note) {
    const query = database.prepare(`
      UPDATE grades 
      SET student_id = ?, subject_id = ?, note = ?
      WHERE id = ?
    `);
    return query.run(student_id, subject_id, note, id);
  }

  static delete(id) {
    const query = database.prepare('DELETE FROM grades WHERE id = ?');
    return query.run(id);
  }

  static getAverageByStudent(student_id) {
    const grades = Grade.getByStudent(student_id);
    if (grades.length === 0) return null;
    const sum = grades.reduce((acc, g) => acc + g.note, 0);
    return (sum / grades.length).toFixed(2);
  }
}

export default Grade;
