import React from "react";
import { Box, IconButton, Tooltip, Menu, MenuItem } from "@mui/material";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import { exportService } from "../../services/exportService";

function Toolbar({ onUndo, onRedo, canUndo, canRedo, reactFlowInstance }) {
  const [exportAnchorEl, setExportAnchorEl] = React.useState(null);

  const handleExportClick = (event) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  const handleExport = async (format) => {
    try {
      let dataUrl;
      let filename;

      switch (format) {
        case "png":
          dataUrl = await exportService.exportToPng(reactFlowInstance);
          filename = "diagram.png";
          break;
        case "svg":
          dataUrl = await exportService.exportToSvg(reactFlowInstance);
          filename = "diagram.svg";
          break;
        case "xmi":
          const xmi = exportService.exportToXMI(
            reactFlowInstance.getNodes(),
            reactFlowInstance.getEdges()
          );
          const blob = new Blob([xmi], { type: "application/xml" });
          dataUrl = URL.createObjectURL(blob);
          filename = "diagram.xmi";
          break;
        default:
          return;
      }

      // Télécharger le fichier
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
    }
    handleExportClose();
  };

  return (
    <Box
      sx={{
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: 32,
        zIndex: 1000,
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 3,
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        padding: 1,
        display: "flex",
        gap: 1,
      }}
    >
      <Tooltip title="Undo">
        <span>
          <IconButton
            onClick={onUndo}
            disabled={!canUndo}
            sx={{
              backgroundColor: canUndo ? "rgba(0,0,0,0.04)" : "transparent",
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.08)",
              },
            }}
          >
            <UndoIcon />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Redo">
        <span>
          <IconButton onClick={onRedo} disabled={!canRedo}>
            <RedoIcon />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Export">
        <IconButton onClick={handleExportClick}>
          <SaveAltIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={exportAnchorEl}
        open={Boolean(exportAnchorEl)}
        onClose={handleExportClose}
      >
        <MenuItem onClick={() => handleExport("png")}>Export as PNG</MenuItem>
        <MenuItem onClick={() => handleExport("svg")}>Export as SVG</MenuItem>
        <MenuItem onClick={() => handleExport("xmi")}>Export as XMI</MenuItem>
      </Menu>
    </Box>
  );
}

export default Toolbar;
