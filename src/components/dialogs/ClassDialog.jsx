import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  IconButton,
  List,
  ListItem,
  FormControlLabel,
  Switch,
  Paper,
  Typography,
  Divider,
  Box,
  Chip,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CodeIcon from "@mui/icons-material/Code";
import FunctionsIcon from "@mui/icons-material/Functions";

function ClassDialog({ open, onClose, data, onUpdate }) {
  const [classData, setClassData] = useState({
    className: "",
    modifier: "PUBLIC",
    attributes: [],
    methods: [],
    isAbstract: false,
  });

  const [customType, setCustomType] = useState("");

  const dataTypes = [
    "void",
    "int",
    "double",
    "float",
    "String",
    "boolean",
    "long",
    "char",
    "byte",
    "short",
    "Object",
    "List",
    "Map",
    "Set",
    "custom",
  ];

  const [customTypes, setCustomTypes] = useState([]);

  useEffect(() => {
    if (data) {
      setClassData(data);
    }
  }, [data]);

  const handleAddAttribute = () => {
    setClassData((prev) => ({
      ...prev,
      attributes: [
        ...prev.attributes,
        {
          name: "",
          type: "",
          visibility: "private",
          isStatic: false,
          isFinal: false,
        },
      ],
    }));
  };

  const handleAddMethod = () => {
    setClassData((prev) => ({
      ...prev,
      methods: [
        ...prev.methods,
        {
          name: "",
          returnType: "void",
          visibility: "public",
          parameters: [],
          isStatic: false,
        },
      ],
    }));
  };

  const handleAttributeChange = (index, field, value) => {
    const newAttributes = [...classData.attributes];
    newAttributes[index] = { ...newAttributes[index], [field]: value };
    setClassData((prev) => ({ ...prev, attributes: newAttributes }));
  };

  const handleMethodChange = (index, field, value) => {
    const newMethods = [...classData.methods];
    newMethods[index] = { ...newMethods[index], [field]: value };
    setClassData((prev) => ({ ...prev, methods: newMethods }));
  };

  const handleSave = () => {
    onUpdate(classData);
    onClose();
  };

  const handleCustomTypeAdd = (newType) => {
    if (newType && !customTypes.includes(newType)) {
      setCustomTypes([...customTypes, newType]);
    }
    setCustomType("");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: "background.paper",
          height: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "primary.main",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <CodeIcon />
        <Typography variant="h6">Edit Class</Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 3, overflowY: "auto" }}>
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            label="Class Name"
            value={classData.className}
            onChange={(e) =>
              setClassData((prev) => ({ ...prev, className: e.target.value }))
            }
            variant="outlined"
            sx={{ flex: 2 }}
          />

          <Select
            value={classData.modifier}
            onChange={(e) =>
              setClassData((prev) => ({ ...prev, modifier: e.target.value }))
            }
            variant="outlined"
            sx={{ flex: 1 }}
          >
            <MenuItem value="PUBLIC">Public</MenuItem>
            <MenuItem value="DEFAULT">Default</MenuItem>
          </Select>
        </Box>

        {/* Attributes Section */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: "grey.50" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
              gap: 1,
            }}
          >
            <VisibilityIcon color="primary" />
            <Typography variant="h6">Attributes</Typography>
          </Box>

          <List sx={{ bgcolor: "background.paper", borderRadius: 1 }}>
            {classData.attributes.map((attr, index) => (
              <ListItem
                key={index}
                sx={{
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:last-child": { borderBottom: 0 },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    width: "100%",
                    alignItems: "center",
                  }}
                >
                  <Select
                    value={attr.visibility}
                    onChange={(e) =>
                      handleAttributeChange(index, "visibility", e.target.value)
                    }
                    size="small"
                    sx={{ width: 120 }}
                  >
                    <MenuItem value="private">private</MenuItem>
                    <MenuItem value="public">public</MenuItem>
                    <MenuItem value="protected">protected</MenuItem>
                  </Select>

                  <TextField
                    label="Name"
                    value={attr.name}
                    onChange={(e) =>
                      handleAttributeChange(index, "name", e.target.value)
                    }
                    size="small"
                  />

                  <Select
                    value={attr.type || ""}
                    onChange={(e) => {
                      if (e.target.value === "custom") {
                        return;
                      }
                      handleAttributeChange(index, "type", e.target.value);
                    }}
                    size="small"
                    sx={{ width: 120 }}
                  >
                    {dataTypes.map((type) => (
                      <MenuItem
                        key={type}
                        value={type}
                        sx={
                          type === "custom"
                            ? { borderTop: "1px solid #eee" }
                            : {}
                        }
                      >
                        {type === "custom" ? "Custom Type..." : type}
                      </MenuItem>
                    ))}
                    {customTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>

                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      gap: 1,
                      alignItems: "center",
                    }}
                  >
                    <TextField
                      size="small"
                      placeholder="Add custom type"
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && customType) {
                          handleCustomTypeAdd(customType);
                        }
                      }}
                      sx={{ width: 150 }}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleCustomTypeAdd(customType)}
                      disabled={!customType}
                    >
                      Add Type
                    </Button>
                  </Box>

                  {customTypes.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="textSecondary">
                        Custom Types:
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          flexWrap: "wrap",
                          mt: 1,
                        }}
                      >
                        {customTypes.map((type) => (
                          <Chip
                            key={type}
                            label={type}
                            size="small"
                            onDelete={() => {
                              setCustomTypes(
                                customTypes.filter((t) => t !== type)
                              );
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ ml: "auto" }}>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          const newAttributes = classData.attributes.filter(
                            (_, i) => i !== index
                          );
                          setClassData((prev) => ({
                            ...prev,
                            attributes: newAttributes,
                          }));
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>

          <Button
            startIcon={<AddIcon />}
            onClick={handleAddAttribute}
            variant="outlined"
            sx={{ mt: 2 }}
          >
            Add Attribute
          </Button>
        </Paper>

        {/* Methods Section */}
        <Paper elevation={0} sx={{ p: 2, bgcolor: "grey.50" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
              gap: 1,
            }}
          >
            <FunctionsIcon color="primary" />
            <Typography variant="h6">Methods</Typography>
          </Box>

          <List sx={{ bgcolor: "background.paper", borderRadius: 1 }}>
            {classData.methods?.map((method, methodIndex) => (
              <ListItem
                key={methodIndex}
                sx={{
                  flexDirection: "column",
                  alignItems: "stretch",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:last-child": { borderBottom: 0 },
                  p: 2,
                }}
              >
                <Box
                  sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}
                >
                  <Select
                    value={method.visibility}
                    onChange={(e) =>
                      handleMethodChange(
                        methodIndex,
                        "visibility",
                        e.target.value
                      )
                    }
                    size="small"
                    sx={{ width: 120 }}
                  >
                    <MenuItem value="public">public</MenuItem>
                    <MenuItem value="private">private</MenuItem>
                    <MenuItem value="protected">protected</MenuItem>
                  </Select>

                  <TextField
                    label="Name"
                    value={method.name}
                    onChange={(e) =>
                      handleMethodChange(methodIndex, "name", e.target.value)
                    }
                    size="small"
                  />

                  <Select
                    value={method.returnType}
                    onChange={(e) =>
                      handleMethodChange(
                        methodIndex,
                        "returnType",
                        e.target.value
                      )
                    }
                    size="small"
                    sx={{ width: 120 }}
                  >
                    {dataTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>

                  <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
                    <Chip
                      label="Static"
                      size="small"
                      color={method.isStatic ? "primary" : "default"}
                      onClick={() =>
                        handleMethodChange(
                          methodIndex,
                          "isStatic",
                          !method.isStatic
                        )
                      }
                    />
                    <Chip
                      label="Abstract"
                      size="small"
                      color={method.isAbstract ? "primary" : "default"}
                      onClick={() =>
                        handleMethodChange(
                          methodIndex,
                          "isAbstract",
                          !method.isAbstract
                        )
                      }
                    />
                    <Tooltip title="Delete Method">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          const newMethods = classData.methods.filter(
                            (_, i) => i !== methodIndex
                          );
                          setClassData((prev) => ({
                            ...prev,
                            methods: newMethods,
                          }));
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Parameters Section */}
                <Box sx={{ pl: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Parameters
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    {method.parameters?.map((param, paramIndex) => (
                      <Box
                        key={paramIndex}
                        sx={{
                          display: "flex",
                          gap: 2,
                          alignItems: "center",
                        }}
                      >
                        <TextField
                          label="Name"
                          value={param.name}
                          onChange={(e) => {
                            const newMethods = [...classData.methods];
                            newMethods[methodIndex].parameters[
                              paramIndex
                            ].name = e.target.value;
                            setClassData((prev) => ({
                              ...prev,
                              methods: newMethods,
                            }));
                          }}
                          size="small"
                        />
                        <Select
                          value={param.type || ""}
                          onChange={(e) => {
                            const newMethods = [...classData.methods];
                            newMethods[methodIndex].parameters[
                              paramIndex
                            ].type = e.target.value;
                            setClassData((prev) => ({
                              ...prev,
                              methods: newMethods,
                            }));
                          }}
                          size="small"
                          sx={{ width: 120 }}
                        >
                          {dataTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                              {type}
                            </MenuItem>
                          ))}
                        </Select>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            const newMethods = [...classData.methods];
                            newMethods[methodIndex].parameters.splice(
                              paramIndex,
                              1
                            );
                            setClassData((prev) => ({
                              ...prev,
                              methods: newMethods,
                            }));
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      const newMethods = [...classData.methods];
                      if (!newMethods[methodIndex].parameters) {
                        newMethods[methodIndex].parameters = [];
                      }
                      newMethods[methodIndex].parameters.push({
                        name: "",
                        type: "",
                      });
                      setClassData((prev) => ({
                        ...prev,
                        methods: newMethods,
                      }));
                    }}
                    sx={{ mt: 1 }}
                  >
                    Add Parameter
                  </Button>
                </Box>
              </ListItem>
            ))}
          </List>

          <Button
            startIcon={<AddIcon />}
            onClick={handleAddMethod}
            variant="outlined"
            sx={{ mt: 2 }}
          >
            Add Method
          </Button>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: "1px solid #eee" }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ClassDialog;
