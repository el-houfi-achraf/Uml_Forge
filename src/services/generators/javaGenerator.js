const isComposition = (edge) => {
  return edge.data?.type === "COMPOSITION";
};

const findParentClass = (nodeId, nodes, edges) => {
  const inheritance = edges.find(
    (edge) => edge.data?.type === "INHERITANCE" && edge.source === nodeId
  );
  if (inheritance) {
    return nodes.find((node) => node.id === inheritance.target);
  }
  return null;
};

const getCollectionType = (multiplicity) => {
  switch (multiplicity) {
    case "0..*":
    case "1..*":
    case "*":
      return "List";
    case "0..1":
      return "Optional";
    default:
      return null;
  }
};

const handleConstructor = (className, parentClass, classAssociations, nodes, attributes) => {
  let code = "";
  
  // Default constructor
  code += `    public ${className}() {\n`;
  if (parentClass) {
    code += `        super();\n`;
  }
  
  // Initialize collections in associations
  classAssociations.forEach((association) => {
    const isSource = association.source === nodes.find(n => n.data.className === className)?.id;
    const targetNode = nodes.find(
      (n) => n.id === (isSource ? association.target : association.source)
    );
    const multiplicity = isSource
      ? association.data.multiplicityTarget
      : association.data.multiplicitySource;

    const shouldGenerate = (isSource && association.data.sourceToTarget) || 
                         (!isSource && association.data.targetToSource) ||
                         (association.data?.type === "AGGREGATION" && !isSource);

    if (targetNode && shouldGenerate) {
      const fieldName = targetNode.data.className.toLowerCase();
      if (multiplicity === "0..*" || multiplicity === "1..*" || multiplicity === "*") {
        code += `        this.${fieldName}s = new ArrayList<>();\n`;
      }
    }
  });
  code += "    }\n\n";

  // Parameterized constructor
  const params = [];
  
  // Add class attributes
  attributes?.forEach(attr => {
    params.push(`${attr.type} ${attr.name}`);
  });
    
  // Add parent class attributes
  if (parentClass?.data.attributes) {
    parentClass.data.attributes.forEach(attr => {
      params.push(`${attr.type} ${attr.name}`);
    });
  }

  // Add required associations
  classAssociations.forEach(association => {
    const isSource = association.source === nodes.find(n => n.data.className === className)?.id;
    const targetNode = nodes.find(
      (n) => n.id === (isSource ? association.target : association.source)
    );
    const multiplicity = isSource
      ? association.data.multiplicityTarget
      : association.data.multiplicitySource;

    const shouldGenerate = (isSource && association.data.sourceToTarget) || 
                         (!isSource && association.data.targetToSource) ||
                         (association.data?.type === "AGGREGATION" && !isSource);

    if (targetNode && shouldGenerate && !isComposition(association)) {
      const fieldName = targetNode.data.className.toLowerCase();
      if (multiplicity === "1") {
        params.push(`${targetNode.data.className} ${fieldName}`);
      } else if (multiplicity === "1..*") {
        params.push(`${targetNode.data.className} initial${targetNode.data.className}`);
      }
    }
  });

  if (params.length > 0) {
    code += `    public ${className}(${params.join(", ")}) {\n`;
    
    // Call super constructor if needed
    if (parentClass?.data.attributes) {
      const parentParams = parentClass.data.attributes
        .map(attr => attr.name)
        .join(", ");
      code += `        super(${parentParams});\n`;
    }

    // Initialize own attributes
    attributes?.forEach(attr => {
      code += `        this.${attr.name} = ${attr.name};\n`;
    });

    // Initialize collections and required associations
    classAssociations.forEach(association => {
      const isSource = association.source === nodes.find(n => n.data.className === className)?.id;
      const targetNode = nodes.find(
        (n) => n.id === (isSource ? association.target : association.source)
      );
      const multiplicity = isSource
        ? association.data.multiplicityTarget
        : association.data.multiplicitySource;

      const shouldGenerate = (isSource && association.data.sourceToTarget) || 
                           (!isSource && association.data.targetToSource) ||
                           ((association.data?.type === "AGGREGATION" || 
                             association.data?.type === "COMPOSITION") && !isSource);

      if (targetNode && shouldGenerate) {
        const fieldName = targetNode.data.className.toLowerCase();
        if (isComposition(association)) {
          code += `        this.${fieldName} = new ${targetNode.data.className}();\n`;
        } else if (multiplicity === "0..*" || multiplicity === "*") {
          code += `        this.${fieldName}s = new ArrayList<>();\n`;
        } else if (multiplicity === "1..*") {
          code += `        this.${fieldName}s = new ArrayList<>();\n`;
          code += `        this.add${targetNode.data.className}(initial${targetNode.data.className});\n`;
        } else if (multiplicity === "1") {
          code += `        this.${fieldName} = ${fieldName};\n`;
        }
      }
    });

    code += "    }\n\n";
  }

  return code;
};

const handleGettersAndSetters = (attributes, associations, nodes, currentNodeId) => {
  let code = "";

  // Generate getters and setters for regular attributes
  attributes?.forEach((attr) => {
    const capitalizedName = attr.name.charAt(0).toUpperCase() + attr.name.slice(1);
    
    // Getter
    code += `    public ${attr.type} get${capitalizedName}() {\n`;
    code += `        return ${attr.name};\n`;
    code += "    }\n\n";

    // Setter (only if not final)
    if (!attr.isFinal) {
      code += `    public void set${capitalizedName}(${attr.type} ${attr.name}) {\n`;
      code += `        this.${attr.name} = ${attr.name};\n`;
      code += "    }\n\n";
    }
  });

  // Generate getters and setters for associations
  associations.forEach((association) => {
    const isSource = association.source === currentNodeId;
    const targetNode = nodes.find(
      (n) => n.id === (isSource ? association.target : association.source)
    );
    const multiplicity = isSource
      ? association.data.multiplicityTarget
      : association.data.multiplicitySource;

    // Vérifier si l'association doit être générée pour cette direction
    const shouldGenerate = (isSource && association.data.sourceToTarget) || 
                         (!isSource && association.data.targetToSource) ||
                         ((association.data?.type === "AGGREGATION" || 
                           association.data?.type === "COMPOSITION") && !isSource);

    if (targetNode && shouldGenerate) {
      const fieldName = targetNode.data.className;
      const fieldNameLower = fieldName.toLowerCase();

      if (multiplicity === "0..*" || multiplicity === "1..*" || multiplicity === "*") {
        // Getter for collection
        code += `    public List<${fieldName}> get${fieldName}s() {\n`;
        code += `        return new ArrayList<>(${fieldNameLower}s);\n`;
        code += "    }\n\n";

        // Add method
        code += `    public void add${fieldName}(${fieldName} ${fieldNameLower}) {\n`;
        code += `        if (${fieldNameLower} == null) {\n`;
        code += `            throw new IllegalArgumentException("${fieldName} cannot be null");\n`;
        code += "        }\n";
        code += `        this.${fieldNameLower}s.add(${fieldNameLower});\n`;
        code += "    }\n\n";

        // Remove method
        code += `    public void remove${fieldName}(${fieldName} ${fieldNameLower}) {\n`;
        code += `        this.${fieldNameLower}s.remove(${fieldNameLower});\n`;
        code += "    }\n\n";
      } else {
        // Getter for single object
        code += `    public ${fieldName} get${fieldName}() {\n`;
        code += `        return ${fieldNameLower};\n`;
        code += "    }\n\n";

        // Setter for single object
        code += `    public void set${fieldName}(${fieldName} ${fieldNameLower}) {\n`;
        if (multiplicity === "1") {
          code += `        if (${fieldNameLower} == null) {\n`;
          code += `            throw new IllegalArgumentException("${fieldName} cannot be null");\n`;
          code += "        }\n";
        }
        code += `        this.${fieldNameLower} = ${fieldNameLower};\n`;
        code += "    }\n\n";
      }
    }
  });

  return code;
};

const getInterfaceMethods = (node, nodes, edges) => {
  const implementedInterfaces = edges
    .filter(edge => edge.data?.type === "REALIZATION" && edge.source === node.id)
    .map(edge => nodes.find(n => n.id === edge.target))
    .filter(Boolean);

  const interfaceMethods = [];
  implementedInterfaces.forEach(iface => {
    iface.data.methods?.forEach(method => {
      interfaceMethods.push({
        ...method,
        fromInterface: iface.data.className
      });
    });
  });
  
  return interfaceMethods;
};

const getParentAbstractMethods = (parentClass) => {
  if (!parentClass) return [];
  return (parentClass.data.methods || [])
    .filter(method => method.isAbstract)
    .map(method => ({
      ...method,
      fromParent: parentClass.data.className
    }));
};

export const generateJavaCode = (nodes, edges) => {
  let code = "";

  // Add imports at the top
  code += "import java.util.List;\n";
  code += "import java.util.ArrayList;\n";
  code += "import java.util.Objects;\n\n";

  nodes.forEach((node) => {
    const data = node.data;
    const parentClass = findParentClass(node.id, nodes, edges);

    if (node.type === "interfaceNode") {
      code += `/* Class */\n`;
      code += `public interface ${data.className} {\n`;
      data.methods?.forEach((method) => {
        const params = method.parameters
          ?.map((p) => `${p.type} ${p.name}`)
          .join(", ");
        code += `    ${method.returnType} ${method.name}(${params});\n`;
      });
      code += "}\n\n";
    } else if (node.type === "enumNode") {
      code += `/* Class */\n`;
      code += `public enum ${data.className} {\n`;
      code += `    ${(data.values || []).join(", ")}\n`;
      code += "}\n\n";
    } else {
      code += `/* Class */\n`;
      const isAbstract = node.type === "abstractClassNode" ? "abstract " : "";

      // Find implemented interfaces
      const implementedInterfaces = edges
        .filter(
          (edge) => edge.data?.type === "REALIZATION" && edge.source === node.id
        )
        .map((edge) => nodes.find((n) => n.id === edge.target))
        .filter(Boolean);

      let classDeclaration = `public ${isAbstract}class ${data.className}`;

      if (parentClass) {
        classDeclaration += ` extends ${parentClass.data.className}`;
      }

      if (implementedInterfaces.length > 0) {
        classDeclaration += ` implements ${implementedInterfaces
          .map((iface) => iface.data.className)
          .join(", ")}`;
      }

      code += `${classDeclaration} {\n\n`;

      // Add regular attributes
      data.attributes?.forEach((attr) => {
        const visibility = attr.visibility || "private";
        const isStatic = attr.isStatic ? "static " : "";
        const isFinal = attr.isFinal ? "final " : "";
        code += `    ${visibility} ${isStatic}${isFinal}${attr.type} ${attr.name};\n`;
      });

      // Add association fields
      const classAssociations = edges.filter(
        (edge) =>
          (edge.data?.type === "ASSOCIATION" &&
            ((edge.source === node.id && edge.data?.sourceToTarget) ||
              (edge.target === node.id && edge.data?.targetToSource))) ||
          (edge.data?.type === "AGGREGATION" && edge.target === node.id) ||
          (edge.data?.type === "COMPOSITION" && edge.target === node.id)
      );

      classAssociations.forEach((association) => {
        const isSource = association.source === node.id;
        const targetNode = nodes.find(
          (n) => n.id === (isSource ? association.target : association.source)
        );
        const multiplicity = isSource
          ? association.data.multiplicityTarget
          : association.data.multiplicitySource;

        // Vérifier si l'association doit être générée pour cette direction
        const shouldGenerate = (isSource && association.data.sourceToTarget) || 
                             (!isSource && association.data.targetToSource) ||
                             ((association.data?.type === "AGGREGATION" || 
                               association.data?.type === "COMPOSITION") && !isSource);

        if (targetNode && shouldGenerate) {
          const fieldName = targetNode.data.className.toLowerCase();
          if (
            multiplicity === "0..*" ||
            multiplicity === "1..*" ||
            multiplicity === "*"
          ) {
            code += `    private List<${targetNode.data.className}> ${fieldName}s;\n`;
          } else {
            code += `    private ${targetNode.data.className} ${fieldName};\n`;
          }
        }
      });

      code += "\n";

      // Generate constructors
      code += handleConstructor(data.className, parentClass, classAssociations, nodes, data.attributes);

      // Add getters and setters
      code += handleGettersAndSetters(data.attributes, classAssociations, nodes, node.id);

      // Add methods
      const interfaceMethods = getInterfaceMethods(node, nodes, edges);
      const allMethods = [
        ...(data.methods || []),
        ...interfaceMethods,
      ];
      const allMethodeOverrideAbstract = [...getParentAbstractMethods(parentClass)];

      allMethods.forEach((method) => {
        const visibility = method.visibility || "public";
        const isStatic = method.isStatic ? "static " : "";
        const isAbstract = method.isAbstract ? "abstract " : "";
        const params = method.parameters
          ?.map((p) => `${p.type} ${p.name}`)
          .join(", ");

        if (method.isAbstract) {
          code += `    ${visibility} ${isAbstract}${method.returnType} ${method.name}(${params});\n\n`;
        } else {
          code += `    @Override\n`.repeat(method.fromInterface ? 1 : 0);
          code += `    ${visibility} ${isStatic}${method.returnType} ${method.name}(${params}) {\n`;
          if (method.fromInterface) {
            code += `        // TODO: Implement method from ${method.fromInterface} \n`;
          } else {
            code += `        // TODO: Implement method\n`;
          }
          code += "    }\n\n";
        }
      });
      allMethodeOverrideAbstract.forEach((method) => {
        const params = method.parameters
          ?.map((p) => `${p.type} ${p.name}`)
          .join(", ");
          code += `    @Override\n`;
          code += `    public ${method.returnType} ${method.name}(${params}) {\n`;
          code += `        // TODO: Implement method\n`;
          code += "    }\n\n";
          
      });

      code += "}\n\n";
    }
  });

  return code;
};