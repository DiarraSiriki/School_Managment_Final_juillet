import Grade from '../models/modelGrade.js';
import Absence from '../models/modelAbsence.js';
import Student from '../models/modelStudent.js';
import Teacher from '../models/modelTeacher.js';
import Subjects from '../models/modelSubjects.js';
import logger from '../utils/logger.js';

export {
  getGeneralAverage,
  getBestStudent,
  getRankings,
  countAbsencesByStudent,
  countAllAbsences,
  getAllStats
};

function calcAverage(student_id) {
  const grades = Grade.getByStudent(student_id);
  if (grades.length === 0)
    return 0;
  const sum = grades.reduce((acc, g) => acc + g.note, 0);
  return sum / grades.length;
}

function getGeneralAverage() {
  const grades = Grade.getAll();
  if (grades.length === 0) {
    logger.info('Moyennes générales consultées (aucune note disponible)');
    return "0.00";
  }
  const sum = grades.reduce((acc, g) => acc + g.note, 0);
  const average = (sum / grades.length).toFixed(2);
  logger.info(`Moyenne générale consultée : ${average}`);
  return average;
}

function getRankings() {
  const students = Student.getAll();
  const rankings = students
    .map((student) => ({
      ...student,
      moyenne: calcAverage(student.id).toFixed(2)
    }))
    .sort((a, b) => parseFloat(b.moyenne) - parseFloat(a.moyenne));

  logger.info(`Classement consulté (${rankings.length} étudiants)`);
  return rankings;
}

function getBestStudent() {
  const rankings = getRankings();
  if (rankings.length === 0) {
    logger.info('Meilleur étudiant consulté (aucun étudiant en base)');
    return null;
  }

  const best = rankings[0];

  logger.info(`Meilleur étudiant : ${best.prenom} ${best.nom} (Moyenne: ${best.moyenne})`);
  return best;
}

function countAbsencesByStudent(student_id) {
  const absences = Absence.getByStudent(student_id);
  const result = {
    total: absences.length,
    justifiees: absences.filter(a => a.status === 'justifiée').length,
    non_justifiees: absences.filter(a => a.status === 'non justifiée').length
  };
  logger.info(`Absences de l'étudiant ID=${student_id} : Total=${result.total}, Justifiées=${result.justifiees}, Non justifiées=${result.non_justifiees}`);
  return result;
}

function countAllAbsences() {
  const absences = Absence.getAll();
  const result = {
    total: absences.length,
    justifiees: absences.filter(a => a.status === 'justifiée').length,
    non_justifiees: absences.filter(a => a.status === 'non justifiée').length
  };
  logger.info(`Toutes les absences globales : Total=${result.total}, Justifiées=${result.justifiees}, Non justifiées=${result.non_justifiees}`);
  return result;
}

function getAllStats() {
  try {
    const students = Student.getAll();
    const teachers = Teacher.getAll();
    const subjects = Subjects.getAll();

    const stats = {
      students: students.length,
      teachers: teachers.length,
      matieres: subjects.length
    };

    logger.info(`Statistiques globales : Étudiants=${stats.students}, Professeurs=${stats.teachers}, Matières=${stats.matieres}`);
    return stats;
  } catch (error) {
    logger.error(`Erreur lors de la récupération des statistiques globales: ${error.message}`);
    throw error;
  }
}