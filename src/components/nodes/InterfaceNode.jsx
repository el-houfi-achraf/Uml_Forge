import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import { Paper, Typography, Divider, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import InterfaceDialog from "../dialogs/InterfaceDialog";
import { NodeColors } from "../../utils/constants";

function InterfaceNode({ data, id }) {
  const [open, setOpen] = useState(false);

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
          backgroundColor: NodeColors.INTERFACE.background,
          border: `2px solid ${NodeColors.INTERFACE.border}`,
        }}
      >
        <Typography
          variant="caption"
          style={{ display: "block", textAlign: "center" }}
        >
          &lt;&lt;interface&gt;&gt;
        </Typography>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="subtitle1" style={{ fontWeight: "bold" }}>
            {data.className || "Interface Name"}
          </Typography>
          <IconButton size="small" onClick={() => setOpen(true)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </div>

        <Divider style={{ margin: "8px 0" }} />

        {/* Methods */}
        <div>
          {data.methods?.map((method, index) => (
            <Typography
              key={index}
              variant="body2"
              style={{ fontStyle: "italic" }}
            >
              + {method.name}(
              {method.parameters.map((p) => `${p.name}: ${p.type}`).join(", ")}
              ): {method.returnType}
            </Typography>
          ))}
        </div>
      </Paper>
      <Handle type="source" position={Position.Bottom} />

      <InterfaceDialog
        open={open}
        onClose={() => setOpen(false)}
        data={data}
        onUpdate={handleUpdate}
      />
    </>
  );
}

export default InterfaceNode;
