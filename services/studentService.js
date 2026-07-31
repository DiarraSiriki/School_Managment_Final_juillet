// ============================================================================
// services/studentService.js
// ============================================================================
// Ce fichier contient la logique métier pour la gestion des étudiants
// Les services sont appelés par les contrôleurs et font appel aux modèles
// C'est la couche "business logic" de l'application
// ============================================================================

import Student from '../models/modelStudent.js';  // Modèle pour interagir avec la table students
import logger from '../utils/logger.js';            // Utilitaire pour écrire des logs
import { addUser } from './userService.js';         // Service pour créer un compte utilisateur

// Exportation de toutes les fonctions du service pour les utiliser dans les contrôleurs
export { 
  addStudent,              // Créer un nouvel étudiant
  updateStudent,           // Modifier un étudiant
  removeStudent,           // Supprimer un étudiant
  searchStudent,           // Rechercher des étudiants
  listStudents,            // Lister tous les étudiants
  findStudentByMatricule,  // Trouver par matricule
  getStudentById,          // Trouver par ID
  getStudentByUserId       // Trouver par user_id
};

// ============================================================================
// Service : Ajouter un nouvel étudiant
// ============================================================================
// Ce service fait deux choses importantes :
// 1. Crée un compte utilisateur dans la table users
// 2. Crée la fiche étudiant dans la table students
// Les deux sont liés par user_id
// ============================================================================
function addStudent(matricule, nom, prenom, age, classe, email, password) {
    // Étape 1 : Vérifier si le matricule est déjà utilisé
    // Le matricule doit être unique pour chaque étudiant
    const existingStudent = findStudentByMatricule(matricule);
    
    if (existingStudent) {
        logger.warn(`Échec de l'ajout : Le matricule ${matricule} est déjà utilisé.`);
        // On lance une erreur qui sera capturée par le contrôleur
        throw new Error(`Le matricule '${matricule}' appartient déjà à un étudiant.`);
    }

    // Étape 2 : Créer le compte utilisateur
    // addUser crée un enregistrement dans la table users avec le rôle 'student'
    // Le nom est généré automatiquement : prenom_nom
    const userId = addUser(`${prenom}_${nom}`, 'student', email, password);

    // Étape 3 : Créer la fiche étudiant
    // Student.create insère dans la table students avec le user_id créé
    const result = Student.create(matricule, nom, prenom, age, classe, userId);
    
    // lastInsertRowid contient l'ID de l'étudiant nouvellement créé
    const studentId = result.lastInsertRowid; 
  
    // Étape 4 : Logger la création pour le suivi
    logger.info(`Étudiant ajouté avec succès : ID=${studentId}, Matricule=${matricule}, UserID=${userId}`);
    
    // Retourner l'ID de l'étudiant créé
    return studentId;
}

// ============================================================================
// Service : Modifier un étudiant
// ============================================================================
// Met à jour les informations d'un étudiant existant
// user_id est optionnel (null par défaut) car on ne change pas forcément le compte utilisateur
// ============================================================================
function updateStudent(id, matricule, nom, prenom, age, classe, user_id = null) {
    // Appel du modèle pour mettre à jour l'étudiant dans la base de données
    const result = Student.update(id, matricule, nom, prenom, age, classe, user_id);
    
    // result.changes indique combien de lignes ont été modifiées
    // Si > 0, cela signifie que la modification a réussi
    if (result.changes > 0) {
        logger.info(`Étudiant modifié: ID=${id}`);
    }
    
    // Retourner true si modifié, false sinon
    return result.changes > 0;
}

// ============================================================================
// Service : Supprimer un étudiant
// ============================================================================
// Supprime un étudiant de la base de données
// ============================================================================
function removeStudent(id) {
    // Appel du modèle pour supprimer l'étudiant
    const result = Student.delete(id);
    
    // Logger si la suppression a réussi
    if (result.changes > 0) {
        logger.info(`Étudiant supprimé: ID=${id}`);
    }
    
    // Retourner true si supprimé, false sinon
    return result.changes > 0;
}

// ============================================================================
// Service : Rechercher des étudiants par mot-clé
// ============================================================================
// Recherche dans plusieurs champs : nom, prénom, matricule, classe
// ============================================================================
function searchStudent(keyword) {
    // Délègue la recherche au modèle
    return Student.search(keyword);
}

// ============================================================================
// Service : Lister tous les étudiants
// ============================================================================
// Récupère tous les étudiants de la base de données
// ============================================================================
function listStudents() {
    // Délègue au modèle pour récupérer tous les enregistrements
    return Student.getAll();
}

// ============================================================================
// Service : Trouver un étudiant par son matricule
// ============================================================================
// Le matricule est unique, donc cette fonction retourne un seul étudiant ou null
// ============================================================================
function findStudentByMatricule(matricule) {
    // Délègue au modèle pour la recherche
    return Student.getByMatricule(matricule);
}

// ============================================================================
// Service : Trouver un étudiant par son ID
// ============================================================================
// L'ID est la clé primaire de la table students
// ============================================================================
function getStudentById(id) {
    // Délègue au modèle pour la recherche par ID
    return Student.getById(id);
}

// ============================================================================
// Service : Trouver un étudiant par user_id
// ============================================================================
// Permet de trouver la fiche étudiant à partir du compte utilisateur
// Utilisé quand un étudiant se connecte et veut voir son profil
// ============================================================================
function getStudentByUserId(user_id) {
    // Délègue au modèle pour la recherche par user_id
    return Student.getByUserId(user_id);
}