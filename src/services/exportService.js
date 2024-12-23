import { toPng, toSvg } from "html-to-image";

export const exportService = {
  // Export en PNG
  exportToPng: async (reactFlowInstance) => {
    if (!reactFlowInstance) return null;

    const flowElement = document.querySelector(".react-flow");
    if (!flowElement) return null;

    try {
      const dataUrl = await toPng(flowElement, {
        backgroundColor: "#ffffff",
        quality: 1,
      });
      return dataUrl;
    } catch (error) {
      console.error("Error exporting to PNG:", error);
      throw error;
    }
  },

  // Export en SVG
  exportToSvg: async (reactFlowInstance) => {
    if (!reactFlowInstance) return null;

    const flowElement = document.querySelector(".react-flow");
    if (!flowElement) return null;

    try {
      const dataUrl = await toSvg(flowElement, {
        backgroundColor: "#ffffff",
      });
      return dataUrl;
    } catch (error) {
      console.error("Error exporting to SVG:", error);
      throw error;
    }
  },

  // Export en XMI
  exportToXMI: (nodes, edges) => {
    const xmi = `<?xml version="1.0" encoding="UTF-8"?>
<xmi:XMI xmlns:xmi="http://www.omg.org/spec/XMI/20131001" xmlns:uml="http://www.omg.org/spec/UML/20131001">
  <uml:Model>
    ${nodes
      .map(
        (node) => `
      <packagedElement xmi:type="${node.type.replace("Node", "")}" name="${
          node.data.className
        }">
        ${node.data.attributes
          ?.map(
            (attr) => `
          <ownedAttribute name="${attr.name}" type="${attr.type}" visibility="${attr.visibility}"/>
        `
          )
          .join("")}
        ${node.data.methods
          ?.map(
            (method) => `
          <ownedOperation name="${method.name}" visibility="${
              method.visibility
            }">
            ${method.parameters
              ?.map(
                (param) => `
              <ownedParameter name="${param.name}" type="${param.type}"/>
            `
              )
              .join("")}
          </ownedOperation>
        `
          )
          .join("")}
      </packagedElement>
    `
      )
      .join("")}
    ${edges
      .map(
        (edge) => `
      <packagedElement xmi:type="uml:${edge.data.type}" source="${edge.source}" target="${edge.target}"/>
    `
      )
      .join("")}
  </uml:Model>
</xmi:XMI>`;

    return xmi;
  },
};
