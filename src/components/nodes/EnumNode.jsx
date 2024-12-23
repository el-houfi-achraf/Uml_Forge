import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import { Paper, Typography, Divider, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EnumDialog from "../dialogs/EnumDialog";
import { NodeColors } from "../../utils/constants";

function EnumNode({ data, id }) {
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    const event = new CustomEvent("nodeDelete", {
      detail: { id: id },
    });
    window.dispatchEvent(event);
  };

  const handleUpdate = (updatedData) => {
    const event = new CustomEvent("nodeDataUpdate", {
      detail: { id: id, data: updatedData },
    });
    window.dispatchEvent(event);
  };

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <Paper
        elevation={3}
        style={{
          padding: "10px",
          minWidth: 200,
          backgroundColor: NodeColors.ENUM.background,
          border: `2px solid ${NodeColors.ENUM.border}`,
        }}
      >
        <Typography
          variant="caption"
          style={{ display: "block", textAlign: "center" }}
        >
          &lt;&lt;enumeration&gt;&gt;
        </Typography>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="subtitle1" style={{ fontWeight: "bold" }}>
            {data.className || "Enum Name"}
          </Typography>
          <div>
            <IconButton size="small" onClick={() => setOpen(true)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleDelete} color="error">
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </div>
        </div>

        <Divider style={{ margin: "8px 0" }} />

        {/* Enum Values */}
        <div>
          {data.values?.map((value, index) => (
            <Typography key={index} variant="body2">
              {value}
            </Typography>
          ))}
        </div>
      </Paper>
      <Handle type="source" position={Position.Bottom} />

      <EnumDialog
        open={open}
        onClose={() => setOpen(false)}
        data={data}
        onUpdate={handleUpdate}
      />
    </>
  );
}

export default EnumNode;
