import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyB9eYP8NDYBJrN-IKNzUameVs-QFKMZWQ4";
const genAI = new GoogleGenerativeAI(API_KEY.trim());

export const geminiService = {
  generateCode: async (diagramData, language) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Generate ${language} code for the following UML class diagram:
        Classes: ${JSON.stringify(diagramData.nodes, null, 2)}
        Relationships: ${JSON.stringify(diagramData.edges, null, 2)}
        Please provide complete, well-structured ${language} code that implements all classes, 
        their attributes, methods, relationships,constructors,getters, and setters`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return {
        code: response.text(),
        filename: `generated_code.${language.toLowerCase()}`,
      };
    } catch (error) {
      throw new Error(`Code Generation Error: ${error.message}`);
    }
  },
};
