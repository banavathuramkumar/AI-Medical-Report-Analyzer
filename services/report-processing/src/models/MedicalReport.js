const mongoose = require("mongoose");

const MedicalReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  fileName: { type: String, required: true },
  fileUrl: { type: String, default: null },
  extractedText: { type: String, default: "" },
  analysisResult: { type: mongoose.Schema.Types.Mixed, default: null },
  status: { type: String, enum: ["processing", "completed", "failed"], default: "processing" },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("MedicalReport", MedicalReportSchema);
