import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#2B3A67", // Bleu profond
      light: "#5C6E9B",
      dark: "#1A2440",
    },
    secondary: {
      main: "#E84855", // Rouge vif
      light: "#FF6B77",
      dark: "#B33740",
    },
    background: {
      default: "#F5F7FA",
      paper: "#FFFFFF",
    },
    node: {
      class: "#BBDEFB",
      abstract: "#C8E6C9",
      interface: "#FFE0B2",
      enum: "#F8BBD0",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
  },
});
