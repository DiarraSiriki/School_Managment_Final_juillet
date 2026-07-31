// ============================================================
// db/database.js
// ============================================================

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const dbPath     = join(__dirname, 'database.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');

console.log(`Base de données connectée : ${dbPath}`);


db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT    NOT NULL,
    role      TEXT    NOT NULL, -- 'admin', 'teacher', 'student'
    email     TEXT    NOT NULL UNIQUE, 
    mot_passe TEXT    NOT NULL UNIQUE
  )
`);

// Index pour optimiser les recherches par email
db.exec(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);



db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    matricule TEXT    NOT NULL UNIQUE,
    nom       TEXT    NOT NULL,
    prenom    TEXT    NOT NULL,
    age       INTEGER NOT NULL,
    classe    TEXT    NOT NULL,
    user_id   INTEGER UNIQUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  )
`);

// Index pour optimiser les recherches par matricule
db.exec(`CREATE INDEX IF NOT EXISTS idx_students_matricule ON students(matricule)`);



db.exec(`
  CREATE TABLE IF NOT EXISTS teachers (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    nom      TEXT NOT NULL,
    matiere  TEXT NOT NULL,
    user_id  INTEGER UNIQUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  )
`);



db.exec(`
  CREATE TABLE IF NOT EXISTS subjects (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nom        TEXT    NOT NULL,
    classe     TEXT    NOT NULL,
    teacher_id INTEGER,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
  )
`);



db.exec(`
  CREATE TABLE IF NOT EXISTS grades (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    note       REAL    NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
  )
`);



db.exec(`
  CREATE TABLE IF NOT EXISTS absences (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    date       TEXT    NOT NULL, -- Format YYYY-MM-DD
    status     TEXT    NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
  )
`);

export default db;