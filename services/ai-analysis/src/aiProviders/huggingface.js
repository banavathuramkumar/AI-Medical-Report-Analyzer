const { HfInference } = require("@huggingface/inference");

async function analyzeWithHuggingFace(text, apiKey) {
  try {
    const hf = new HfInference(apiKey);
    const model = "mistralai/Mistral-7B-Instruct-v0.3";
    
    const prompt = `<s>[INST] Analyze the following extracted medical report text and return a structured JSON response.
      Report Text:
      "${text}"

      The JSON response must follow this structure exactly:
      {
        "summary": "A patient-friendly, clear and concise summary of the overall report",
        "findings": ["Finding 1", "Finding 2"],
        "concerns": ["Concern 1", "Concern 2"],
        "interpretation": "Interpretation of lab indicators",
        "explanation": "Doctor-friendly explanation"
      }
      
      Respond with ONLY the valid JSON object. Do not explain, just return JSON. [/INST]`;

    const response = await hf.textGeneration({
      model,
      inputs: prompt,
      parameters: {
        max_new_tokens: 800,
        return_full_text: false
      }
    });

    const outputText = response.generated_text;
    
    // Clean up text to find JSON boundaries
    const jsonStart = outputText.indexOf("{");
    const jsonEnd = outputText.lastIndexOf("}") + 1;
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const cleanJson = outputText.substring(jsonStart, jsonEnd);
      return JSON.parse(cleanJson);
    }
    
    throw new Error("Invalid JSON returned from Hugging Face model");
  } catch (err) {
    console.error("Hugging Face Provider Error:", err);
    throw err;
  }
}

module.exports = { analyzeWithHuggingFace };
