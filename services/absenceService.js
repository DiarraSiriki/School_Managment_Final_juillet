import Absence from '../models/modelAbsence.js';
import logger from '../utils/logger.js';

export {
  recordAbsence,
  updateAbsenceStatus,
  markAsJustified,
  markAsUnjustified,
  removeAbsence,
  getHistory,
  getStudentHistory
};

const STATUS = {
  JUSTIFIEE: 'justifiée',
  NON_JUSTIFIEE: 'non justifiée'
};

function recordAbsence(student_id, date, status = STATUS.NON_JUSTIFIEE) {
  const normalizedStatus =
    status.toLowerCase() === STATUS.JUSTIFIEE
      ? STATUS.JUSTIFIEE
      : STATUS.NON_JUSTIFIEE;
  const result = Absence.create(student_id, date, normalizedStatus);
  logger.info(`Absence enregistrée: ID=${result.lastInsertRowid}, Étudiant ID=${student_id}, Date=${date}, Statut=${normalizedStatus}`);
  return result.lastInsertRowid;
}

function updateAbsenceStatus(id, status) {
  const normalizedStatus =
    status.toLowerCase() === STATUS.JUSTIFIEE
      ? STATUS.JUSTIFIEE
      : STATUS.NON_JUSTIFIEE;
  const result = Absence.updateStatus(id, normalizedStatus);
  if (result.changes > 0) {
    logger.info(`Statut d'absence modifié: ID=${id}, Nouveau statut=${normalizedStatus}`);
  }
  return result.changes > 0;
}

function markAsJustified(id) {
  return updateAbsenceStatus(id, STATUS.JUSTIFIEE);
}

function markAsUnjustified(id) {
  return updateAbsenceStatus(id, STATUS.NON_JUSTIFIEE);
}

function removeAbsence(id) {
  const result = Absence.delete(id);
  if (result.changes > 0) {
    logger.info(`Absence supprimée: ID=${id}`);
  }
  return result.changes > 0;
}

function getHistory() {
  const absences = Absence.getAll();
  logger.info(`Historique des absences consulté (${absences.length} absences)`);
  return absences;
}

function getStudentHistory(student_id) {
  const absences = Absence.getByStudent(student_id);
  logger.info(`Historique des absences consulté pour l'étudiant ID=${student_id} (${absences.length} absences)`);
  return absences;
}