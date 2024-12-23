import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import { Paper, Typography, Divider, IconButton, Box } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ClassDialog from "../dialogs/ClassDialog";

// Updated color constants with a more modern palette
const nodeColors = {
  classNode: {
    header: "#2563eb", // Bright blue
    headerText: "#ffffff",
    border: "#60a5fa",
    background: "#eff6ff",
    textColor: "#1e40af",
    sectionBg: "#f8fafc",
  },
  abstractClassNode: {
    header: "#059669", // Emerald
    headerText: "#ffffff",
    border: "#34d399",
    background: "#ecfdf5",
    textColor: "#065f46",
    sectionBg: "#f8fafc",
  },
  interfaceNode: {
    header: "#7c3aed", // Violet
    headerText: "#ffffff",
    border: "#a78bfa",
    background: "#f5f3ff",
    textColor: "#5b21b6",
    sectionBg: "#f8fafc",
  },
  enumNode: {
    header: "#db2777", // Pink
    headerText: "#ffffff",
    border: "#f472b6",
    background: "#fdf2f8",
    textColor: "#9d174d",
    sectionBg: "#f8fafc",
  },
};

function ClassNode({ data, id, type = "classNode" }) {
  const [open, setOpen] = useState(false);

  const handleUpdate = (updatedData) => {
    const event = new CustomEvent("nodeDataUpdate", {
      detail: { id: id, data: updatedData },
    });
    window.dispatchEvent(event);
  };

  const handleDelete = () => {
    const event = new CustomEvent("nodeDelete", {
      detail: { id: id },
    });
    window.dispatchEvent(event);
  };

  const formatMethodSignature = (method) => {
    const visibility =
      method.visibility === "private"
        ? "-"
        : method.visibility === "protected"
        ? "#"
        : "+";
    const staticPrefix = method.isStatic ? "static " : "";
    const abstractPrefix = method.isAbstract ? "abstract " : "";
    const params = method.parameters
      ?.map((p) => `${p.name}: ${p.type}`)
      .join(", ");

    return `${visibility} ${staticPrefix}${abstractPrefix}${method.name}(${params}): ${method.returnType}`;
  };

  // Get colors based on node type
  const colors = nodeColors[type] || nodeColors.classNode;

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{
          ...handleStyle,
          backgroundColor: colors.header,
        }}
      />
      <Paper
        elevation={3}
        sx={{
          minWidth: 250,
          backgroundColor: colors.background,
          borderRadius: "12px",
          overflow: "hidden",
          border: `2px solid ${colors.border}`,
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: `0 8px 25px ${colors.border}40`,
            transform: "translateY(-3px)",
          },
        }}
      >
        {/* Class Header */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${colors.header}, ${colors.border})`,
            padding: "16px",
            position: "relative",
            overflow: "hidden",
            "&::after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "radial-gradient(circle at top right, rgba(255,255,255,0.2), transparent)",
              pointerEvents: "none",
            },
          }}
        >
          {type === "abstractClassNode" && (
            <Typography
              sx={{
                fontSize: "0.75rem",
                color: colors.headerText,
                fontStyle: "italic",
                marginBottom: "4px",
                fontFamily: "monospace",
              }}
            >
              &lt;&lt;abstract&gt;&gt;
            </Typography>
          )}
          {type === "interfaceNode" && (
            <Typography
              sx={{
                fontSize: "0.75rem",
                color: colors.headerText,
                fontStyle: "italic",
                marginBottom: "4px",
                fontFamily: "monospace",
              }}
            >
              &lt;&lt;interface&gt;&gt;
            </Typography>
          )}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "relative",
              zIndex: 1,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontSize: "1.1rem",
                fontWeight: 600,
                color: colors.headerText,
                fontFamily: "'Fira Code', monospace",
                textShadow: "0 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              {data.className}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton
                size="small"
                onClick={() => setOpen(true)}
                sx={{
                  color: colors.headerText,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(8px)",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.2)",
                  },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleDelete}
                sx={{
                  color: "#fff",
                  backgroundColor: "rgba(239,68,68,0.2)",
                  backdropFilter: "blur(8px)",
                  "&:hover": {
                    backgroundColor: "rgba(239,68,68,0.3)",
                  },
                }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Attributes Section */}
        <Box
          sx={{
            padding: "16px",
            backgroundColor: colors.sectionBg,
            borderBottom: `1px solid ${colors.border}20`,
          }}
        >
          {data.attributes?.map((attr, index) => (
            <Typography
              key={index}
              sx={{
                fontSize: "0.9rem",
                color: colors.textColor,
                fontFamily: "'Fira Code', monospace",
                padding: "4px 8px",
                borderRadius: "4px",
                marginBottom: "4px",
                backgroundColor: colors.background,
                "&:last-child": { marginBottom: 0 },
                transition: "background-color 0.2s ease",
                "&:hover": {
                  backgroundColor: `${colors.border}10`,
                },
              }}
            >
              {attr.visibility === "private"
                ? "-"
                : attr.visibility === "protected"
                ? "#"
                : "+"}
              {attr.isStatic ? " static" : ""}
              {attr.isFinal ? " final" : ""} {attr.name}: {attr.type}
            </Typography>
          ))}
          {(!data.attributes || data.attributes.length === 0) && (
            <Typography
              sx={{
                fontSize: "0.875rem",
                color: "#94a3b8",
                fontStyle: "italic",
              }}
            >
              No attributes
            </Typography>
          )}
        </Box>

        {/* Methods Section */}
        <Box
          sx={{
            padding: "16px",
            backgroundColor: colors.sectionBg,
          }}
        >
          {data.methods?.map((method, index) => (
            <Typography
              key={index}
              sx={{
                fontSize: "0.9rem",
                color: colors.textColor,
                fontFamily: "'Fira Code', monospace",
                padding: "4px 8px",
                borderRadius: "4px",
                marginBottom: "4px",
                backgroundColor: colors.background,
                fontStyle: method.isAbstract ? "italic" : "normal",
                "&:last-child": { marginBottom: 0 },
                transition: "background-color 0.2s ease",
                "&:hover": {
                  backgroundColor: `${colors.border}10`,
                },
              }}
            >
              {formatMethodSignature(method)}
            </Typography>
          ))}
          {(!data.methods || data.methods.length === 0) && (
            <Typography
              sx={{
                fontSize: "0.875rem",
                color: "#94a3b8",
                fontStyle: "italic",
              }}
            >
              No methods
            </Typography>
          )}
        </Box>
      </Paper>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          ...handleStyle,
          backgroundColor: colors.header,
        }}
      />

      <ClassDialog
        open={open}
        onClose={() => setOpen(false)}
        data={data}
        onUpdate={handleUpdate}
      />
    </>
  );
}

const handleStyle = {
  width: 10,
  height: 10,
  border: "3px solid #ffffff",
  transition: "all 0.2s ease",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
};

export default ClassNode;
