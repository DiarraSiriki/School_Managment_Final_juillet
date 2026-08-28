import {
    addSubject,
    updateSubject,
    removeSubject,
    searchSubject,
    getSubjectById,
    listSubjects
} from '../services/matiereService.js';


// Récupère la liste de toutes les matières

 const getMatieres = async (req, res) => {
    try {
        const subjects = await listSubjects();
        return res.json(subjects);
    } catch (error) {
        console.error("[ERREUR GET MATIERES]", error);
        return res.status(500).json({ error: "Impossible de récupérer la liste des matières." });
    }
};

// Récupère une matière spécifique par son ID
const getMatiereParId = async (req, res) => {
    const  id  = req.params.id;

    try {
        const subject = await getSubjectById(id);
        if (!subject) {
            return res.status(404).json({ error: "Matière introuvable." });
        }
        return res.json(subject);
    } catch (error) {
        console.error("[ERREUR GET MATIERE BY ID]", error);
        return res.status(500).json({ error: "Erreur lors de la récupération de la matière." });
    }
};


 // Recherche des matières par mot-clé (nom ou classe)
 
const chercherMatiere = async (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ error: "Le paramètre de recherche 'q' est requis." });
    }

    try {
        const resultats = await searchSubject(q);
        return res.json(resultats);
    } catch (error) {
        console.error("[ERREUR RECHERCHE MATIERE]", error);
        return res.status(500).json({ error: "Erreur lors de la recherche de la matière." });
    }
};


 // Ajoute une nouvelle matière

const ajouterMatiere = async (req, res) => {
    const { nom, classe, teacher_id } = req.body;

    if (!nom || !classe) {
        return res.status(400).json({ error: "Le nom de la matière et la classe sont requis." });
    }

    try {
        const subjectId = await addSubject(nom, classe, teacher_id || null);
        return res.status(201).json({
            success: true,
            message: "Matière ajoutée avec succès !",
            id: subjectId
        });
    } catch (error) {
        console.error("[ERREUR AJOUT MATIERE]", error);
        return res.status(500).json({ error: "Erreur lors de l'ajout de la matière." });
    }
};


 // Mettre à jour une matière existante
 
const modifierMatiere = async (req, res) => {
    const { id } = req.params;
    const { nom, classe, teacher_id } = req.body;

    if (!nom || !classe) {
        return res.status(400).json({ error: "Le nom et la classe sont requis pour la mise à jour." });
    }

    try {
        const estModifie = await updateSubject(id, nom, classe, teacher_id || null);

        if (!estModifie) {
            return res.status(404).json({ error: "Matière introuvable ou aucune modification effectuée." });
        }

        return res.json({ success: true, message: "Matière mise à jour avec succès." });
    } catch (error) {
        console.error("[ERREUR MODIFICATION MATIERE]", error);
        return res.status(500).json({ error: "Erreur lors de la modification de la matière." });
    }
};


 // Supprime une matière par son ID
  
const supprimerMatiere = async (req, res) => {
    const id = req.params.id;

    try {
        const estSupprime = await removeSubject(id);

        if (!estSupprime) {
            return res.status(404).json({ error: "Matière introuvable ou déjà supprimée." });
        }

        return res.json({ success: true, message: "Matière supprimée avec succès." });
    } catch (error) {
        console.error("[ERREUR SUPPRESSION MATIERE]", error);
        return res.status(500).json({ error: "Erreur lors de la suppression de la matière." });
    }
};


export {
    getMatieres,
    getMatiereParId,
    chercherMatiere,
    ajouterMatiere,
    modifierMatiere,
    supprimerMatiere
};