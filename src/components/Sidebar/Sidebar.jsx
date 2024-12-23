import React from "react";
import { Paper, Typography, Box, Tooltip } from "@mui/material";
import ClassIcon from "@mui/icons-material/Class";
import InterfaceIcon from "@mui/icons-material/Api";
import AbstractIcon from "@mui/icons-material/Architecture";
import EnumIcon from "@mui/icons-material/FormatListNumbered";

function Sidebar() {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const nodeTypes = [
    {
      type: "classNode",
      label: "Class",
      icon: <ClassIcon />,
      color: "#1976D2",
    },
    {
      type: "abstractClassNode",
      label: "Abstract Class",
      icon: <AbstractIcon />,
      color: "#388E3C",
    },
    {
      type: "interfaceNode",
      label: "Interface",
      icon: <InterfaceIcon />,
      color: "#F57C00",
    },
    {
      type: "enumNode",
      label: "Enumeration",
      icon: <EnumIcon />,
      color: "#C2185B",
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        width: 220,
        backgroundColor: "background.default",
        borderRight: "1px solid",
        borderColor: "divider",
        p: 2,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          fontWeight: 600,
          color: "primary.main",
          textAlign: "center",
        }}
      >
        Palette
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {nodeTypes.map((node) => (
          <Tooltip
            key={node.type}
            title={`Add ${node.label}`}
            placement="right"
          >
            <Paper
              draggable
              onDragStart={(event) => onDragStart(event, node.type)}
              elevation={0}
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
                cursor: "grab",
                backgroundColor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                transition: "all 0.2s",
                "&:hover": {
                  backgroundColor: `${node.color}10`,
                  borderColor: node.color,
                },
              }}
            >
              <Box
                sx={{
                  color: node.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {node.icon}
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: "text.primary",
                }}
              >
                {node.label}
              </Typography>
            </Paper>
          </Tooltip>
        ))}
      </Box>
    </Paper>
  );
}

export default Sidebar;
