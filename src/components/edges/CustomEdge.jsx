import React from "react";
import { BaseEdge, getSmoothStepPath, EdgeLabelRenderer } from "reactflow";
import { useState } from "react";
import { Menu, MenuItem, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { EdgeColors } from "../../utils/constants";

function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  style = {},
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);

  // Calculer le point milieu et les décalages pour les multiplicités
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const angle = Math.atan2(dy, dx);

  // Décalage plus court pour les multiplicités (10 pixels de la fin)
  const offset = 10;

  // Position des multiplicités près des extrémités
  const sourcePosition = {
    x: sourceX + Math.cos(angle) * offset,
    y: sourceY + Math.sin(angle) * offset,
  };

  const targetPosition = {
    x: targetX - Math.cos(angle) * offset,
    y: targetY - Math.sin(angle) * offset,
  };

  // Position du bouton de suppression
  const middlePosition = {
    x: (sourceX + targetX) / 2,
    y: (sourceY + targetY) / 2,
  };

  // Vérifier si c'est une relation d'héritage
  const isInheritanceType =
    data?.type === "INHERITANCE" || data?.type === "REALIZATION";

  const handleClick = (event, end) => {
    if (isInheritanceType) return; // Désactiver pour l'héritage
    setAnchorEl(event.currentTarget);
    setSelectedEnd(end);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedEnd(null);
  };

  const handleDelete = (event) => {
    event.preventDefault();
    if (window.confirm("Are you sure you want to delete this relationship?")) {
      const deleteEvent = new CustomEvent("edgeDelete", {
        detail: { id },
      });
      window.dispatchEvent(deleteEvent);
    }
  };

  const handleMultiplicityChange = (value) => {
    const event = new CustomEvent("edgeUpdate", {
      detail: {
        id,
        data: {
          ...data,
          [selectedEnd === "source"
            ? "multiplicitySource"
            : "multiplicityTarget"]: value,
        },
      },
    });
    window.dispatchEvent(event);
    handleClose();
  };

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const getEdgeStyle = () => {
    switch (data?.type) {
      case "INHERITANCE":
        return {
          ...style,
          strokeWidth: 2,
          stroke: EdgeColors.INHERITANCE,
          markerEnd: "url(#inheritance)",
        };
      case "REALIZATION":
        return {
          ...style,
          strokeWidth: 2,
          stroke: EdgeColors.REALIZATION,
          strokeDasharray: "5,5",
          markerStart: "url(#realization-arrow)",
        };
      case "AGGREGATION":
        return {
          ...style,
          strokeWidth: 2,
          stroke: EdgeColors.AGGREGATION,
          markerEnd: "url(#aggregation)",
        };
      case "COMPOSITION":
        return {
          ...style,
          strokeWidth: 2,
          stroke: EdgeColors.COMPOSITION,
          markerEnd: "url(#composition)",
        };
      case "ASSOCIATION":
        return {
          ...style,
          strokeWidth: 2,
          stroke: EdgeColors.ASSOCIATION,
          ...(data?.sourceToTarget && { markerEnd: "url(#association-arrow)" }),
          ...(data?.targetToSource && {
            markerStart: "url(#association-arrow-reverse)",
          }),
        };
      default:
        return {
          ...style,
          strokeWidth: 2,
          stroke: EdgeColors.ASSOCIATION,
        };
    }
  };

  return (
    <>
      <defs>
        {/* Inheritance arrow marker */}
        <marker
          id="inheritance"
          viewBox="0 0 20 20"
          refX="18"
          refY="10"
          markerWidth="10"
          markerHeight="10"
          orient="auto-start-reverse"
        >
          <path
            d="M 0 0 L 20 10 L 0 20 z"
            fill="white"
            stroke={EdgeColors.INHERITANCE}
          />
        </marker>

        {/* Realization arrow marker */}
        <marker
          id="realization-arrow"
          viewBox="0 0 20 20"
          refX="18"
          refY="10"
          markerWidth="10"
          markerHeight="10"
          orient="auto"
        >
          <path
            d="M 0 0 L 20 10 L 0 20 z"
            fill="white"
            stroke={EdgeColors.REALIZATION}
            strokeWidth="1.5"
          />
        </marker>

        {/* Aggregation diamond marker */}
        <marker
          id="aggregation"
          viewBox="0 0 20 20"
          refX="18"
          refY="10"
          markerWidth="10"
          markerHeight="10"
          orient="auto-start-reverse"
        >
          <path
            d="M 0 10 L 10 0 L 20 10 L 10 20 z"
            fill="white"
            stroke={EdgeColors.AGGREGATION}
          />
        </marker>

        {/* Composition diamond marker */}
        <marker
          id="composition"
          viewBox="0 0 20 20"
          refX="18"
          refY="10"
          markerWidth="10"
          markerHeight="10"
          orient="auto-start-reverse"
        >
          <path
            d="M 0 10 L 10 0 L 20 10 L 10 20 z"
            fill={EdgeColors.COMPOSITION}
            stroke={EdgeColors.COMPOSITION}
          />
        </marker>

        {/* Forward arrow for source to target */}
        <marker
          id="association-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path
            d="M 0 0 L 10 5 L 0 10"
            fill="none"
            stroke={EdgeColors.ASSOCIATION}
            strokeWidth="1.5"
          />
        </marker>

        {/* Reverse arrow for target to source */}
        <marker
          id="association-arrow-reverse"
          viewBox="0 0 10 10"
          refX="2"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path
            d="M 10 0 L 0 5 L 10 10"
            fill="none"
            stroke={EdgeColors.ASSOCIATION}
            strokeWidth="1.5"
          />
        </marker>
      </defs>

      <BaseEdge path={edgePath} style={getEdgeStyle()} />

      {/* Afficher les multiplicités seulement si ce n'est pas une relation d'héritage */}
      {!isInheritanceType && (
        <>
          {/* Source multiplicity label */}
          <EdgeLabelRenderer>
            <div
              style={{
                position: "absolute",
                transform: `translate(-50%, -50%) translate(${sourcePosition.x}px,${sourcePosition.y}px)`,
                fontSize: 12,
                fontWeight: 500,
                pointerEvents: "all",
                cursor: "pointer",
              }}
              onClick={(e) => handleClick(e, "source")}
            >
              {data?.multiplicitySource || "1"}
            </div>
          </EdgeLabelRenderer>

          {/* Target multiplicity label */}
          <EdgeLabelRenderer>
            <div
              style={{
                position: "absolute",
                transform: `translate(-50%, -50%) translate(${targetPosition.x}px,${targetPosition.y}px)`,
                fontSize: 12,
                fontWeight: 500,
                pointerEvents: "all",
                cursor: "pointer",
              }}
              onClick={(e) => handleClick(e, "target")}
            >
              {data?.multiplicityTarget || "1"}
            </div>
          </EdgeLabelRenderer>
        </>
      )}

      {/* Delete button */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${middlePosition.x}px,${middlePosition.y}px)`,
            pointerEvents: "all",
          }}
        >
          <IconButton
            size="small"
            onClick={handleDelete}
            sx={{
              backgroundColor: "white",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
              width: 24,
              height: 24,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <DeleteIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </div>
      </EdgeLabelRenderer>

      {/* Multiplicity selection menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={() => handleMultiplicityChange("0..1")}>
          0..1
        </MenuItem>
        <MenuItem onClick={() => handleMultiplicityChange("1")}>1</MenuItem>
        <MenuItem onClick={() => handleMultiplicityChange("0..*")}>
          0..*
        </MenuItem>
        <MenuItem onClick={() => handleMultiplicityChange("1..*")}>
          1..*
        </MenuItem>
        <MenuItem onClick={() => handleMultiplicityChange("*")}>*</MenuItem>
      </Menu>
    </>
  );
}

export default CustomEdge;
