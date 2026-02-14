const { GoogleGenAI } = require("@google/genai");
const CarbonEntry = require("../models/CarbonEntry");

exports.chatWithBot = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // 🔹 Get latest carbon entry
    const latest = await CarbonEntry.findOne().sort({ date: -1 });

    let carbonSummary = "No carbon data available.";

    if (latest) {
      carbonSummary = `
Campus Block: ${latest.campusBlock}
Month: ${latest.month} ${latest.year}
Total Emission: ${latest.totalEmission}
Total Absorption: ${latest.totalAbsorption}
Net Carbon: ${latest.netCarbon}
Sources:
${latest.sources.map(s => `- ${s.title}: ${s.co2}`).join("\n")}
`;
    }

    // 🔹 Combine context + user message
    const prompt = `
You are a Carbon Neutrality Assistant.
Use the following carbon data to answer user queries:

${carbonSummary}

User Question:
${message}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return res.json({ reply: response.text });

  } catch (e) {
    console.error("Gemini error:", e);
    return res.status(500).json({ message: "error generating response" });
  }
};
