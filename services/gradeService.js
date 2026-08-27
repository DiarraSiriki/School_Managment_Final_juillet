import Grade from '../models/modelGrade.js';

export {addGrade,updateGrade,removeGrade,listGrades,getGradeById,getStudentGrades,calculateAverage};

function addGrade(student_id, subject_id, note) {
  const result = Grade.create(student_id, subject_id, note);
  return result.lastInsertRowid;
}

function updateGrade(id, student_id, subject_id, note) {
  const result = Grade.update(id, student_id, subject_id, note);
  return result.changes > 0;
}

function removeGrade(id) {
  const result = Grade.delete(id);
  return result.changes > 0;
}

function listGrades() {
  return Grade.getAll();
}

function getGradeById(id) {
  return Grade.getById(id);
}

function getStudentGrades(student_id) {
  return Grade.getByStudent(student_id);
}

function calculateAverage(student_id) {
  return Grade.getAverageByStudent(student_id);
}