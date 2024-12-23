import { generateJavaCode } from './generators/javaGenerator';
import { generatePythonCode } from './generators/pythonGenerator';
import { generatePhpCode } from './generators/phpGenerator';

// Simule le stockage local des données
let classes = [];
let relationships = [];
let diagrams = [];
let counter = 1;
let history = [];
let currentIndex = -1;
const MAX_HISTORY = 50;

export const localService = {
  // Classes
  createClass: (classData) => {
    const newClass = {
      id: counter++,
      ...classData,
    };
    classes.push(newClass);
    return newClass;
  },

  getClasses: () => {
    return classes;
  },

  // Relationships
  createRelationship: (relationshipData) => {
    const newRelationship = {
      id: counter++,
      ...relationshipData,
    };
    relationships.push(newRelationship);
    return newRelationship;
  },

  // Diagrams
  createDiagram: (diagramData) => {
    const newDiagram = {
      id: counter++,
      ...diagramData,
      createdAt: new Date().toISOString(),
    };
    diagrams.push(newDiagram);
    return newDiagram;
  },

  getDiagrams: () => {
    return diagrams;
  },

  getDiagramById: (id) => {
    return diagrams.find((d) => d.id === id);
  },

  deleteDiagram: (id) => {
    diagrams = diagrams.filter((d) => d.id !== id);
  },

  updateDiagram: (id, diagramData) => {
    const index = diagrams.findIndex((d) => d.id === id);
    if (index !== -1) {
      diagrams[index] = { ...diagrams[index], ...diagramData };
      return diagrams[index];
    }
    return null;
  },

  // Code generation simulation
  generateJavaCode: (diagramId) => {
    try {
      const diagram = diagrams.find((d) => d.id === diagramId);
      if (!diagram) {
        return { error: "Diagram not found" };
      }

      const diagramData = JSON.parse(diagram.content);
      const code = generateJavaCode(diagramData.nodes, diagramData.edges);

      return {
        code,
        filename: `${diagram.name || "Diagram"}.java`,
        fileType: "java",
      };
    } catch (error) {
      return { error: error.message };
    }
  },

  generatePythonCode: (diagramId) => {
    try {
      const diagram = diagrams.find((d) => d.id === diagramId);
      if (!diagram) {
        return { error: "Diagram not found" };
      }

      const diagramData = JSON.parse(diagram.content);
      const code = generatePythonCode(diagramData.nodes, diagramData.edges);

      return {
        code,
        filename: `${diagram.name || "diagram"}.py`,
        fileType: "py",
      };
    } catch (error) {
      return { error: error.message };
    }
  },

  generatePhpCode: (diagramId) => {
    try {
      const diagram = diagrams.find((d) => d.id === diagramId);
      if (!diagram) {
        return { error: "Diagram not found" };
      }

      const diagramData = JSON.parse(diagram.content);
      const code = generatePhpCode(diagramData.nodes, diagramData.edges);

      return {
        code,
        filename: `${diagram.name || "diagram"}.php`,
        fileType: "php",
      };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Sauvegarder un état dans l'historique
  saveState: (nodes, edges) => {
    // Supprimer les états futurs si on fait une nouvelle action après un undo
    if (currentIndex < history.length - 1) {
      history = history.slice(0, currentIndex + 1);
    }

    // Ajouter le nouvel état
    history.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
      timestamp: new Date().toISOString(),
    });

    // Limiter la taille de l'historique
    if (history.length > MAX_HISTORY) {
      history.shift();
    } else {
      currentIndex++;
    }
  },

  // Undo
  undo: () => {
    if (currentIndex > 0) {
      currentIndex--;
      return history[currentIndex];
    }
    return null;
  },

  // Redo
  redo: () => {
    if (currentIndex < history.length - 1) {
      currentIndex++;
      return history[currentIndex];
    }
    return null;
  },

  // Obtenir l'historique complet
  getHistory: () => {
    return history;
  },

  // Vérifier si undo/redo sont disponibles
  canUndo: () => currentIndex > 0,
  canRedo: () => currentIndex < history.length - 1,
};
