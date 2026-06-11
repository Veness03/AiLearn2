import { GoogleGenAI, Type } from "@google/genai";

let ai: GoogleGenAI | null = null;
function getAi() {
  if (!ai) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY1 || process.env.GEMINI_API_KEY || "empty-key-for-now",
    });
  }
  return ai;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { topic, difficulty = "Medium" } = req.body;

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

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Gemini API Request timed out after 15 seconds")), 15000)
    );

    const response: any = await Promise.race([geminiPromise, timeoutPromise]);
    const text = response.text;
    
    if (!text) throw new Error("No response from model");

    const data = JSON.parse(text);
    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Vercel Gemini Generation Error:", error.message || error);
    
    // Mock fallback if AI is rate limited or timeouts
    const mockData = {
      title: `${req.body.topic} (Mock Fallback)`,
      summary: `This is a mock overview for the topic "${req.body.topic}". The AI API is currently experiencing a temporary spike in demand (503 UNAVAILABLE), so we have provided this simulated module to allow you to explore the application's interface and features in the meantime. Please try generating a real topic again shortly!`,
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
    
    return res.status(200).json(mockData);
  }
}
