import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: "AIzaSyBQpD6dr4_9LuzKSDyCpJz6EHplVVzu7Zw"
});

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello"
    });
    console.log("Success:", response.text);
  } catch (err) {
    console.error("Error:", err.message || err);
  }
}
run();
