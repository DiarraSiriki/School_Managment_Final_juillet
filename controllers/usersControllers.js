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

 // Ajoute un nouvel utilisateur

const ajouterUtilisateur = (req, res) => {
    const { name, role, email, mot_passe } = req.body;

    if (!name || !role || !email || !mot_passe) {
        return res.status(400).json({ error: "Tous les champs sont requis." });
    }

    try {
        const newUserId = addUser(name, role, email, mot_passe);
        
        return res.status(201).json({ 
            success: true, 
            message: "Utilisateur créé avec succès !",
            id: newUserId 
        });
    } catch (error) {
        console.error("[ERREUR AJOUT UTILISATEUR]", error.message);
        
        return res.status(400).json({ error: error.message });
    }
};

 // Supprime un utilisateur par son ID
 
 const supprimerUtilisateur = (req, res) => {
    const  id  = req.params.id;

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
    ajouterUtilisateur,
    supprimerUtilisateur
};
