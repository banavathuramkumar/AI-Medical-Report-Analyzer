const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const MedicalReport = require("./models/MedicalReport");
const { optionalAuth, requireAuth } = require("./middleware/auth");
const { extractText } = require("./utils/extractor");
const { connectKafka, publishReportExtracted } = require("./config/kafka");

const app = express();
const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/medical_reports";

app.use(express.json());

// Multer memory buffer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB max size
});

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log("Report Service connected to MongoDB"))
  .catch(err => console.error("Report Service failed to connect to MongoDB:", err));

// Kafka Connection
connectKafka();

// Endpoints
app.post("/upload", requireAuth, upload.single("report"), async (req, res) => {
  try {
    let fileName = req.body.fileName || "Direct Text Input";
    let extractedText = "";
    const userId = req.user ? req.user.id : null;

    if (req.file) {
      fileName = req.file.originalname;
      console.log(`Processing file: ${fileName} (${req.file.mimetype})`);
      extractedText = await extractText(req.file.buffer, req.file.mimetype);
    } else if (req.body.text) {
      extractedText = req.body.text;
    } else {
      return res.status(400).json({ error: "No file or text report provided" });
    }

    if (!extractedText.trim()) {
      return res.status(400).json({ error: "Could not extract text from the provided report." });
    }

    // Save report to MongoDB with status "processing"
    const report = new MedicalReport({
      userId,
      fileName,
      extractedText,
      status: "processing"
    });
    await report.save();

    // Trigger asynchronous AI processing via Kafka
    await publishReportExtracted(report._id, userId, extractedText);

    // Respond immediately to prevent HTTP timeouts
    res.status(202).json({
      message: "Report uploaded successfully. Analysis in progress.",
      reportId: report._id,
      status: report.status
    });

  } catch (err) {
    console.error("Upload/Processing Error:", err);
    res.status(500).json({ error: err.message || "Failed to upload and process report" });
  }
});

app.get("/history", requireAuth, async (req, res) => {
  try {
    const reports = await MedicalReport.find({ userId: req.user.id }).sort({ uploadedAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error("History Error:", err);
    res.status(500).json({ error: "Failed to load report history" });
  }
});

app.get("/status/:id", async (req, res) => {
  try {
    const report = await MedicalReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }
    res.json(report);
  } catch (err) {
    console.error("Status check error:", err);
    res.status(500).json({ error: "Failed to check report status" });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy", service: "Report Processing Service" });
});

app.listen(PORT, () => {
  console.log(`Report Processing Service is running on port ${PORT}`);
});
