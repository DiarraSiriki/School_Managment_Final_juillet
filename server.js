
//  Configure le serveur Express
//  Définit les routes (les chemins d'accès)
//  Gère les fichiers statiques (HTML, CSS, JS)
//  Lance le serveur sur le port 3000


// Chargement des variables d'environnement depuis le fichier .env
// .env contient des informations sensibles comme le JWT_SECRET
import dotenv from 'dotenv';
dotenv.config();

// Importation des bibliothèques principales
import express from 'express';        
import cors from 'cors';              
import { dirname, join } from 'path'; 
import { fileURLToPath } from 'url';  // Pour convertir les URLs en chemins de fichiers


// Importation des routes (les "chemins" de l'API)
// Chaque fichier de routes gère une partie de l'application

import studentRoutes from './routes/studentRoutes.js';      // Gestion des élèves
import teacherRoutes from './routes/teacherRoutes.js';      // Gestion des professeurs
import matieresRoutes from './routes/matieresRoutes.js';    // Gestion des matières
import gradesRoutes from './routes/gradesRoutes.js';        // Gestion des notes
import absenceRoutes from './routes/absencesRoutes.js';    // Gestion des absences
import statsRoutes from './routes/statsRoutes.js';        // Gestion des statistiques
import usersRoutes from './routes/usersRoutes.js';        // Gestion des utilisateurs
import authRoutes from './routes/authRoutes.js';          // Gestion de l'authentification


// Configuration de base d'Express

const __filename = fileURLToPath(import.meta.url);  // Récupère le chemin du fichier actuel
const __dirname = dirname(__filename);                // Récupère le dossier du fichier actuel
const app = express();                               // Crée l'application Express
const PORT = process.env.PORT || 3000;               // Port du serveur (3000 par défaut)

// Middleware CORS : autorise les requêtes depuis le navigateur
// Sans ça, le navigateur bloquerait les requêtes vers le serveur
app.use(cors());


app.use(express.json());

// Middleware pour parser les données de formulaires URL-encoded

app.use(express.urlencoded({ extended: true }));

// Middleware pour servir les fichiers statiques (HTML, CSS, JS, images)
// Exemple : http://localhost:3000/css/style.css
app.use(express.static(join(__dirname, 'publics')));


// Routes pour les pages HTML (le frontend)
// Ces routes renvoient les pages HTML quand l'utilisateur va sur une URL

// Route racine : quand on va sur http://localhost:3000, on affiche la page de connexion
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'publics', 'index.html'));
});

// Mapping des anciennes URLs HTML vers les nouvelles URLs propres
// Permet de rediriger les anciens liens vers les nouveaux
const htmlRouteMap = {
    'login.html': '/',
    'dashboard-admin.html': '/dashboard-admin',
    'dashboard-etudiant.html': '/dashboard-etudiant',
    'dashboard-prof.html': '/dashboard-prof',
    'absences.html': '/absences',
    'matières.html': '/matieres',
    'notes.html': '/notes',
    'statistiques.html': '/statistiques',
    'utilisateurs.html': '/utilisateurs'
};

// Route de redirection pour les anciennes URLs
// Si quelqu'un va sur /HTML/login.html, il est redirigé vers /
app.get('/HTML/:page', (req, res) => {
    const page = req.params.page.toLowerCase();
    const redirectUrl = htmlRouteMap[page] || '/';
    res.redirect(redirectUrl);
});

// Routes pour chaque page de l'application
// Chaque route renvoie le fichier HTML correspondant
app.get('/dashboard-admin', (req, res) => {
    res.sendFile(join(__dirname, 'publics', 'html', 'dashboard-admin.html'));
});
app.get('/dashboard-etudiant', (req, res) => {
    res.sendFile(join(__dirname, 'publics', 'html', 'dashboard-etudiant.html'));
});
app.get('/dashboard-prof', (req, res) => {
    res.sendFile(join(__dirname, 'publics', 'html', 'dashboard-prof.html'));
});
app.get('/absences', (req, res) => {
    res.sendFile(join(__dirname, 'publics', 'html', 'absences.html'));
});
app.get('/matieres', (req, res) => {
    res.sendFile(join(__dirname, 'publics', 'html', 'matieres.html'));
});
app.get('/notes', (req, res) => {
    res.sendFile(join(__dirname, 'publics', 'html', 'notes.html'));
});
app.get('/statistiques', (req, res) => {
    res.sendFile(join(__dirname, 'publics', 'html', 'statistiques.html'));
});
app.get('/utilisateurs', (req, res) => {
    res.sendFile(join(__dirname, 'publics', 'html', 'utilisateurs.html'));
});



// Route pour l'authentification (connexion, déconnexion)
app.use('/api/auth', authRoutes);

// Route pour la gestion des utilisateurs
app.use('/api/users', usersRoutes);

// Route pour la gestion des élèves
app.use('/api/students', studentRoutes);

// Route pour la gestion des professeurs
app.use('/api/teachers', teacherRoutes);

// Route pour la gestion des matières
app.use('/api/subjects', matieresRoutes);

// Route pour la gestion des notes
app.use('/api/grades', gradesRoutes);

// Route pour la gestion des absences
app.use('/api/absences', absenceRoutes);

// Route pour les statistiques
app.use('/api/stats', statsRoutes);



// Permet de vérifier si le serveur fonctionne correctement

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'API School Management fonctionnelle' });
});


// Gestion des erreurs 404 (route non trouvée)


app.use((req, res, next) => {
    res.status(404).json({ error: `Route non trouvée : ${req.originalUrl}` });
});


// Gestion des erreurs 500 (erreur serveur)


app.use((err, req, res, next) => {
    console.error("[ERREUR SERVEUR]", err.stack);
    res.status(500).json({
        error: "Une erreur interne s'est produite sur le serveur.",
        
        
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});


// Démarrage du serveur
// Le serveur écoute sur le port PORT (3000 par défaut)

app.listen(PORT, () => {
    console.log(`Serveur School Management lancé !`);
    console.log(`URL : http://localhost:${PORT}`);
    console.log(`=================================`);
});