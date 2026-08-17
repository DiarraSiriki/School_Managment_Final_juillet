import Student from '../models/modelStudent.js';   
import logger from '../utils/logger.js';            
import { addUser } from './userService.js';         
import { isClassFull, getClasseById } from './classeService.js'; 

function addStudent(matricule, nom, prenom, age, classe_id, email, mot_passe) {
    // 1. Si un matricule manuel est fourni, on vérifie son unicité
    if (matricule) {
        const existingStudent = findStudentByMatricule(matricule);
        if (existingStudent) {
            logger.warn(`Échec de l'ajout : Le matricule ${matricule} est déjà utilisé.`);
            throw new Error(`Le matricule '${matricule}' appartient déjà à un étudiant.`);
        }
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

    // Création du compte utilisateur associé
    const userId = addUser(`${prenom}_${nom}`, 'student', email, mot_passe);

    // Création de l'étudiant (Student.create génère le matricule si matricule est null/undefined)
    const result = Student.create(matricule, nom, prenom, age, classe_id, userId);
    
    const studentId = result.lastInsertRowid; 
    const finalMatricule = result.matricule || matricule;

    logger.info(`Étudiant ajouté avec succès : ID=${studentId}, Matricule=${finalMatricule}, ClasseID=${classe_id}, UserID=${userId}`);
    
    return {
        id: studentId,
        matricule: finalMatricule
    };
}

function updateStudent(id, matricule, nom, prenom, age, classe_id, user_id = null) {
    const existingStudent = Student.getById(id);
    if (!existingStudent) {
        throw new Error(`Étudiant avec l'ID ${id} introuvable.`);
    }

    const targetMatricule = matricule || existingStudent.matricule;
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

    const result = Student.update(id, targetMatricule, nom, prenom, age, targetClasseId, user_id);
    
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