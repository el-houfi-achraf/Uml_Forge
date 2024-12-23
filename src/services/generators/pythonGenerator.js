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
  
  // Constructor
  code += `    def __init__(self`;
  const params = [];
  
  // Add class attributes
  attributes?.forEach(attr => {
    params.push(`${attr.name}`);
  });
  
  // Add parent class attributes
  if (parentClass?.data.attributes) {
    parentClass.data.attributes.forEach(attr => {
      if (!attr.isStatic) {
        params.push(`${attr.name}`);
      }
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

    if (targetNode && shouldGenerate) {
      const fieldName = targetNode.data.className.toLowerCase();
      if (multiplicity === "1") {
        params.push(`${fieldName}`);
      } else if (multiplicity === "1..*") {
        params.push(`initial_${fieldName}`);
      }
    }
  });

  code += params.length > 0 ? `, ${params.join(", ")}` : "";
  code += `):\n`;

  // Call parent constructor if exists
  if (parentClass) {
    const parentParams = parentClass.data.attributes
      ?.filter(attr => !attr.isStatic)
      ?.map(attr => attr.name)
      .join(", ");
    code += `        super().__init__(${parentParams || ""})\n`;
  }

  // Initialize attributes
  attributes?.forEach(attr => {
    if (!attr.isStatic) {
      code += `        self._${attr.name} = ${attr.name}\n`;
    }
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
      if (isComposition(association)&& (multiplicity === "0..1" || multiplicity === "1..1")) {
        code += `        self._${fieldName} = ${targetNode.data.className}()\n`;
      }else if (multiplicity === "0..*" || multiplicity === "1..*" || multiplicity === "*") {
        code += `        self._${fieldName}s = []\n`;
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
                return 'False';
              default:
                return 'None';
            }
          })
          .join(', ');
        
        code += `        self._${fieldName} = ${targetNode.data.className}(${attributeParams})\n`;
      } else if (multiplicity === "0..*" || multiplicity === "*") {
        //code += `        self._${fieldName}s = []\n`;
      } else if (multiplicity === "1..*") {
        //code += `        self._${fieldName}s = []\n`;
        code += `        self.add_${fieldName}(initial_${fieldName})\n`;
      } else if (multiplicity === "1") {
        code += `        self._${fieldName} = ${fieldName}\n`;
      }
    }
  });

  code += "\n";
  return code;
};

const handleGettersAndSetters = (attributes, associations, nodes, nodeId) => {
  let code = "";

  // Getters and setters for attributes
  attributes?.forEach((attr) => {
    // Getter
    code += `    def get_${attr.name}(self):\n`;
    code += `        return self._${attr.name}\n\n`;

    if (!attr.isFinal) {
      // Setter
      code += `    def set_${attr.name}(self, value):\n`;
      code += `        self._${attr.name} = value\n\n`;
    }
  });

  // Getters and setters for associations
  associations.forEach((association) => {
    const isSource = association.source === nodeId;
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
      const fieldName = targetNode.data.className;
      const fieldNameLower = fieldName.toLowerCase();

      if (multiplicity === "0..*" || multiplicity === "1..*" || multiplicity === "*") {
        // Getter for collection
        code += `    def get_${fieldNameLower}s(self):\n`;
        code += `        return list(self._${fieldNameLower}s)\n\n`;

        // Add method
        code += `    def add_${fieldNameLower}(self, ${fieldNameLower}):\n`;
        code += `        if ${fieldNameLower} is None:\n`;
        code += `            raise ValueError("${fieldName} cannot be None")\n`;
        code += `        self._${fieldNameLower}s.append(${fieldNameLower})\n\n`;

        // Remove method
        code += `    def remove_${fieldNameLower}(self, ${fieldNameLower}):\n`;
        code += `        if ${fieldNameLower} in self._${fieldNameLower}s:\n`;
        code += `            self._${fieldNameLower}s.remove(${fieldNameLower})\n\n`;
      } else {
        // Getter for single object
        code += `    def get_${fieldNameLower}(self):\n`;
        code += `        return self._${fieldNameLower}\n\n`;

        // Setter for single object
        code += `    def set_${fieldNameLower}(self, value):\n`;
        if (multiplicity === "1") {
          code += `        if value is None:\n`;
          code += `            raise ValueError("${fieldName} cannot be None")\n`;
        }
        code += `        self._${fieldNameLower} = value\n\n`;
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

export const generatePythonCode = (nodes, edges) => {
  let code = "";

  // Add imports at the top
  code += "from abc import ABC, abstractmethod\n\n";

  nodes.forEach((node) => {
    const data = node.data;
    const parentClass = findParentClass(node.id, nodes, edges);
    const classAssociations = edges.filter(
      (edge) =>
        (edge.data?.type === "ASSOCIATION" &&
          ((edge.source === node.id && edge.data?.sourceToTarget) ||
            (edge.target === node.id && edge.data?.targetToSource))) ||
        (edge.data?.type === "AGGREGATION" && edge.target === node.id) ||
        (edge.data?.type === "COMPOSITION" && edge.target === node.id)
    );

    if (node.type === "interfaceNode") {
      code += `# Class \n`;
      code += `class ${data.className}(ABC):\n`;
      data.methods?.forEach((method) => {
        const params = method.parameters
          ?.map((p) => `${p.name}`)
          .join(", ");
        code += `    @abstractmethod\n`;
        code += `    def ${method.name}(self${params ? ", " + params : ""}):\n`;
        code += `        pass\n\n`;
      });
    } else if (node.type === "enumNode") {
      code += `# Class \n`;
      code += `from enum import Enum, auto\n\n`;
      code += `class ${data.className}(Enum):\n`;
      (data.values || []).forEach((value) => {
        code += `    ${value} = auto()\n`;
      });
    } else {
      // Regular class or abstract class
      const isAbstract = node.type === "abstractClassNode";
      const baseClasses = [];

      if (parentClass) {
        baseClasses.push(parentClass.data.className);
      } else if (isAbstract) {
        baseClasses.push("ABC");
      }

      // Add implemented interfaces
      const implementedInterfaces = edges
        .filter(
          (edge) => edge.data?.type === "REALIZATION" && edge.source === node.id
        )
        .map((edge) => nodes.find((n) => n.id === edge.target))
        .filter(Boolean)
        .map((iface) => iface.data.className);

      baseClasses.push(...implementedInterfaces);

      const inheritance =
        baseClasses.length > 0 ? `(${baseClasses.join(", ")})` : "";

      code += `# Class \n`;
      code += `class ${data.className}${inheritance}:\n`;

      // Déclarer uniquement les attributs statiques
      data.attributes?.forEach((attr) => {
        if (attr.isStatic) {
          code += `    ${attr.name}: ${attr.type} = None  # Static attribute\n`;
        }
      });

      if (data.attributes?.some(attr => attr.isStatic)) {
        code += "\n";
      }

      // Add constructor
      code += handleConstructor(data.className, parentClass, classAssociations, nodes, data.attributes);

      // Add getters and setters
      code += handleGettersAndSetters(data.attributes, classAssociations, nodes, node.id);

      // Add methods
      const interfaceMethods = getInterfaceMethods(node, nodes, edges);
      const allMethods = [...(data.methods || []), ...interfaceMethods];
      const allMethodeOverrideAbstract = [...getParentAbstractMethods(parentClass)];
      allMethods.forEach((method) => {
        const params = method.parameters
          ?.map((p) => `${p.name}`)
          .join(", ");
        if (method.isAbstract) {
          code += `    @abstractmethod\n`;
          code += `    def ${method.name}(self${params ? ", " + params : ""}):\n`;
          code += `        pass\n\n`;
        } else if (method.isStatic) {
          code += `    @staticmethod\n`;
          code += `    def ${method.name}(${params}):\n`;
          code += `        # TODO: Implement static method\n`;
          code += `        pass\n\n`;
        } else {
          code += `    def ${method.name}(self${params ? ", " + params : ""}):\n`;
          if (method.fromInterface) {
            code += `        # TODO: Implement method from ${method.fromInterface} interface\n`;
            code += `        raise NotImplementedError("Method from ${method.fromInterface} must be implemented")\n\n`;
          } else if (method.fromParent) {
            code += `        # TODO: Implement abstract method from parent class ${method.fromParent}\n`;
            code += `        raise NotImplementedError("Abstract method ${method.name} from parent class ${method.fromParent} must be implemented")\n\n`;
          } else {
            code += `        # TODO: Implement method\n`;
            code += `        pass\n\n`;
          }
        }
      });
      allMethodeOverrideAbstract.forEach((method) => {
        const params = method.parameters
          ?.map((p) => `${p.name}`)
          .join(", ");
      
          code += `    def ${method.name}(self${params ? ", " + params : ""}):\n`;
            code += `        # TODO: Implement method \n`;
            code += `        raise NotImplementedError("Method must be implemented")\n\n`;
          
        
      });

    }
   

    code += "\n";
  });

  return code;
};