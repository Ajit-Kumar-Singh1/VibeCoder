import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Message, GeneratedProject } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are Vibe Coder, an elite frontend engineering AI assistant. 
Your goal is to generate React applications.

You must output a JSON object containing:
1. "projectName": A short, creative name for the project.
2. "preview": A SINGLE-FILE, self-contained HTML version of the app using React, ReactDOM, Babel (standalone), and Tailwind CSS CDN links. This file MUST be runnable immediately in an iframe.
3. "files": An array of file objects representing a modern React project structure (e.g., using 'import' syntax, separated into components).

Preview Rules (for the 'preview' field):
- Use <!DOCTYPE html>.
- Use <script type="text/babel"> for the React code.
- Combine all components into this single file so it works standalone.
- Use Tailwind CSS for styling.

Project Structure Rules (for the 'files' field):
- Assume a standard Vite/React setup.
- Include 'package.json', 'index.html', 'src/main.jsx', 'src/App.jsx', etc.
- Separate components into their own files (e.g., 'src/components/Header.jsx').
- Use ES modules (import/export).
- CRITICAL: The 'content' of each file MUST be formatted with standard indentation (2 or 4 spaces) and newlines (\\n). The code must be human-readable, NOT minified or single-line.

If the user asks for a modification, you must regenerate the ENTIRE JSON object with the changes applied to both the preview and the file list.
`;

export const generateResponse = async (
  history: Message[],
  prompt: string,
  imageData?: string
): Promise<{ text: string; project?: GeneratedProject }> => {
  try {
    const model = "gemini-2.5-flash";

    const contents = [
      {
        role: "user",
        parts: [
          ...(imageData
            ? [
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: imageData,
                  },
                },
              ]
            : []),
          { text: prompt },
        ],
      },
    ];

    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            projectName: { type: Type.STRING },
            preview: { type: Type.STRING },
            explanation: { type: Type.STRING, description: "A brief conversational response explaining what was built." },
            files: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  path: { type: Type.STRING },
                  content: { type: Type.STRING },
                },
                required: ["path", "content"],
              },
            },
          },
          required: ["projectName", "preview", "files", "explanation"],
        },
      },
    });

    const jsonText = response.text || "{}";
    let parsed: any;
    try {
        parsed = JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse JSON", e);
        // Fallback or re-throw
        throw new Error("Invalid JSON response from model");
    }

    const project: GeneratedProject = {
        projectName: parsed.projectName || "Untitled Project",
        preview: parsed.preview,
        files: parsed.files || []
    };

    return { text: parsed.explanation || "Here is your project.", project };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate response from Vibe Coder.");
  }
};