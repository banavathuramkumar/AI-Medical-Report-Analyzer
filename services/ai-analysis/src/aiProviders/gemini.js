const { GoogleGenerativeAI } = require("@google/generative-ai");

async function analyzeWithGemini(text, apiKey) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are an expert clinical assistant. Analyze the following extracted medical report text and return a structured JSON response.
      
      Report Text:
      """
      ${text}
      """

      The JSON response must follow this structure exactly:
      {
        "summary": "A patient-friendly, clear and concise summary of the overall report (1-3 sentences)",
        "findings": ["Key finding 1 (e.g. Hemoglobin is normal at 14.5 g/dL)", "Key finding 2...", "..."],
        "concerns": ["Concern 1 (e.g. HbA1c is slightly elevated at 6.1%, suggesting prediabetes)", "..."],
        "interpretation": "Brief interpretation of key lab test indicators (e.g. what the normal or abnormal values signify for general health)",
        "explanation": "A technical, doctor-friendly explanation of the findings, including pathogenetic or clinical associations"
      }
      
      Make sure to only output valid JSON. Do not include markdown wraps or anything other than the JSON itself.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (err) {
    console.error("Gemini Provider Error:", err);
    throw err;
  }
}

module.exports = { analyzeWithGemini };
