import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "backend is reachable!" });
});

app.post("/api/echo", (req, res) => {
  res.json({ echo: req.body });
});

// Initialize Gemini lazily
let ai: GoogleGenAI | null = null;
function getAi() {
  if (!ai) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "empty-key-for-now",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return ai;
}

// Mock Database (In a real app, use a DB)
// We will also use client-side local storage or Zustand for saving personal mock data.

// Generate Course Content Endpoint
app.post("/api/generate-topic", async (req, res) => {
  console.log("Received request for /api/generate-topic", req.body);
  try {
    const { topic, difficulty = "Medium" } = req.body;
    console.log("Attempting Gemini AI generation for topic:", topic);

    const prompt = `Generate a comprehensive learning module about "${topic}" at a ${difficulty} difficulty level.
Include:
1. A concise overview summary (1-2 paragraphs).
2. 5-7 key concepts with descriptions.
3. 5 flashcards (term and definition).
4. A set of 5 multiple-choice questions (4 options each, clearly indicating the correct answer index 0-3).
5. 3 true/false questions.
6. A brief explanation for every answer.
Make sure the content is highly educational and accurate.`;

    const geminiPromise = getAi().models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} } as any],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyConcepts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  concept: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ["concept", "description"],
              },
            },
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                },
                required: ["term", "definition"],
              },
            },
            mcq: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                },
                required: ["question", "options", "correctIndex", "explanation"],
              },
            },
            trueFalse: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  correctAnswer: { type: Type.BOOLEAN },
                  explanation: { type: Type.STRING },
                },
                required: ["question", "correctAnswer", "explanation"],
              },
            },
          },
          required: ["title", "summary", "keyConcepts", "flashcards", "mcq", "trueFalse"],
        },
      },
    });

    // Timeout after 15 seconds to prevent 504 Gateway Timeout from hanging the user forever.
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Gemini API Request timed out after 15 seconds")), 15000)
    );

    const response: any = await Promise.race([geminiPromise, timeoutPromise]);

    const text = response.text;
    if (!text) {
      throw new Error("No response from model");
    }

    const data = JSON.parse(text);
    return res.json(data);
  } catch (error: any) {
    console.error("Gemini Generation Error:", error.message || error);
    // Silently handle the error and use mock fallback
    // This prevents the terminal from showing an error stack trace during high model demand
    const mockData = {
      title: `${req.body.topic} (Missing API Key)`,
      summary: `I'm currently showing mock data because a valid Gemini API Key was not found or the request failed. To get real AI generation: 1) Get an API key from https://aistudio.google.com/app/apikey 2) Add it to the Settings menu here as GEMINI_API_KEY.`,
      keyConcepts: [
        { concept: "First Principle", description: `The foundational elements that make up the core of ${req.body.topic}.` },
        { concept: "Advanced Mechanics", description: `How the systems interact on a deeper level beyond surface understanding.` },
        { concept: "Real-world Application", description: `How these academic concepts are applied in practical, everyday scenarios.` }
      ],
      flashcards: [
        { term: "Primary Concept", definition: `The most essential definition you need to remember about ${req.body.topic}.` },
        { term: "Secondary Concept", definition: `A related idea that builds upon the foundational knowledge.` },
        { term: "Glossary Item", definition: `A specific piece of jargon commonly used in this field.` }
      ],
      mcq: [
        {
          question: `What is the most critical component of ${req.body.topic}?`,
          options: ["The Primary Concept", "The Unrelated Variable", "The False Positive", "The Red Herring"],
          correctIndex: 0,
          explanation: "The Primary Concept is the foundation upon which everything else in this mock topic is built."
        },
        {
          question: `Which of these is NOT an application of this topic?`,
          options: ["Practical Use", "Theoretical Use", "Irrelevant Action", "Educational Use"],
          correctIndex: 2,
          explanation: "Irrelevant Actions have no connection to the subject matter at hand."
        }
      ],
      trueFalse: [
        {
          question: `True or False: ${req.body.topic} is a completely solved scientific field with no ongoing research.`,
          correctAnswer: false,
          explanation: "Like all fields of study, there is always ongoing research and more to learn."
        },
        {
          question: `True or False: Understanding the basics is crucial for mastering advanced concepts.`,
          correctAnswer: true,
          explanation: "Foundational knowledge is required before moving to complex mechanics."
        }
      ]
    };
    
    return res.json(mockData);
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
