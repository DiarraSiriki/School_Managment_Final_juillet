// .env contient des informations sensibles comme le JWT_SECRET
import dotenv from 'dotenv';
dotenv.config();

// Importation des bibliothèques principales
import express from 'express';        
import cors from 'cors';              
import { dirname, join } from 'path'; 
import { fileURLToPath } from 'url';  

import classRoutes from './routes/classeRoute.js';
import studentRoutes from './routes/studentRoutes.js';      
import teacherRoutes from './routes/teacherRoutes.js';     
import matieresRoutes from './routes/matieresRoutes.js';  
import gradesRoutes from './routes/gradesRoutes.js';       
import absenceRoutes from './routes/absencesRoutes.js';    
import statsRoutes from './routes/statsRoutes.js';       
import usersRoutes from './routes/usersRoutes.js';     
import authRoutes from './routes/authRoutes.js';         



const __filename = fileURLToPath(import.meta.url); 
const __dirname = dirname(__filename);                
const app = express();                           
const PORT = process.env.PORT || 3000;              

// Sans ça, le navigateur bloquerait les requêtes vers le serveur
app.use(cors());


app.use(express.json());



app.use(express.urlencoded({ extended: true }));


app.use(express.static(join(__dirname, 'publics')));


// Route de connexion
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'publics', 'index.html'));
});


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


app.get('/dashboard-admin', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'html', 'dashboard-admin.html'));
});
app.get('/dashboard-etudiant', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'html', 'dashboard-etudiant.html'));
});
app.get('/dashboard-prof', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'html', 'dashboard-prof.html'));
});
app.get('/absences', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'html', 'absences.html'));
});
app.get('/matieres', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'html', 'matieres.html'));
});
app.get('/notes', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'html', 'notes.html'));
});
app.get('/statistiques', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'html', 'statistiques.html'));
});
app.get('/admin', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'html', 'dashboard-admin.html'));
});



app.use('/api/auth', authRoutes);

app.use('/api/users', usersRoutes);

app.use('/api/classes', classRoutes);

app.use('/api/students', studentRoutes); 

app.use('/api/teachers', teacherRoutes);

app.use('/api/subjects', matieresRoutes);

app.use('/api/grades', gradesRoutes);

app.use('/api/absences', absenceRoutes);

app.use('/api/stats', statsRoutes);



// Permet de vérifier si le serveur fonctionne correctement

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'API School Management fonctionnelle' });
});





app.use((req, res, next) => {
    res.status(404).json({ error: `Route non trouvée : ${req.originalUrl}` });
});





app.use((err, req, res, next) => {
    console.error("[ERREUR SERVEUR]", err.stack);
    res.status(500).json({
        error: "Une erreur interne s'est produite sur le serveur.",
        
        
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});



app.listen(PORT, () => {
    console.log(`Serveur School Management lancé !`);
    console.log(`URL : http://localhost:${PORT}`);
    console.log(`=================================`);
});