import Database from "better-sqlite3";
import { createClient } from "@libsql/client";
import "dotenv/config";

// Connexion à la base locale (lecture seule)
const localDb = new Database("./db/database.db", { readonly: true });

// Connexion à Turso (les identifiants viennent de ton .env)
const tursoDb = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});


// Création du schéma sur Turso (les mêmes tables que ta base locale)

const creerSchema = async () => {

    await tursoDb.execute(`
        CREATE TABLE IF NOT EXISTS classes (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            nom      TEXT    NOT NULL UNIQUE,
            niveau   TEXT    NOT NULL,
            capacite INTEGER NOT NULL
        )
    `);

    await tursoDb.execute(`
        CREATE TABLE IF NOT EXISTS users (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            name      TEXT    NOT NULL,
            role      TEXT    NOT NULL,
            email     TEXT    NOT NULL UNIQUE,
            mot_passe TEXT    NOT NULL,
            matricule TEXT
        )
    `);

    await tursoDb.execute(`
        CREATE TABLE IF NOT EXISTS students (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            matricule TEXT    NOT NULL UNIQUE,
            nom       TEXT    NOT NULL,
            prenom    TEXT    NOT NULL,
            age       INTEGER NOT NULL,
            classe_id INTEGER,
            user_id   INTEGER UNIQUE,
            FOREIGN KEY (classe_id) REFERENCES classes(id) ON DELETE SET NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )
    `);

    await tursoDb.execute(`
        CREATE TABLE IF NOT EXISTS teachers (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            nom       TEXT NOT NULL,
            matiere   TEXT NOT NULL,
            user_id   INTEGER UNIQUE,
            classe_id INTEGER,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )
    `);

    await tursoDb.execute(`
        CREATE TABLE IF NOT EXISTS subjects (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            nom        TEXT    NOT NULL,
            classe     TEXT    NOT NULL,
            teacher_id INTEGER,
            classe_id  INTEGER,
            FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
        )
    `);

    await tursoDb.execute(`
        CREATE TABLE IF NOT EXISTS grades (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            subject_id INTEGER NOT NULL,
            note       REAL    NOT NULL,
            FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
            FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
        )
    `);

    await tursoDb.execute(`
        CREATE TABLE IF NOT EXISTS absences (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            date       TEXT    NOT NULL,
            status     TEXT    NOT NULL,
            FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
        )
    `);

    console.log("Schéma créé sur Turso");
};


// Migration générique d'une table : lit toutes les lignes en local et les insère sur Turso
// en gardant les mêmes id (important à cause des clés étrangères)

const migrerTable = async (table) => {

    const rows = localDb.prepare(`SELECT * FROM ${table}`).all();

    if (rows.length === 0) {
        console.log(`${table} : aucune ligne à migrer`);
        return;
    }

    const colonnes = Object.keys(rows[0]);
    const placeholders = colonnes.map(() => "?").join(", ");

    for (const row of rows) {
        const valeurs = colonnes.map((col) => row[col]);

        await tursoDb.execute({
            sql: `INSERT INTO ${table} (${colonnes.join(", ")}) VALUES (${placeholders})`,
            args: valeurs,
        });
    }

    console.log(`${table} migrée : ${rows.length} ligne(s)`);
};


// Lancement de la migration dans l'ordre des dépendances (clés étrangères)

const migrer = async () => {

    await creerSchema();

    await migrerTable("classes");
    await migrerTable("users");
    await migrerTable("students");
    await migrerTable("teachers");
    await migrerTable("subjects");
    await migrerTable("grades");
    await migrerTable("absences");

    console.log("Migration terminée");

    localDb.close();
};

migrer();