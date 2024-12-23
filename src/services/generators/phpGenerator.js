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

const handleConstructor = (className, parentClass, classAssociations, nodes, attributes) => {
  let code = "";
  
  // Constructor parameters
  const params = [];
  
  // Add class attributes
  attributes?.forEach(attr => {
    params.push(`$${attr.name}`);
  });
  
  // Add parent class attributes
  if (parentClass?.data.attributes) {
    parentClass.data.attributes.forEach(attr => {
      params.push(`$${attr.name}`);
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
                         (!isSource && association.data.targetToSource)|| (association.data?.type === "AGGREGATION" && !isSource);

    if (targetNode && shouldGenerate) {
      const fieldName = targetNode.data.className.toLowerCase();
      if (multiplicity === "1") {
        params.push(`$${fieldName}`);
      } else if (multiplicity === "1..*") {
        params.push(`$initial${targetNode.data.className}`);
      }
    }
  });

  // Constructor
  code += `    public function __construct(${params.join(", ")})\n    {\n`;

  // Call parent constructor if exists
  if (parentClass) {
    const parentParams = parentClass.data.attributes
      ?.map(attr => `$${attr.name}`)
      .join(", ");
    code += `        parent::__construct(${parentParams || ""});\n`;
  }

  // Initialize attributes
  attributes?.forEach(attr => {
    code += `        $this->${attr.name} = $${attr.name};\n`;
  });

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
                         ((association.data?.type === "AGGREGATION" || 
                            association.data?.type === "COMPOSITION") && !isSource);

    if (targetNode && shouldGenerate) {
      const fieldName = targetNode.data.className.toLowerCase();
      if (isComposition(association) && (multiplicity === "0..1" || multiplicity === "1..1")) {
        code += `         $this->${fieldName} = new ${targetNode.data.className}()\n`;
      }else if (multiplicity === "0..*" || multiplicity === "*") {
        code += `        $this->${fieldName}s = array();\n`;
      }
    }
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
                         (association.data?.type === "AGGREGATION" && !isSource);

    if (targetNode && shouldGenerate) {
      const fieldName = targetNode.data.className.toLowerCase();
      if (isComposition(association)) {
        // Récupérer les attributs de la classe composée
        const composedClassAttributes = targetNode.data.attributes || [];
        const attributeParams = composedClassAttributes
          .map(attr => {
            // Pour chaque attribut, on peut mettre une valeur par défaut selon le type
            switch(attr.type.toLowerCase()) {
              case 'string':
                return `""`;
              case 'int':
              case 'integer':
                return '0';
              case 'float':
              case 'double':
                return '0.0';
              case 'boolean':
                return 'false';
              default:
                return 'null';
            }
          })
          .join(', ');
        
        code += `        $this->${fieldName} = new ${targetNode.data.className}(${attributeParams});\n`;
      } else if (multiplicity === "0..*" || multiplicity === "*") {
        code += `        $this->${fieldName}s = array();\n`;
      } else if (multiplicity === "1..*") {
        code += `        $this->${fieldName}s = array();\n`;
        code += `        $this->add${targetNode.data.className}($initial${targetNode.data.className});\n`;
      } else if (multiplicity === "1") {
        code += `        $this->${fieldName} = $${fieldName};\n`;
      }
    }
  });

  code += "    }\n\n";
  return code;
};

const handleGettersAndSetters = (attributes, associations, nodes, currentNodeId) => {
  let code = "";

  // Generate getters and setters for regular attributes
  attributes?.forEach((attr) => {
    const capitalizedName = attr.name.charAt(0).toUpperCase() + attr.name.slice(1);
    
    // Getter
    code += `    public function get${capitalizedName}()\n`;
    code += `    {\n`;
    code += `        return $this->${attr.name};\n`;
    code += "    }\n\n";

    // Setter (only if not final)
    if (!attr.isFinal) {
      code += `    public function set${capitalizedName}($${attr.name})\n`;
      code += `    {\n`;
      code += `        $this->${attr.name} = $${attr.name};\n`;
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
                           (!isSource && association.data.targetToSource);

    if (targetNode && shouldGenerate) {
      const fieldName = targetNode.data.className;
      const fieldNameLower = fieldName.toLowerCase();

      if (multiplicity === "0..*" || multiplicity === "1..*" || multiplicity === "*") {
        // Getter for collection
        code += `    public function get${fieldName}s()\n`;
        code += `    {\n`;
        code += `        return $this->${fieldNameLower}s;\n`;
        code += "    }\n\n";

        // Add method
        code += `    public function add${fieldName}($${fieldNameLower})\n`;
        code += `    {\n`;
        code += `        if ($${fieldNameLower} === null) {\n`;
        code += `            throw new \\InvalidArgumentException("${fieldName} cannot be null");\n`;
        code += "        }\n";
        code += `        $this->${fieldNameLower}s[] = $${fieldNameLower};\n`;
        code += "    }\n\n";

        // Remove method
        code += `    public function remove${fieldName}($${fieldNameLower})\n`;
        code += `    {\n`;
        code += `        $key = array_search($${fieldNameLower}, $this->${fieldNameLower}s, true);\n`;
        code += `        if ($key !== false) {\n`;
        code += `            unset($this->${fieldNameLower}s[$key]);\n`;
        code += "        }\n";
        code += "    }\n\n";
      } else {
        // Getter for single object
        code += `    public function get${fieldName}()\n`;
        code += `    {\n`;
        code += `        return $this->${fieldNameLower};\n`;
        code += "    }\n\n";

        // Setter for single object
        code += `    public function set${fieldName}($${fieldNameLower})\n`;
        code += `    {\n`;
        if (multiplicity === "1") {
          code += `        if ($${fieldNameLower} === null) {\n`;
          code += `            throw new \\InvalidArgumentException("${fieldName} cannot be null");\n`;
          code += "        }\n";
        }
        code += `        $this->${fieldNameLower} = $${fieldNameLower};\n`;
        code += "    }\n\n";
      }
    }
  });

  return code;
};

// Ajout de la fonction getInterfaceMethods
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

// Ajoutons une fonction pour récupérer les méthodes abstraites de la classe parente
const getParentAbstractMethods = (parentClass) => {
  if (!parentClass) return [];
  return (parentClass.data.methods || [])
    .filter(method => method.isAbstract)
    .map(method => ({
      ...method,
      fromParent: parentClass.data.className
    }));
};

export const generatePhpCode = (nodes, edges) => {
  let code = "";

  nodes.forEach((node) => {
    const data = node.data;
    const parentClass = findParentClass(node.id, nodes, edges);

    // Trouver les associations pour cette classe
    const classAssociations = edges.filter(
      (edge) =>
        (edge.data?.type === "ASSOCIATION" &&
          ((edge.source === node.id && edge.data?.sourceToTarget) ||
            (edge.target === node.id && edge.data?.targetToSource))) ||
        (edge.data?.type === "AGGREGATION" && edge.target === node.id) ||
        (edge.data?.type === "COMPOSITION" && edge.target === node.id)
    );

    code += "<?php\n\n";

    if (node.type === "interfaceNode") {
      code += `/* Class */\n`;
      code += `interface ${data.className}\n{\n`;
      data.methods?.forEach((method) => {
        const params = method.parameters
          ?.map((p) => `$${p.name}`)
          .join(", ");
        code += `    public function ${method.name}(${params});\n`;
      });
      code += "}\n";
    } else if (node.type === "enumNode") {
      code += `/* Class */\n`;
      code += `enum ${data.className}\n{\n`;
      (data.values || []).forEach((value) => {
        code += `    case ${value};\n`;
      });
      code += "}\n";
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

      let classDeclaration = `${isAbstract}class ${data.className}`;

      if (parentClass) {
        classDeclaration += ` extends ${parentClass.data.className}`;
      }

      if (implementedInterfaces.length > 0) {
        classDeclaration += ` implements ${implementedInterfaces
          .map((iface) => iface.data.className)
          .join(", ")}`;
      }

      code += `${classDeclaration}\n{\n`;

      // Properties
      data.attributes?.forEach((attr) => {
        const visibility = attr.visibility || "private";
        code += `    ${visibility} $${attr.name};\n`;
      });

      // Add association properties
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
                               (association.data?.type === "AGGREGATION" && !isSource);

        if (targetNode && shouldGenerate) {
          const fieldName = targetNode.data.className.toLowerCase();
          if (multiplicity === "0..*" || multiplicity === "1..*" || multiplicity === "*") {
            code += `    private $${fieldName}s;\n`;
          } else {
            code += `    private $${fieldName};\n`;
          }
        }
      });

      code += "\n";

      // Generate constructors and getters/setters
      code += handleConstructor(data.className, parentClass, classAssociations, nodes, data.attributes);
      code += handleGettersAndSetters(data.attributes, classAssociations, nodes, node.id);

      // Methods
      const interfaceMethods = getInterfaceMethods(node, nodes, edges);

      // Add methods
      const allMethods = [...(data.methods || []), ...interfaceMethods];
      const allMethodeOverrideAbstract = [...getParentAbstractMethods(parentClass)];
      allMethodeOverrideAbstract.forEach((method) => {
        const params = method.parameters
          ?.map((p) => `$${p.name}`)
          .join(", ");
      
          code += `    public function ${method.name}(${params})\n    {\n`;
          code += `        // TODO: Implement abstract method  \n`;
          code += "    }\n\n";
      });


      allMethods.forEach((method) => {
        const params = method.parameters
          ?.map((p) => `$${p.name}`)
          .join(", ");
        if (method.isAbstract) {
          code += `    abstract public function ${method.name}(${params});\n\n`;
        } else if (method.isStatic) {
          code += `    public static function ${method.name}(${params})\n    { \n \t// TODO: Implement method\n     }\n\n`;
        } else {
          code += `    public function ${method.name}(${params})\n    {\n`;
          if (method.fromInterface) {
            code += `        // TODO: Implement method from ${method.fromInterface} interface\n`;
            code += `        throw new \\Exception("Method ${method.name} from ${method.fromInterface} interface must be implemented");\n`;
          } else if (method.fromParent) {
            code += `        // TODO: Implement abstract method from parent class ${method.fromParent}\n`;
            code += `        throw new \\Exception("Abstract method ${method.name} from parent class ${method.fromParent} must be implemented");\n`;
          } else {
            code += `        // TODO: Implement method\n`;
          }
          code += "    }\n\n";
        }
      });
      
      code += "}\n";
    }

    // Ajouter la fermeture de la balise PHP après chaque classe/interface/enum
    code += "\n?>\n\n";
  });

  return code;
};