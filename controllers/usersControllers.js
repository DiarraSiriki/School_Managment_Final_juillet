import { addUser, removeUser, listUsers } from '../services/userService.js';

// Récupère la liste de tous les utilisateurs
const getUtilisateurs = (req, res) => {
    try {
        const users = listUsers();
        return res.json(users);
    } catch (error) {
        console.error("[ERREUR GET UTILISATEURS]", error);
        return res.status(500).json({ error: "Impossible de récupérer les utilisateurs." });
    }
};

// Récupère un utilisateur spécifique par son matricule
const getUtilisateurParMatricule = (req, res) => {
    const { matricule } = req.params;

    try {
        const user = getUserByMatricule(matricule);
        if (!user) {
            return res.status(404).json({ error: "Aucun utilisateur trouvé avec ce matricule." });
        }
        return res.json(user);
    } catch (error) {
        console.error("[ERREUR GET MATRICULE]", error);
        return res.status(500).json({ error: "Erreur lors de la recherche par matricule." });
    }
};

// Ajoute un nouvel utilisateur (génère ou enregistre le matricule)
const ajouterUtilisateur = (req, res) => {
    const { name, role, email, mot_passe, matricule } = req.body;

    if (!name || !role || !email || !mot_passe) {
        return res.status(400).json({ error: "Tous les champs requis (name, role, email, mot_passe) doivent être remplis." });
    }

    try {
        // addUser gère la création et le matricule
        const newUser = addUser(name, role, email, mot_passe, matricule);
        
        return res.status(201).json({ 
            success: true, 
            message: "Utilisateur créé avec succès !",
            id: newUser.userId || newUser, // S'adapte au type de retour (ID seul ou objet)
            matricule: newUser.matricule || null
        });
    } catch (error) {
        console.error("[ERREUR AJOUT UTILISATEUR]", error.message);
        return res.status(400).json({ error: error.message });
    }
};

// Supprime un utilisateur par son ID
const supprimerUtilisateur = (req, res) => {
    const id = req.params.id;

    try {
        const estSupprime = removeUser(id);
        
        if (!estSupprime) {
            return res.status(404).json({ error: "Utilisateur introuvable ou déjà supprimé." });
        }
        
        return res.json({ success: true, message: "Utilisateur supprimé avec succès." });
    } catch (error) {
        console.error("[ERREUR SUPPRESSION UTILISATEUR]", error);
        return res.status(500).json({ error: "Erreur lors de la suppression de l'utilisateur." });
    }
};

export {
    getUtilisateurs,
    getUtilisateurParMatricule,
    ajouterUtilisateur,
    supprimerUtilisateur
};