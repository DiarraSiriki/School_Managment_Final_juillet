import Student from '../models/modelStudent.js';   // Modèle pour interagir avec la table students
import logger from '../utils/logger.js';            // Utilitaire pour écrire des logs
import { addUser } from './userService.js';         // Service pour créer un compte utilisateur
import { isClassFull, getClasseById } from './classeService.js'; // Gestion de la capacité des classes



function addStudent(matricule, nom, prenom, age, classe_id, email, mot_passe) {
    const existingStudent = findStudentByMatricule(matricule);
    
    if (existingStudent) {
        logger.warn(`Échec de l'ajout : Le matricule ${matricule} est déjà utilisé.`);
        throw new Error(`Le matricule '${matricule}' appartient déjà à un étudiant.`);
    }

    const classe = getClasseById(classe_id);
    if (!classe) {
        logger.warn(`Échec de l'ajout : La classe ID=${classe_id} n'existe pas.`);
        throw new Error(`La classe sélectionnée n'existe pas.`);
    }

    if (isClassFull(classe_id)) {
        logger.warn(`Échec de l'ajout : La classe "${classe.nom}" a atteint sa capacité maximale (${classe.capacite}).`);
        throw new Error(`Impossible d'ajouter l'étudiant : la classe "${classe.nom}" est pleine.`);
    }

    // Utilisation de mot_passe transmis à addUser
    const userId = addUser(`${prenom}_${nom}`, 'student', email, mot_passe);

    const result = Student.create(matricule, nom, prenom, age, classe_id, userId);
    
    const studentId = result.lastInsertRowid; 

    logger.info(`Étudiant ajouté avec succès : ID=${studentId}, Matricule=${matricule}, ClasseID=${classe_id}, UserID=${userId}`);
    
    return studentId;
}

function updateStudent(id, matricule, nom, prenom, age, classe_id, user_id = null) {
    const existingStudent = Student.getById(id);
    if (!existingStudent) {
        throw new Error(`Étudiant avec l'ID ${id} introuvable.`);
    }

    const targetClasseId = classe_id !== undefined ? classe_id : existingStudent.classe_id;

    if (targetClasseId && targetClasseId !== existingStudent.classe_id) {
        const classe = getClasseById(targetClasseId);
        if (!classe) {
            throw new Error(`La classe sélectionnée n'existe pas.`);
        }

        if (isClassFull(targetClasseId)) {
            logger.warn(`Échec du transfert : La classe "${classe.nom}" est pleine (${classe.capacite}).`);
            throw new Error(`Impossible de transférer l'étudiant : la classe "${classe.nom}" est pleine.`);
        }
    }

    const result = Student.update(id, matricule, nom, prenom, age, targetClasseId, user_id);
    
    if (result.changes > 0) {
        logger.info(`Étudiant modifié: ID=${id}`);
    }
    
    return result.changes > 0;
}

function removeStudent(id) {
    const result = Student.delete(id);
    
    if (result.changes > 0) {
        logger.info(`Étudiant supprimé: ID=${id}`);
    }
    
    return result.changes > 0;
}

function searchStudent(keyword) {
    return Student.search(keyword);
}

function listStudents() {
    return Student.getAll();
}

function findStudentByMatricule(matricule) {
    return Student.getByMatricule(matricule);
}

function getStudentById(id) {
    return Student.getById(id);
}

function getStudentByUserId(user_id) {
    return Student.getByUserId(user_id);
}

export { 
  addStudent,              
  updateStudent,          
  removeStudent,          
  searchStudent,          
  listStudents,           
  findStudentByMatricule,  
  getStudentById,          
  getStudentByUserId       
};