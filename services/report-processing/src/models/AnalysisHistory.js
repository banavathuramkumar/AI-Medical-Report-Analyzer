const mongoose = require("mongoose");

const AnalysisHistorySchema = new mongoose.Schema({
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: "MedicalReport", required: true },
  aiResponse: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AnalysisHistory", AnalysisHistorySchema);
