import {
    addStudent,             
    updateStudent,        
    removeStudent,          
    searchStudent,           
    listStudents,            
    findStudentByMatricule,  
    getStudentById,          
    getStudentByUserId      
} from '../services/studentService.js';


// Contrôleur : Récupérer le profil de l'étudiant connecté

// Route : GET /api/students/me
// Utilisé par l'étudiant pour voir son propre profil

const getMonProfilEtudiant = (req, res) => {
    // req.user contient les infos de l'utilisateur connecté (ajoutées par verifyToken)
    const user_id = req.user.id;

    try {
        // Appel du service pour récupérer la fiche étudiant associée à ce user_id
        const student = getStudentByUserId(user_id);
        
        // Si aucun étudiant n'est trouvé, on renvoie une erreur 404
        if (!student) {
            return res.status(404).json({ error: "Aucune fiche étudiant associée à ce compte." });
        }
        
        // Si trouvé, on renvoie les données de l'étudiant
        return res.json(student);
    } catch (error) {
        console.error("[ERREUR GET MON PROFIL ETUDIANT]", error);
        return res.status(500).json({ error: "Erreur lors de la récupération de votre profil." });
    }
};


// Contrôleur : Récupérer la liste de tous les étudiants

const getEtudiants = (req, res) => {
    try {
        // Appel du service pour récupérer tous les étudiants
        const students = listStudents();
        return res.json(students);
    } catch (error) {
        console.error("[ERREUR GET ETUDIANTS]", error);
        return res.status(500).json({ error: "Impossible de récupérer la liste des étudiants." });
    }
};


// Contrôleur : Récupérer un étudiant par son ID
// Route : GET /api/students/:id

const getEtudiantParId = (req, res) => {
    // req.params contient les paramètres de l'URL
    const id = req.params.id;

    try {
        // Appel du service pour trouver l'étudiant par ID
        const student = getStudentById(id);
        
        // Si l'étudiant n'existe pas, on renvoie une erreur 404
        if (!student) {
            return res.status(404).json({ error: "Étudiant introuvable." });
        }
        
        return res.json(student);
    } catch (error) {
        console.error("[ERREUR GET ETUDIANT BY ID]", error);
        return res.status(500).json({ error: "Erreur lors de la récupération de l'étudiant." });
    }
};


// Contrôleur : Rechercher un étudiant par son matricule

// Route : GET /api/students/matricule/:matricule

const getEtudiantParMatricule = (req, res) => {
    const matricule = req.params.matricule;

    try {
        const student = findStudentByMatricule(matricule);
        
        if (!student) {
            return res.status(404).json({ error: `Aucun étudiant trouvé avec le matricule '${matricule}'.` });
        }
        
        return res.json(student);
    } catch (error) {
        console.error("[ERREUR GET ETUDIANT BY MATRICULE]", error);
        return res.status(500).json({ error: "Erreur lors de la recherche de l'étudiant par matricule." });
    }
};


// Contrôleur : Recherche globale d'étudiants par mot-clé

// Route : GET /api/students/search?q=terme
// Utilisé pour rechercher des étudiants par nom, prénom, matricule ou classe

const chercherEtudiant = (req, res) => {
    // req.query contient les paramètres de query string
    const { q } = req.query;

    // Validation : le paramètre q est obligatoire
    if (!q) {
        return res.status(400).json({ error: "Le paramètre de recherche 'q' est requis." });
    }

    try {
        const resultats = searchStudent(q);
        return res.json(resultats);
    } catch (error) {
        console.error("[ERREUR RECHERCHE ETUDIANT]", error);
        return res.status(500).json({ error: "Erreur lors de la recherche." });
    }
};


// Contrôleur : Ajouter un nouvel étudiant

// Route : POST /api/students

const ajouterEtudiant = (req, res) => {
    // Récupération des données envoyées dans le corps de la requête
    const { matricule, nom, prenom, age, classe, email, password } = req.body;

    // Validation : tous les champs sont obligatoires
    if (!matricule || !nom || !prenom || !age || !classe || !email || !password) {
        return res.status(400).json({ 
            error: "Tous les champs (matricule, nom, prenom, age, classe, email, password) sont requis." 
        });
    }

    try {
        // Appel du service pour créer l'étudiant
        // Le service crée aussi le compte utilisateur automatiquement
        const studentId = addStudent(matricule, nom, prenom, age, classe, email, password);
        
        // 201 = Created (code HTTP pour création réussie)
        return res.status(201).json({
            success: true,
            message: "Étudiant créé avec succès !",
            id: studentId
        });
    } catch (error) {
        console.error("[ERREUR AJOUT ETUDIANT]", error.message);
        // 400 = Bad Request (erreur de validation, ex: email déjà utilisé)
        return res.status(400).json({ error: error.message });
    }
};


// Contrôleur : Modifier un étudiant

// Route : PUT /api/students/:id

const modifierEtudiant = (req, res) => {
    // Récupération de l'ID depuis les paramètres de route
    const id = req.params.id;
    
    // Récupération des nouvelles données depuis le corps de la requête
    const { matricule, nom, prenom, age, classe, user_id } = req.body;

    // Validation des champs obligatoires
    if (!matricule || !nom || !prenom || !age || !classe) {
        return res.status(400).json({ 
            error: "Les champs (matricule, nom, prenom, age, classe) sont requis pour la mise à jour." 
        });
    }

    try {
        // Appel du service pour mettre à jour l'étudiant
        const succes = updateStudent(id, matricule, nom, prenom, age, classe, user_id);

        // Si succes est false, l'étudiant n'existe pas ou aucune modification n'a été faite
        if (!succes) {
            return res.status(404).json({ error: "Étudiant introuvable ou aucune modification effectuée." });
        }

        return res.json({ success: true, message: "Informations de l'étudiant mises à jour avec succès." });
    } catch (error) {
        console.error("[ERREUR MODIFICATION ETUDIANT]", error.message);
        return res.status(400).json({ error: error.message });
    }
};


// Contrôleur : Supprimer un étudiant
// Route : DELETE /api/students/:id

const supprimerEtudiant = (req, res) => {
    const id = req.params.id;

    try {
        // Appel du service pour supprimer l'étudiant
        const estSupprime = removeStudent(id);

        // Si estSupprime est false, l'étudiant n'existe pas
        if (!estSupprime) {
            return res.status(404).json({ error: "Étudiant introuvable ou déjà supprimé." });
        }

        return res.json({ success: true, message: "Étudiant supprimé avec succès." });
    } catch (error) {
        console.error("[ERREUR SUPPRESSION ETUDIANT]", error);
        return res.status(500).json({ error: "Erreur lors de la suppression de l'étudiant." });
    }
};

// Exportation de tous les contrôleurs pour les utiliser dans les routes
export {
    getEtudiants,           
    getEtudiantParId,      
    getEtudiantParMatricule,
    getMonProfilEtudiant,   
    chercherEtudiant,       
    ajouterEtudiant,     
    modifierEtudiant,      
    supprimerEtudiant       
};