
import {
    recordAbsence,
    updateAbsenceStatus,
    markAsJustified,
    markAsUnjustified,
    removeAbsence,
    getHistory,
    getStudentHistory
} from '../services/absenceService.js';

import { getStudentByUserId } from '../services/studentService.js';
  // Enregistre une nouvelle absence

 const ajouterAbsence = (req, res) => {
    const { student_id, class_id, subject_id, date, status } = req.body;

    if (!student_id || !date) {
        return res.status(400).json({ error: "L'ID de l'étudiant (student_id) et la date sont requis." });
    }

    try {
        const absenceId = recordAbsence(student_id, date, status);
        return res.status(201).json({
            success: true,
            message: "Absence enregistrée avec succès !",
            id: absenceId
        });
    } catch (error) {
        console.error("[ERREUR AJOUT ABSENCE]", error);
        return res.status(500).json({ error: "Erreur lors de l'enregistrement de l'absence." });
    }
};

 //Récupère l'historique complet de toutes les absences
 
 const getHistoriqueAbsences = (req, res) => {
    try {
        const absences = getHistory();
        return res.json({ data: absences });
    } catch (error) {
        console.error("[ERREUR GET HISTORIQUE ABSENCES]", error);
        return res.status(500).json({ error: "Impossible de récupérer l'historique des absences." });
    }
};

 //Récupère l'historique des absences d'un étudiant spécifique
 
const getHistoriqueEtudiant = (req, res) => {
    const { student_id } = req.params;
          if (req.user.role === 'student') {
        const me = getStudentByUserId(req.user.id);
        if (!me || String(me.id) !== String(student_id)) {
            return res.status(403).json({ error: 'Vous ne pouvez voir que vos propres absences.' });
        }
    }
    try {
        const absences = getStudentHistory(student_id);
        return res.json(absences);
    } catch (error) {
        console.error("[ERREUR GET HISTORIQUE ETUDIANT]", error);
        return res.status(500).json({ error: "Impossible de récupérer les absences de cet étudiant." });
    }
};

 //Met à jour le statut d'une absence (justifiée ou non)
 
const modifierStatutAbsence = (req, res) => {
    const  id  = req.params.id;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ error: "Le champ 'status' est requis." });
    }

    try {
        const estModifie = updateAbsenceStatus(id, status);

        if (!estModifie) {
            return res.status(404).json({ error: "Absence introuvable ou aucun changement effectué." });
        }

        return res.json({ success: true, message: "Statut de l'absence mis à jour avec succès." });
    } catch (error) {
        console.error("[ERREUR MODIFICATION STATUT ABSENCE]", error);
        return res.status(500).json({ error: "Erreur lors de la modification du statut de l'absence." });
    }
};

// Marque une absence comme justifiée
 
const justifierAbsence = (req, res) => {
    const  id  = req.params.id;

    try {
        const estModifie = markAsJustified(id);

        if (!estModifie) {
            return res.status(404).json({ error: "Absence introuvable." });
        }

        return res.json({ success: true, message: "L'absence a été marquée comme justifiée." });
    } catch (error) {
        console.error("[ERREUR JUSTIFIER ABSENCE]", error);
        return res.status(500).json({ error: "Erreur lors de la justification de l'absence." });
    }
};

// Marque une absence comme non justifiée
 
 const injustifierAbsence = (req, res) => {
    const  id  = req.params.id;

    try {
        const estModifie = markAsUnjustified(id);

        if (!estModifie) {
            return res.status(404).json({ error: "Absence introuvable." });
        }

        return res.json({ success: true, message: "L'absence a été marquée comme non justifiée." });
    } catch (error) {
        console.error("[ERREUR INJUSTIFIER ABSENCE]", error);
        return res.status(500).json({ error: "Erreur lors de la modification de l'absence." });
    }
};


  // Supprime une absence par son ID

const supprimerAbsence = (req, res) => {
    const id = req.params.id;

    try {
        const estSupprime = removeAbsence(id);

        if (!estSupprime) {
            return res.status(404).json({ error: "Absence introuvable ou déjà supprimée." });
        }

        return res.json({ success: true, message: "Absence supprimée avec succès." });
    } catch (error) {
        console.error("[ERREUR SUPPRESSION ABSENCE]", error);
        return res.status(500).json({ error: "Erreur lors de la suppression de l'absence." });
    }
};


export  {
    ajouterAbsence,
    getHistoriqueAbsences,
    getHistoriqueEtudiant,
    modifierStatutAbsence,
    justifierAbsence,
    injustifierAbsence,
    supprimerAbsence
};