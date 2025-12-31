
import { GoogleGenAI, Type } from "@google/genai";
import { GameMode, Puzzle } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generatePuzzle = async (level: number, mode: GameMode): Promise<Puzzle> => {
  const modelName = 'gemini-3-flash-preview';
  
  const systemInstruction = `
    You are a cognitive neuroscientist and numerical puzzle expert. 
    Your goal is to create "brain-vibrating" numerical challenges that push the boundaries of short-term memory and IQ.
    
    Modes:
    1. SEQUENCE: Create a memorization challenge. High levels mean longer and more complex groupings.
    2. LOGIC: Create a number series with a complex pattern (e.g., Fibonacci-based, prime offsets, multi-step arithmetic).
    3. REVERSE: A sequence that must be recalled in reverse order.
    
    Difficulty: Level ${level}. Scale complexity exponentially.
    
    Output JSON format only.
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Generate a level ${level} ${mode} puzzle.`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: "The visual representation or instruction for the user." },
          answer: { type: Type.STRING, description: "The correct sequence or result." },
          sequence: { 
            type: Type.ARRAY, 
            items: { type: Type.NUMBER },
            description: "The numbers to display in the UI." 
          },
          explanation: { type: Type.STRING, description: "The logic behind the pattern." },
          hints: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Up to 2 hints." 
          }
        },
        required: ["question", "answer", "sequence", "explanation", "hints"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}') as Puzzle;
  } catch (e) {
    console.error("Failed to parse puzzle", e);
    // Fallback simple puzzle
    return {
      question: "Enter the next number: 1, 2, 3...",
      answer: "4",
      sequence: [1, 2, 3],
      explanation: "Simple increment.",
      hints: ["Count up"]
    };
  }
};
