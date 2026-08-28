
import Grade from '../models/modelGrade.js';

export {addGrade,updateGrade,removeGrade,listGrades,getGradeById,getStudentGrades,calculateAverage};

async function addGrade(student_id, subject_id, note) {
  const result = await Grade.create(student_id, subject_id, note);
  return result.lastInsertRowid;
}

async function updateGrade(id, student_id, subject_id, note) {
  const result = await Grade.update(id, student_id, subject_id, note);
  return result.changes > 0;
}

async function removeGrade(id) {
  const result = await Grade.delete(id);
  return result.changes > 0;
}

async function listGrades() {
  return await Grade.getAll();
}

async function getGradeById(id) {
  return await Grade.getById(id);
}

async function getStudentGrades(student_id) {
  return await Grade.getByStudent(student_id);
}

async function calculateAverage(student_id) {
  return await Grade.getAverageByStudent(student_id);
 
}