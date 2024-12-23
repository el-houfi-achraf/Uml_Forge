import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

function EnumDialog({ open, onClose, data, onUpdate }) {
  const [enumData, setEnumData] = useState({
    className: "",
    values: [],
  });

  useEffect(() => {
    if (data) {
      setEnumData({
        className: data.className || "",
        values: data.values || [],
      });
    }
  }, [data]);

  const handleAddValue = () => {
    setEnumData((prev) => ({
      ...prev,
      values: [...(prev.values || []), ""],
    }));
  };

  const handleValueChange = (index, value) => {
    const newValues = [...(enumData.values || [])];
    newValues[index] = value;
    setEnumData((prev) => ({ ...prev, values: newValues }));
  };

  const handleDeleteValue = (index) => {
    const newValues = enumData.values.filter((_, i) => i !== index);
    setEnumData((prev) => ({ ...prev, values: newValues }));
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(enumData);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Enumeration</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Enum Name"
          value={enumData.className || ""}
          onChange={(e) =>
            setEnumData((prev) => ({ ...prev, className: e.target.value }))
          }
          margin="normal"
        />

        <h4>Values</h4>
        <List>
          {(enumData.values || []).map((value, index) => (
            <ListItem key={index}>
              <TextField
                fullWidth
                value={value}
                onChange={(e) => handleValueChange(index, e.target.value)}
                style={{ margin: "0 8px" }}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleDeleteValue(index)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        <Button startIcon={<AddIcon />} onClick={handleAddValue}>
          Add Value
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EnumDialog;
