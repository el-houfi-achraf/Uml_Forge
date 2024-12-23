import React, { useState, useCallback, useRef, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import "reactflow/dist/style.css";
import { Box, Snackbar, Alert } from "@mui/material";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import ClassNode from "./components/nodes/ClassNode";
import AbstractClassNode from "./components/nodes/AbstractClassNode";
import InterfaceNode from "./components/nodes/InterfaceNode";
import EnumNode from "./components/nodes/EnumNode";
import CustomEdge from "./components/edges/CustomEdge";
import RelationshipDialog from "./components/dialogs/RelationshipDialog";
import HistoryDialog from "./components/dialogs/HistoryDialog";
import { localService } from "./services/localService";
import CodePreviewDialog from "./components/dialogs/CodePreviewDialog";
import Toolbar from "./components/Toolbar/Toolbar";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme/theme";
import { geminiService } from "./services/geminiService";

const nodeTypes = {
  classNode: ClassNode,
  abstractClassNode: AbstractClassNode,
  interfaceNode: InterfaceNode,
  enumNode: EnumNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const extractClassId = (nodeData) => {
  return (
    nodeData?.data?.id || nodeData?.data?.backendId || nodeData?.data?.classId
  );
};

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [relationshipDialogOpen, setRelationshipDialogOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [diagrams, setDiagrams] = useState([]);
  const [classMap, setClassMap] = useState(new Map());
  const [tempIdCounter, setTempIdCounter] = useState(1);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    console.log("Nodes changed:", nodes);
    const newClassMap = new Map();
    nodes.forEach((node) => {
      const classId =
        node.data?.id || node.data?.backendId || node.data?.classId;
      if (classId) {
        newClassMap.set(node.id, classId);
      }
    });
    console.log("Updating classMap:", Array.from(newClassMap.entries()));
    setClassMap(newClassMap);
  }, [nodes]);

  useEffect(() => {
    const handleNodeDataUpdate = (event) => {
      const { id, data } = event.detail;
      setNodes((nds) =>
        nds.map((node) => (node.id === id ? { ...node, data: data } : node))
      );
    };

    window.addEventListener("nodeDataUpdate", handleNodeDataUpdate);
    return () => {
      window.removeEventListener("nodeDataUpdate", handleNodeDataUpdate);
    };
  }, [setNodes]);

  useEffect(() => {
    const handleNodeDelete = async (event) => {
      const { id } = event.detail;

      try {
        // Supprimer d'abord toutes les connexions liées à ce nœud
        setEdges((eds) =>
          eds.filter((edge) => edge.source !== id && edge.target !== id)
        );

        // Supprimer le nœud
        setNodes((nds) => nds.filter((node) => node.id !== id));

        showSnackbar("Node deleted successfully", "success");
      } catch (error) {
        console.error("Error deleting node:", error);
        showSnackbar("Error deleting node", "error");
      }
    };

    window.addEventListener("nodeDelete", handleNodeDelete);
    return () => {
      window.removeEventListener("nodeDelete", handleNodeDelete);
    };
  }, [setNodes, setEdges]);

  useEffect(() => {
    const handleEdgeUpdate = (event) => {
      const { id, data } = event.detail;
      setEdges((eds) =>
        eds.map((edge) => (edge.id === id ? { ...edge, data } : edge))
      );
    };

    window.addEventListener("edgeUpdate", handleEdgeUpdate);
    return () => {
      window.removeEventListener("edgeUpdate", handleEdgeUpdate);
    };
  }, [setEdges]);

  useEffect(() => {
    const handleEdgeDelete = (event) => {
      const { id } = event.detail;
      setEdges((eds) => eds.filter((edge) => edge.id !== id));
      showSnackbar("Relationship deleted successfully", "success");
    };

    window.addEventListener("edgeDelete", handleEdgeDelete);
    return () => {
      window.removeEventListener("edgeDelete", handleEdgeDelete);
    };
  }, []);

  // Handle node drag & drop from sidebar
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    async (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      try {
        // Créer d'abord la classe dans le backend
        const classResponse = await localService.createClass({
          className: "NewClassNode",
          modifier: "PUBLIC",
          classType: type.replace("Node", "").toUpperCase(),
          attributes: [],
          methods: [],
        });

        // Créer ensuite le nœud avec l'ID de la classe
        const newNode = {
          id: `node-${Date.now()}`,
          type,
          position,
          data: {
            className: "NewClassNode",
            classId: classResponse.id, // Stocker l'ID de la classe du backend
            attributes: [],
            methods: [],
          },
        };

        setNodes((nds) => nds.concat(newNode));
      } catch (error) {
        console.error("Error creating class:", error);
        showSnackbar("Error creating class", "error");
      }
    },
    [reactFlowInstance]
  );

  // Handle connection between nodes
  const onConnect = useCallback(
    (params) => {
      // Vérifier si une connexion existe déjà
      const connectionExists = edges.some(
        (edge) =>
          (edge.source === params.source && edge.target === params.target) ||
          (edge.source === params.target && edge.target === params.source)
      );

      if (connectionExists) {
        showSnackbar(
          "Une relation existe déjà entre ces deux éléments",
          "warning"
        );
        return;
      }

      setSelectedConnection({
        source: params.source,
        target: params.target,
      });
      setRelationshipDialogOpen(true);
    },
    [edges]
  );

  // Ajouter une fonction pour vérifier si une connexion est valide
  const isValidConnection = useCallback(
    (connection) => {
      // Vérifier si une connexion existe déjà entre ces nœuds
      const connectionExists = edges.some(
        (edge) =>
          (edge.source === connection.source &&
            edge.target === connection.target) ||
          (edge.source === connection.target &&
            edge.target === connection.source)
      );

      if (connectionExists) {
        showSnackbar(
          "Une relation existe déjà entre ces deux éléments",
          "warning"
        );
        return false;
      }

      return true;
    },
    [edges]
  );

  // Fonction utilitaire pour créer un nouveau nœud
  const createNewNode = (classData, tempId) => {
    const nodeId = `classNode_${Date.now()}`;
    return {
      id: nodeId,
      type: "classNode",
      position: { x: 100, y: 100 },
      data: {
        ...classData,
        id: tempId,
        backendId: tempId,
        classId: tempId,
        className: classData.className,
        attributes: classData.attributes || [],
        methods: classData.methods || [],
      },
    };
  };

  const handleCreateRelationship = async (relationshipData) => {
    try {
      if (!selectedConnection) {
        throw new Error("No connection selected");
      }

      const sourceNode = nodes.find(
        (node) => node.id === selectedConnection.source
      );
      const targetNode = nodes.find(
        (node) => node.id === selectedConnection.target
      );

      if (!sourceNode?.data?.classId || !targetNode?.data?.classId) {
        showSnackbar("Class IDs are missing", "error");
        return;
      }

      // Créer la relation dans le backend
      const response = await localService.createRelationship({
        sourceClassId: sourceNode.data.classId,
        targetClassId: targetNode.data.classId,
        type: relationshipData.type,
        multiplicitySource: relationshipData.multiplicitySource,
        multiplicityTarget: relationshipData.multiplicityTarget,
        navigable: relationshipData.navigable,
      });

      // Créer l'edge avec l'ID retourné par le backend
      const newEdge = {
        id: `edge-${response.id}`,
        source: selectedConnection.source,
        target: selectedConnection.target,
        type: "custom",
        data: {
          ...relationshipData,
          relationshipId: response.id,
        },
      };

      setEdges((prevEdges) => [...prevEdges, newEdge]);
      setRelationshipDialogOpen(false);
      setSelectedConnection(null);
      showSnackbar("Relationship created successfully", "success");
    } catch (error) {
      console.error("Error creating relationship:", error);
      showSnackbar(error.message || "Error creating relationship", "error");
    }
  };

  // Save diagram
  const handleSaveDiagram = async () => {
    try {
      const diagramData = {
        name: `Diagramme du ${new Date().toLocaleString()}`,
        content: JSON.stringify({
          nodes: nodes,
          edges: edges,
        }),
        savedAt: new Date().toISOString(),
      };

      const savedDiagram = await localService.createDiagram(diagramData);
      setCurrentDiagramId(savedDiagram.id);
      await loadDiagrams();
      showSnackbar("Diagramme sauvegardé avec succès", "success");
    } catch (error) {
      console.error("Error saving diagram:", error);
      showSnackbar("Erreur lors de la sauvegarde du diagramme", "error");
    }
  };

  // Generate code
  const handleGenerateCode = async (language, useLocal = true) => {
    try {
      if (!currentDiagramId && useLocal) {
        showSnackbar("Veuillez d'abord sauvegarder le diagramme", "warning");
        return;
      }

      let response;

      if (useLocal) {
        switch (language) {
          case "java":
            response = await localService.generateJavaCode(currentDiagramId);
            break;
          case "python":
            response = await localService.generatePythonCode(currentDiagramId);
            break;
          case "php":
            response = await localService.generatePhpCode(currentDiagramId);
            break;
          default:
            throw new Error(`Unsupported language: ${language}`);
        }
      } else {
        // Génération en ligne avec Gemini
        const diagramData = {
          nodes: nodes,
          edges: edges,
        };
        response = await geminiService.generateCode(diagramData, language);
      }

      // Vérifier si la réponse est valide
      if (!response || (!response.code && !response.error)) {
        throw new Error("Invalid response from code generator");
      }

      // Si nous avons une erreur dans la réponse, l'afficher
      if (response.error) {
        showSnackbar(response.error, "error");
        return;
      }

      setGeneratedCode(response);
      showSnackbar(`Code ${language} généré avec succès`, "success");
    } catch (error) {
      console.error(`Error generating ${language} code:`, error);
      showSnackbar(
        `Erreur lors de la génération du code ${language}: ${error.message}`,
        "error"
      );
    }
  };

  const [currentDiagramId, setCurrentDiagramId] = useState(null);

  const handleDiagramSelect = (diagram) => {
    try {
      const diagramData = JSON.parse(diagram.content);
      setNodes(diagramData.nodes || []);
      setEdges(diagramData.edges || []);
      setCurrentDiagramId(diagram.id);
      showSnackbar("Diagramme chargé avec succès", "success");
    } catch (error) {
      console.error("Error loading diagram:", error);
      showSnackbar("Erreur lors du chargement du diagramme", "error");
    }
  };
  // Utility function for showing snackbar messages
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // Ajouter une fonction pour la suppression avec confirmation
  const onNodesDelete = useCallback(
    (nodesToDelete) => {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete the selected node(s)?"
      );

      if (confirmDelete) {
        // Supprimer les connexions associées
        setEdges((eds) =>
          eds.filter((edge) => {
            return !nodesToDelete.some(
              (node) => node.id === edge.source || node.id === edge.target
            );
          })
        );

        // Supprimer les nœuds
        setNodes((nds) =>
          nds.filter((node) => !nodesToDelete.some((n) => n.id === node.id))
        );

        showSnackbar("Node(s) deleted successfully", "success");
      }
    },
    [setNodes, setEdges]
  );

  const loadDiagrams = async () => {
    try {
      console.log("Starting to load diagrams...");
      const response = await localService.getDiagrams();

      if (!response || !Array.isArray(response)) {
        console.warn("Invalid diagrams response:", response);
        setDiagrams([]);
        return;
      }

      console.log("Loaded diagrams:", response);
      setDiagrams(
        response.map((diagram) => ({
          ...diagram,
          savedAt: diagram.savedAt || new Date().toISOString(),
        }))
      );
    } catch (error) {
      console.error("Error loading diagrams:", error);
      showSnackbar(
        "Error loading diagrams: " + (error.message || "Unknown error"),
        "error"
      );
      setDiagrams([]);
    }
  };

  // Ajouter une fonction pour charger les classes existantes
  const loadExistingClasses = async () => {
    try {
      const classes = await localService.getClasses();
      console.log("Loaded classes:", classes);

      const newNodes = classes.map((classData) => ({
        id: `node-${classData.id}`,
        type:
          classData.classType === "ABSTRACT"
            ? "abstractClassNode"
            : classData.classType === "INTERFACE"
            ? "interfaceNode"
            : classData.classType === "ENUM"
            ? "enumNode"
            : "classNode",
        position: classData.position || {
          x: Math.random() * 500,
          y: Math.random() * 500,
        },
        data: {
          ...classData,
          id: classData.id,
          backendId: classData.id,
          className: classData.className,
          attributes: classData.attributes || [],
          methods: classData.methods || [],
        },
      }));

      setNodes(newNodes);
    } catch (error) {
      console.error("Error loading classes:", error);
      showSnackbar("Error loading existing classes", "error");
    }
  };

  // Ajouter l'effet pour charger les classes au montage
  useEffect(() => {
    loadExistingClasses();
  }, []);

  // Ajouter les gestionnaires de changement
  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const handleClearCanvas = () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear the canvas? This will remove all nodes and connections."
    );

    if (confirmClear) {
      setNodes([]);
      setEdges([]);
      showSnackbar("Canvas cleared successfully", "success");
    }
  };

  const saveCurrentState = useCallback(() => {
    localService.saveState(nodes, edges);
    setCanUndo(localService.canUndo());
    setCanRedo(localService.canRedo());
  }, [nodes, edges]);

  const handleUndo = useCallback(() => {
    const previousState = localService.undo();
    if (previousState) {
      setNodes(previousState.nodes);
      setEdges(previousState.edges);
      setCanUndo(localService.canUndo());
      setCanRedo(localService.canRedo());
    }
  }, []);

  const handleRedo = useCallback(() => {
    const nextState = localService.redo();
    if (nextState) {
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setCanUndo(localService.canUndo());
      setCanRedo(localService.canRedo());
    }
  }, []);

  useEffect(() => {
    saveCurrentState();
  }, [nodes, edges, saveCurrentState]);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        <Navbar
          onSave={handleSaveDiagram}
          onGenerateJava={(useLocal) => handleGenerateCode("java", useLocal)}
          onGeneratePython={(useLocal) =>
            handleGenerateCode("python", useLocal)
          }
          onGenerateCpp={(useLocal) => handleGenerateCode("cpp", useLocal)}
          onGeneratePhp={(useLocal) => handleGenerateCode("php", useLocal)}
          onOpenHistory={() => setHistoryDialogOpen(true)}
          onClearCanvas={handleClearCanvas}
        />

        <Box sx={{ flex: 1, display: "flex", position: "relative" }}>
          <Sidebar />
          <Box ref={reactFlowWrapper} sx={{ flex: 1, height: "100%" }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              isValidConnection={isValidConnection}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onNodesDelete={onNodesDelete}
              deleteKeyCode={["Backspace", "Delete"]}
              fitView
              connectOnClick={true} // Permet la connexion en cliquant
              style={{
                backgroundColor: "#F5F7FA",
              }}
            >
              <Background
                color="#2B3A67"
                gap={24}
                size={1}
                style={{ opacity: 0.05 }}
              />
              <Controls
                style={{
                  button: {
                    backgroundColor: "white",
                    color: "#2B3A67",
                    borderRadius: 8,
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  },
                }}
              />
              <MiniMap
                style={{
                  backgroundColor: "white",
                  border: "none",
                  borderRadius: 8,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
            </ReactFlow>
          </Box>
        </Box>

        <RelationshipDialog
          open={relationshipDialogOpen}
          onClose={() => {
            setRelationshipDialogOpen(false);
            setSelectedConnection(null);
          }}
          source={selectedConnection?.source}
          target={selectedConnection?.target}
          onSave={handleCreateRelationship}
        />

        <HistoryDialog
          open={historyDialogOpen}
          onClose={() => setHistoryDialogOpen(false)}
          onDiagramSelect={handleDiagramSelect}
        />

        <CodePreviewDialog
          open={Boolean(generatedCode)}
          onClose={() => setGeneratedCode(null)}
          code={generatedCode?.code || ""}
          filename={generatedCode?.filename || ""}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        <Toolbar
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          reactFlowInstance={reactFlowInstance}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;
