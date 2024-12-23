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

function InterfaceDialog({ open, onClose, data, onUpdate }) {
  const [interfaceData, setInterfaceData] = useState({
    className: "",
    methods: [],
  });

  useEffect(() => {
    if (data) {
      setInterfaceData(data);
    }
  }, [data]);

  const handleAddMethod = () => {
    setInterfaceData((prev) => ({
      ...prev,
      methods: [
        ...prev.methods,
        {
          name: "",
          returnType: "void",
          parameters: [],
        },
      ],
    }));
  };

  const handleMethodChange = (index, field, value) => {
    const newMethods = [...interfaceData.methods];
    newMethods[index] = { ...newMethods[index], [field]: value };
    setInterfaceData((prev) => ({ ...prev, methods: newMethods }));
  };

  const handleAddParameter = (methodIndex) => {
    const newMethods = [...interfaceData.methods];
    newMethods[methodIndex].parameters.push({ name: "", type: "" });
    setInterfaceData((prev) => ({ ...prev, methods: newMethods }));
  };

  const handleSave = () => {
    onUpdate(interfaceData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Interface</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Interface Name"
          value={interfaceData.className}
          onChange={(e) =>
            setInterfaceData((prev) => ({ ...prev, className: e.target.value }))
          }
          margin="normal"
        />

        <h4>Methods</h4>
        <List>
          {interfaceData.methods.map((method, methodIndex) => (
            <ListItem key={methodIndex}>
              <TextField
                label="Name"
                value={method.name}
                onChange={(e) =>
                  handleMethodChange(methodIndex, "name", e.target.value)
                }
                style={{ margin: "0 8px" }}
              />
              <TextField
                label="Return Type"
                value={method.returnType}
                onChange={(e) =>
                  handleMethodChange(methodIndex, "returnType", e.target.value)
                }
                style={{ margin: "0 8px" }}
              />
              <Button
                size="small"
                onClick={() => handleAddParameter(methodIndex)}
              >
                Add Parameter
              </Button>
              <List>
                {method.parameters.map((param, paramIndex) => (
                  <ListItem key={paramIndex}>
                    <TextField
                      label="Parameter Name"
                      value={param.name}
                      onChange={(e) => {
                        const newMethods = [...interfaceData.methods];
                        newMethods[methodIndex].parameters[paramIndex].name =
                          e.target.value;
                        setInterfaceData((prev) => ({
                          ...prev,
                          methods: newMethods,
                        }));
                      }}
                      style={{ margin: "0 8px" }}
                    />
                    <TextField
                      label="Parameter Type"
                      value={param.type}
                      onChange={(e) => {
                        const newMethods = [...interfaceData.methods];
                        newMethods[methodIndex].parameters[paramIndex].type =
                          e.target.value;
                        setInterfaceData((prev) => ({
                          ...prev,
                          methods: newMethods,
                        }));
                      }}
                      style={{ margin: "0 8px" }}
                    />
                  </ListItem>
                ))}
              </List>
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => {
                    const newMethods = interfaceData.methods.filter(
                      (_, i) => i !== methodIndex
                    );
                    setInterfaceData((prev) => ({
                      ...prev,
                      methods: newMethods,
                    }));
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        <Button startIcon={<AddIcon />} onClick={handleAddMethod}>
          Add Method
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

export default InterfaceDialog;
