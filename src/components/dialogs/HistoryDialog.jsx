import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  CircularProgress,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";
import { localService } from "../../services/localService";

function HistoryDialog({ open, onClose, onDiagramSelect }) {
  const [diagrams, setDiagrams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");

  const fetchDiagrams = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedDiagrams = await localService.getDiagrams();
      console.log("Fetched diagrams:", fetchedDiagrams);
      setDiagrams(fetchedDiagrams);
    } catch (error) {
      console.error("Error fetching diagrams:", error);
      setError("Failed to load diagrams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchDiagrams();
    }
  }, [open]);

  const handleDelete = async (id, event) => {
    event.stopPropagation();
    try {
      await localService.deleteDiagram(id);
      await fetchDiagrams();
    } catch (error) {
      console.error("Error deleting diagram:", error);
      setError("Failed to delete diagram");
    }
  };

  const startEditing = (diagram, event) => {
    event.stopPropagation();
    setEditingId(diagram.id);
    setEditedName(diagram.name || `Diagramme ${diagram.id}`);
  };

  const cancelEditing = (event) => {
    event.stopPropagation();
    setEditingId(null);
    setEditedName("");
  };

  const saveNewName = async (diagram, event) => {
    event.stopPropagation();
    try {
      await localService.updateDiagram(diagram.id, {
        ...diagram,
        name: editedName,
      });
      setEditingId(null);
      await fetchDiagrams();
    } catch (error) {
      console.error("Error updating diagram name:", error);
      setError("Failed to update diagram name");
    }
  };

  const handleDiagramClick = (diagram) => {
    onDiagramSelect(diagram);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Historique des diagrammes</DialogTitle>
      <DialogContent>
        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <CircularProgress />
          </div>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : diagrams.length === 0 ? (
          <Typography>Aucun diagramme sauvegardé</Typography>
        ) : (
          <List>
            {diagrams.map((diagram) => (
              <ListItem
                key={diagram.id}
                onClick={() => handleDiagramClick(diagram)}
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                  },
                }}
              >
                {editingId === diagram.id ? (
                  <>
                    <TextField
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      fullWidth
                      autoFocus
                    />
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        saveNewName(diagram, e);
                      }}
                    >
                      <CheckIcon color="primary" />
                    </IconButton>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelEditing(e);
                      }}
                    >
                      <CancelIcon color="error" />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <ListItemText
                      primary={diagram.name || `Diagramme ${diagram.id}`}
                      secondary={new Date(diagram.createdAt).toLocaleString()}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(diagram, e);
                        }}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(diagram.id, e);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default HistoryDialog;
