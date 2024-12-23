import React from "react";
import { Box } from "@mui/material";
import Navbar from "./components/Navbar/Navbar";

function App() {
  return (
    <Box sx={{ height: "100vh" }}>
      <Navbar
        onSave={(diagramCode) => console.log("Saving diagram:", diagramCode)}
        onClearCanvas={() => console.log("Clearing canvas")}
        onOpenHistory={() => console.log("Opening history")}
      />
    </Box>
  );
}

export default App;
