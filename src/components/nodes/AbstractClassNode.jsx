import React from "react";
import ClassNode from "./ClassNode";
import Typography from "@mui/material/Typography";

function AbstractClassNode(props) {
  return (
    <div style={{ fontStyle: "italic" }}>
      <Typography variant="caption" style={{ position: "absolute", top: -20 }}>
        &lt;&lt;abstract&gt;&gt;
      </Typography>
      <ClassNode {...props} />
    </div>
  );
}

export default AbstractClassNode;
