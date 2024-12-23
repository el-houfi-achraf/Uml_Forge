import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Box,
} from "@mui/material";
import { RelationshipType } from "../../utils/constants";

function RelationshipDialog({ open, onClose, source, target, onSave }) {
  const [relationshipData, setRelationshipData] = useState({
    type: RelationshipType.ASSOCIATION,
    multiplicitySource: "1",
    multiplicityTarget: "1",
    sourceToTarget: true,
    targetToSource: false,
  });

  const multiplicityOptions = ["1", "0..1", "0..*", "1..*", "*"];

  const handleSave = () => {
    onSave(relationshipData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Relationship</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          {/* Type de relation */}
          <FormControl fullWidth>
            <InputLabel>Relationship Type</InputLabel>
            <Select
              value={relationshipData.type}
              onChange={(e) =>
                setRelationshipData((prev) => ({
                  ...prev,
                  type: e.target.value,
                }))
              }
              label="Relationship Type"
            >
              <MenuItem value={RelationshipType.ASSOCIATION}>
                Association
              </MenuItem>
              <MenuItem value={RelationshipType.AGGREGATION}>
                Aggregation
              </MenuItem>
              <MenuItem value={RelationshipType.COMPOSITION}>
                Composition
              </MenuItem>
              <MenuItem value={RelationshipType.INHERITANCE}>
                Inheritance
              </MenuItem>
              <MenuItem value={RelationshipType.REALIZATION}>
                Realization
              </MenuItem>
            </Select>
          </FormControl>

          {/* Multiplicité source */}
          <FormControl fullWidth>
            <InputLabel>Source Multiplicity</InputLabel>
            <Select
              value={relationshipData.multiplicitySource}
              onChange={(e) =>
                setRelationshipData((prev) => ({
                  ...prev,
                  multiplicitySource: e.target.value,
                }))
              }
              label="Source Multiplicity"
            >
              {multiplicityOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Multiplicité cible */}
          <FormControl fullWidth>
            <InputLabel>Target Multiplicity</InputLabel>
            <Select
              value={relationshipData.multiplicityTarget}
              onChange={(e) =>
                setRelationshipData((prev) => ({
                  ...prev,
                  multiplicityTarget: e.target.value,
                }))
              }
              label="Target Multiplicity"
            >
              {multiplicityOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Replace the navigable switch with two switches for navigation direction */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={relationshipData.sourceToTarget}
                  onChange={(e) =>
                    setRelationshipData((prev) => ({
                      ...prev,
                      sourceToTarget: e.target.checked,
                    }))
                  }
                />
              }
              label="Source → Target Navigation"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={relationshipData.targetToSource}
                  onChange={(e) =>
                    setRelationshipData((prev) => ({
                      ...prev,
                      targetToSource: e.target.checked,
                    }))
                  }
                />
              }
              label="Target → Source Navigation"
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          CANCEL
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          CREATE
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default RelationshipDialog;
