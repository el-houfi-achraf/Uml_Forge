import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CodeIcon from "@mui/icons-material/Code";
import HistoryIcon from "@mui/icons-material/History";
import ClearIcon from "@mui/icons-material/Clear";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import PresentationViewer from "../PresentationViewer/PresentationViewer";
import { ReactComponent as Logo } from "../../assets/logo.svg";

function Navbar({
  onSave,
  onGenerateJava,
  onGeneratePython,
  onGenerateCpp,
  onGeneratePhp,
  onGenerateOnline,
  onOpenHistory,
  onClearCanvas,
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [presentationOpen, setPresentationOpen] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: "linear-gradient(45deg, #2B3A67 30%, #5C6E9B 90%)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Toolbar sx={{ minHeight: 64 }}>
          <Logo
            style={{
              height: 40,
              width: 40,
              marginRight: 16,
            }}
          />
          <Typography
            variant="h5"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              background: "linear-gradient(45deg, #FFFFFF 30%, #E0E0E0 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            UMLForge
          </Typography>

          <Button
            color="inherit"
            startIcon={<SaveIcon />}
            onClick={onSave}
            sx={{
              mr: 2,
              px: 3,
              py: 1,
              borderRadius: 2,
            }}
          >
            Save
          </Button>

          <Button
            color="inherit"
            startIcon={<ClearIcon />}
            onClick={onClearCanvas}
            sx={{ mr: 2 }}
          >
            Clear Canvas
          </Button>

          <Button
            color="inherit"
            startIcon={<HistoryIcon />}
            onClick={onOpenHistory}
            sx={{ mr: 2 }}
          >
            Historique
          </Button>

          <Button
            color="inherit"
            startIcon={<CodeIcon />}
            endIcon={<KeyboardArrowDownIcon />}
            onClick={handleClick}
          >
            Generate Code
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem
              onClick={() => {
                handleClose();
                onGenerateJava(true);
              }}
            >
              Generate Java (Local)
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleClose();
                onGenerateJava(false);
              }}
            >
              Generate Java (Online)
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleClose();
                onGeneratePython(true);
              }}
            >
              Generate Python (Local)
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleClose();
                onGeneratePython(false);
              }}
            >
              Generate Python (Online)
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleClose();
                onGeneratePhp(true);
              }}
            >
              Generate PHP (Local)
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleClose();
                onGeneratePhp(false);
              }}
            >
              Generate PHP (Online)
            </MenuItem>
          </Menu>

          <IconButton
            color="inherit"
            onClick={() => setPresentationOpen(true)}
            title="Voir la présentation"
          >
            <SlideshowIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <PresentationViewer
        open={presentationOpen}
        onClose={() => setPresentationOpen(false)}
      />
    </>
  );
}

export default Navbar;
