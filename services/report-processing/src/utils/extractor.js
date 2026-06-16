const { createWorker } = require("tesseract.js");
const pdf = require("pdf-parse");

async function extractTextFromImage(buffer) {
  try {
    const worker = await createWorker("eng");
    const { data: { text } } = await worker.recognize(buffer);
    await worker.terminate();
    return text;
  } catch (err) {
    console.error("Tesseract OCR Node Error:", err);
    throw new Error("Failed to extract text from image report");
  }
}

async function extractTextFromPdf(buffer) {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (err) {
    console.error("PDF Parse Error:", err);
    throw new Error("Failed to parse PDF report");
  }
}

async function extractText(buffer, mimeType) {
  if (mimeType === "application/pdf") {
    return extractTextFromPdf(buffer);
  } else if (mimeType && mimeType.startsWith("image/")) {
    return extractTextFromImage(buffer);
  } else {
    throw new Error("Unsupported report file format");
  }
}

module.exports = { extractText };
