
import { createClient } from '@libsql/client';

// Configuration pour Turso (base de données en ligne)
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:./db/database.db',
  authToken: process.env.TURSO_AUTH_TOKEN
});

// Note: Les PRAGMA ne sont pas supportés par Turso, mais les clés étrangères sont gérées automatiquement

// Fonctions utilitaires pour les opérations de base de données
export async function execute(query, params = []) {
  try {
    return await db.execute(query, params);
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

export async function executeBatch(queries) {
  try {
    return await db.batch(queries);
  } catch (error) {
    console.error('Database batch error:', error);
    throw error;
  }
}

// Initialisation de la base de données (création des tables)
export async function initializeDatabase() {
  try {
    console.log('Initialisation de la base de données...');

    // 1. Table USERS
    await execute(`
      CREATE TABLE IF NOT EXISTS users (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        name      TEXT    NOT NULL,
        role      TEXT    NOT NULL,
        email     TEXT    NOT NULL UNIQUE,
        mot_passe TEXT    NOT NULL
      )
    `);

    // 2. Table CLASSES
    await execute(`
      CREATE TABLE IF NOT EXISTS classes (
        id       INTEGER PRIMARY KEY AUTOINCREMENT,
        nom      TEXT    NOT NULL UNIQUE,
        niveau   TEXT    NOT NULL,
        capacite INTEGER NOT NULL
      )
    `);

    // 3. Table STUDENTS
    await execute(`
      CREATE TABLE IF NOT EXISTS students (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        matricule TEXT    NOT NULL UNIQUE,
        nom       TEXT    NOT NULL,
        prenom    TEXT    NOT NULL,
        age       INTEGER NOT NULL,
        classe_id INTEGER,
        user_id   INTEGER UNIQUE
      )
    `);

    // 4. Table TEACHERS
    await execute(`
      CREATE TABLE IF NOT EXISTS teachers (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        nom       TEXT    NOT NULL,
        matiere   TEXT    NOT NULL,
        classe_id INTEGER,
        user_id   INTEGER UNIQUE
      )
    `);

    // 5. Table SUBJECTS
    await execute(`
      CREATE TABLE IF NOT EXISTS subjects (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        nom        TEXT    NOT NULL,
        classe_id  INTEGER,
        teacher_id INTEGER
      )
    `);

    // 6. Table GRADES
    await execute(`
      CREATE TABLE IF NOT EXISTS grades (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        note       REAL    NOT NULL
      )
    `);

    // 7. Table ABSENCES
    await execute(`
      CREATE TABLE IF NOT EXISTS absences (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        date       TEXT    NOT NULL,
        status     TEXT    NOT NULL
      )
    `);

    console.log('Base de données initialisée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  }
}

export default db;

