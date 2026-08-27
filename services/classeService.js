import Classe from '../models/modelClass.js';
import logger from '../utils/logger.js';


 const createClasse = (data) => {
  const { nom, niveau, capacite } = data;

  if (!nom || !niveau || capacite === undefined) {
    throw new Error('Les champs nom, niveau et capacité sont obligatoires.');
  }

  if (capacite <= 0) {
    throw new Error('La capacité doit être un nombre positif supérieur à zéro.');
  }

  const existing = Classe.getByNom(nom);
  if (existing) {
    throw new Error(`Une classe avec le nom "${nom}" existe déjà.`);
  }

  return Classe.create(nom, niveau, capacite);
};


const getAllClasses = () => {
  return Classe.getAll();
};


const getClasseById = (id) => {
  const classe = Classe.getById(id);
  if (!classe) {
    throw new Error(`Classe avec l'ID ${id} introuvable.`);
  }
  return classe;
};


const updateClasse = (id, data) => {
  const { nom, niveau, capacite } = data;

  const existingClasse = Classe.getById(id);
  if (!existingClasse) {
    throw new Error(`Classe avec l'ID ${id} introuvable.`);
  }

  if (nom && nom !== existingClasse.nom) {
    const duplicateNom = Classe.getByNom(nom);
    if (duplicateNom) {
      throw new Error(`Une autre classe utilise déjà le nom "${nom}".`);
    }
  }

  // Vérification de la capacité par rapport au nombre d'étudiants actuels
  const currentStudentsCount = Classe.countStudents(id);
  const newCapacite = capacite !== undefined ? capacite : existingClasse.capacite;

  if (newCapacite < currentStudentsCount) {
    throw new Error(
      `Impossible de réduire la capacité à ${newCapacite} : la classe contient déjà ${currentStudentsCount} étudiant(s).`
    );
  }

  const updatedNom = nom || existingClasse.nom;
  const updatedNiveau = niveau || existingClasse.niveau;

  return Classe.update(id, updatedNom, updatedNiveau, newCapacite);
};


const deleteClasse = (id) => {
  const existingClasse = Classe.getById(id);
  if (!existingClasse) {
    throw new Error(`Classe avec l'ID ${id} introuvable.`);
  }

  const studentsCount = Classe.countStudents(id);
  if (studentsCount > 0) {
    logger.warn(`[Classe Service] Suppression de la classe ID=${id} contenant ${studentsCount} élève(s). Les élèves auront leur classe_id réinitialisé à NULL.`);
  }

  return Classe.delete(id);
};


const isClassFull = (class_id) => {
  const classe = Classe.getById(class_id);
  if (!classe) {
    throw new Error(`Classe introuvable.`);
  }

  const currentCount = Classe.countStudents(class_id);
  return currentCount >= classe.capacite;
};


const getClasseDetails = (id) => {
  const classe = Classe.getById(id);
  if (!classe) {
    throw new Error(`Classe avec l'ID ${id} introuvable.`);
  }

  const students = Classe.getStudents(id);
  const subjects = Classe.getSubjects(id);

  return {
    ...classe,
    effectif_actuel: students.length,
    students,
    subjects
  };
};


/**
 * Trouve une classe par son nom (insensible à la casse),
 * ou la crée automatiquement si elle n'existe pas.
 * Permet de saisir n'importe quel nom de classe à la main
 * lors de l'ajout / modification d'un étudiant.
 *
 * @param {string} nomClasse - Nom saisi (ex: "Terminale C", "3ème A")
 * @param {object} [options]
 * @param {string} [options.niveau] - Niveau forcé (sinon déduit du nom)
 * @param {number} [options.capacite=40] - Capacité par défaut à la création
 * @returns {{ id: number, nom: string, niveau: string, capacite: number, created: boolean }}
 */
const findOrCreateClasseByName = (nomClasse, options = {}) => {
  const nom = String(nomClasse || '').trim();
  if (!nom) {
    throw new Error('Le nom de la classe est obligatoire.');
  }

  // Recherche insensible à la casse
  const all = Classe.getAll();
  const existing = all.find(c => (c.nom || '').trim().toLowerCase() === nom.toLowerCase());
  if (existing) {
    return { ...existing, created: false };
  }

  // Déduire un niveau simple à partir du nom (ex: "3ème A" -> "3ème")
  let niveau = options.niveau;
  if (!niveau) {
    const m = nom.match(/^(\d+\s*ème|\d+\s*ere?|terminale|seconde|premiere|première|m\d+|l\d+|licence\s*\d+)/i);
    niveau = m ? m[0].replace(/\s+/g, ' ').trim() : 'Non défini';
  }

  const capacite = options.capacite != null ? Number(options.capacite) : 40;
  if (!Number.isFinite(capacite) || capacite <= 0) {
    throw new Error('La capacité de la classe doit être un nombre positif.');
  }

  const result = Classe.create(nom, niveau, capacite);
  const id = result.lastInsertRowid;
  logger.info(`[Classe Service] Classe créée automatiquement: ID=${id}, nom="${nom}", niveau="${niveau}"`);

  return {
    id,
    nom,
    niveau,
    capacite,
    created: true
  };
};

/**
 * Résout une classe à partir d'un id et/ou d'un nom libre.
 * Priorité : classe_id s'il est valide, sinon nom (find-or-create).
 */
const resolveClasseId = ({ classe_id, classe, nom } = {}) => {
  const name = (classe || nom || '').toString().trim();

  if (classe_id !== undefined && classe_id !== null && classe_id !== '') {
    const byId = Classe.getById(classe_id);
    if (byId) return byId.id;
    // id invalide : si un nom est fourni on bascule dessus
    if (!name) {
      throw new Error(`La classe sélectionnée (ID ${classe_id}) n'existe pas.`);
    }
  }

  if (!name) {
    throw new Error('La classe est obligatoire (saisissez un nom de classe).');
  }

  return findOrCreateClasseByName(name).id;
};

export {
  createClasse,
  getAllClasses,
  getClasseById,
  updateClasse,
  deleteClasse,
  isClassFull,
  getClasseDetails,
  findOrCreateClasseByName,
  resolveClasseId
};
