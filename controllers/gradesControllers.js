import {
    addGrade,
    updateGrade,
    removeGrade,
    listGrades,
    getGradeById,
    getStudentGrades,
    calculateAverage
} from '../services/gradeService.js';


 // Récupère la liste de toutes les notes
 
const getNotes = (req, res) => {
    try {
        const grades = listGrades();
        return res.json(grades);
    } catch (error) {
        console.error("[ERREUR GET NOTES]", error);
        return res.status(500).json({ error: "Impossible de récupérer la liste des notes." });
    }
};


 // Récupère une note spécifique par son ID
 
 const getNoteParId = (req, res) => {
    const { id } = req.params;

    try {
        const grade = getGradeById(id);
        if (!grade) {
            return res.status(404).json({ error: "Note introuvable." });
        }
        return res.json(grade);
    } catch (error) {
        console.error("[ERREUR GET NOTE BY ID]", error);
        return res.status(500).json({ error: "Erreur lors de la récupération de la note." });
    }
};


 // Récupère toutes les notes d'un étudiant spécifique
 
 const getNotesParEtudiant = (req, res) => {
    const { student_id } = req.params;

    try {
        const grades = getStudentGrades(student_id);
        return res.json(grades);
    } catch (error) {
        console.error("[ERREUR GET NOTES ETUDIANT]", error);
        return res.status(500).json({ error: "Impossible de récupérer les notes de cet étudiant." });
    }
};

// Calcule la moyenne des notes d'un étudiant spécifique

 const getMoyenneEtudiant = (req, res) => {
    const { student_id } = req.params;

    try {
        const average = calculateAverage(student_id);
        return res.json({
            success: true,
            student_id: Number(student_id),
            moyenne: average ?? 0
        });
    } catch (error) {
        console.error("[ERREUR CALCUL MOYENNE ETUDIANT]", error);
        return res.status(500).json({ error: "Impossible de calculer la moyenne de cet étudiant." });
    }
};


 // Ajoute une nouvelle note à un étudiant

 const ajouterNote = (req, res) => {
    const { student_id, subject_id, note } = req.body;

    if (student_id === undefined || subject_id === undefined || note === undefined) {
        return res.status(400).json({ 
            error: "Tous les champs (student_id, subject_id, note) sont requis." 
        });
    }

    if (note < 0 || note > 20) {
        return res.status(400).json({ error: "La note doit être comprise entre 0 et 20." });
    }

    try {
        const gradeId = addGrade(student_id, subject_id, note);
        return res.status(201).json({
            success: true,
            message: "Note ajoutée avec succès !",
            id: gradeId
        });
    } catch (error) {
        console.error("[ERREUR AJOUT NOTE]", error);
        return res.status(500).json({ error: "Erreur lors de l'ajout de la note." });
    }
};

// Mettre à jour une note existante

const modifierNote = (req, res) => {
    const  id  = req.params.id;
    const { note } = req.body;

    if (note === undefined) {
        return res.status(400).json({ error: "La nouvelle valeur de la note est requise." });
    }

    if (note < 0 || note > 20) {
        return res.status(400).json({ error: "La note doit être comprise entre 0 et 20." });
    }

    try {
        const estModifie = updateGrade(id, note);

        if (!estModifie) {
            return res.status(404).json({ error: "Note introuvable ou aucune modification effectuée." });
        }

        return res.json({ success: true, message: "Note mise à jour avec succès." });
    } catch (error) {
        console.error("[ERREUR MODIFICATION NOTE]", error);
        return res.status(500).json({ error: "Erreur lors de la modification de la note." });
    }
};

// Supprime une note par son ID
 
const supprimerNote = (req, res) => {
    const id = req.params.id;

    try {
        const estSupprime = removeGrade(id);

        if (!estSupprime) {
            return res.status(404).json({ error: "Note introuvable ou déjà supprimée." });
        }

        return res.json({ success: true, message: "Note supprimée avec succès." });
    } catch (error) {
        console.error("[ERREUR SUPPRESSION NOTE]", error);
        return res.status(500).json({ error: "Erreur lors de la suppression de la note." });
    }
};


export  {
    getNotes,
    getNoteParId,
    getNotesParEtudiant,
    getMoyenneEtudiant,
    ajouterNote,
    modifierNote,
    supprimerNote
};