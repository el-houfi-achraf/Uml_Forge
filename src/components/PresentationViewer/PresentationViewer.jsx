import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  DialogTitle,
  DialogActions,
  Button,
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import CloseIcon from "@mui/icons-material/Close";

const slides = [
  "/slides/slide1.png",
  "/slides/slide2.png",
  "/slides/slide3.png",
  "/slides/slide4.png",
  "/slides/slide5.png",
  "/slides/slide6.png",
  "/slides/slide7.png",
  "/slides/slide8.png",
  "/slides/slide9.png",
];

const PresentationViewer = ({ open, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!open) return;

      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          if (currentSlide < slides.length - 1) {
            handleNext();
          }
          break;
        case "ArrowLeft":
        case "ArrowUp":
          if (currentSlide > 0) {
            handlePrevious();
          }
          break;
        case "Escape":
          onClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, currentSlide, onClose]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          Présentation de l'application
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          position="relative"
        >
          <IconButton
            onClick={handlePrevious}
            sx={{ position: "absolute", left: 0 }}
          >
            <NavigateBeforeIcon />
          </IconButton>

          <Box
            component="img"
            src={slides[currentSlide]}
            alt={`Slide ${currentSlide + 1}`}
            sx={{
              maxWidth: "100%",
              height: "auto",
              maxHeight: "70vh",
              objectFit: "contain",
            }}
          />

          <IconButton
            onClick={handleNext}
            sx={{ position: "absolute", right: 0 }}
          >
            <NavigateNextIcon />
          </IconButton>
        </Box>
      </DialogContent>

      <DialogActions>
        <Box width="100%" display="flex" justifyContent="space-between" px={2}>
          <Button onClick={handlePrevious} disabled={currentSlide === 0}>
            Précédent
          </Button>
          <Box>
            Slide {currentSlide + 1} / {slides.length}
          </Box>
          <Button
            onClick={handleNext}
            disabled={currentSlide === slides.length - 1}
          >
            Suivant
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default PresentationViewer;
