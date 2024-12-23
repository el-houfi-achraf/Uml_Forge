// src/components/GenerateCodeMenu.jsx
import React, { useState } from "react";
import {
  Menu,
  MenuItem,
  Button,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import CodeIcon from "@mui/icons-material/Code";
import JavaIcon from "@mui/icons-material/Coffee";
import PythonIcon from "@mui/icons-material/IntegrationInstructions";
import { localService } from "../services/localService";

function GenerateCodeMenu({ currentDiagramId }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleGenerateJava = () => {
    const result = localService.generateJavaCode();
    alert(result.message);
    handleClose();
  };

  const handleGeneratePython = () => {
    const result = localService.generatePythonCode();
    alert(result.message);
    handleClose();
  };

  return (
    <>
      <Button
        variant="contained"
        onClick={handleClick}
        startIcon={<CodeIcon />}
        disabled={!currentDiagramId}
      >
        GENERATE CODE
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleGenerateJava}>
          <ListItemIcon>
            <JavaIcon />
          </ListItemIcon>
          <ListItemText>Générer Java</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleGeneratePython}>
          <ListItemIcon>
            <PythonIcon />
          </ListItemIcon>
          <ListItemText>Générer Python</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}

export default GenerateCodeMenu;
