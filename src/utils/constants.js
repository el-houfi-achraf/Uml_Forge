export const ClassType = {
  CLASS: "CLASS",
  ABSTRACT: "ABSTRACT",
  INTERFACE: "INTERFACE",
  ENUM: "ENUM",
};

export const RelationshipType = {
  ASSOCIATION: "ASSOCIATION",
  AGGREGATION: "AGGREGATION",
  COMPOSITION: "COMPOSITION",
  INHERITANCE: "INHERITANCE",
  REALIZATION: "REALIZATION",
};

export const Visibility = {
  PUBLIC: "public",
  PRIVATE: "private",
  PROTECTED: "protected",
  PACKAGE: "package",
};

export const NodeColors = {
  CLASS: {
    background: "#BBDEFB", // Bleu clair
    border: "#1976D2", // Bleu
  },
  ABSTRACT_CLASS: {
    background: "#C8E6C9", // Vert clair
    border: "#388E3C", // Vert
  },
  INTERFACE: {
    background: "#FFE0B2", // Orange clair
    border: "#F57C00", // Orange
  },
  ENUM: {
    background: "#F8BBD0", // Rose clair
    border: "#C2185B", // Rose
  },
};

export const EdgeColors = {
  INHERITANCE: "#2B3A67",
  REALIZATION: "#6B7280",
  AGGREGATION: "#3F51B5",
  COMPOSITION: "#3F51B5",
  ASSOCIATION: "#666666",
};
