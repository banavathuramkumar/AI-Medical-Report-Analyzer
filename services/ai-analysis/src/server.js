const { Kafka } = require("kafkajs");
const { analyzeWithGemini } = require("./aiProviders/gemini");
const { analyzeWithHuggingFace } = require("./aiProviders/huggingface");
const { analyzeLocally } = require("./aiProviders/localMock");

// ─── Environment Config ──────────────────────────────────────────────────────
const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID || "ai-analysis-service";
const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || "localhost:9092").split(",");
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const HF_API_KEY = process.env.HF_API_KEY || "";

// ─── Kafka Setup ─────────────────────────────────────────────────────────────
const kafka = new Kafka({
  clientId: KAFKA_CLIENT_ID,
  brokers: KAFKA_BROKERS,
  retry: {
    initialRetryTime: 1000,
    retries: 15
  }
});

const consumer = kafka.consumer({ groupId: "ai-analysis-group" });
const producer = kafka.producer();

// ─── AI Provider Cascade ─────────────────────────────────────────────────────
async function runAIAnalysis(extractedText) {
  // 1) Try Gemini (primary)
  if (GEMINI_API_KEY) {
    try {
      console.log("[AI] Attempting Gemini analysis...");
      const result = await analyzeWithGemini(extractedText, GEMINI_API_KEY);
      console.log("[AI] Gemini analysis succeeded.");
      return { result, provider: "gemini" };
    } catch (err) {
      console.warn("[AI] Gemini failed, trying HuggingFace fallback:", err.message);
    }
  }

  // 2) Try HuggingFace (secondary)
  if (HF_API_KEY) {
    try {
      console.log("[AI] Attempting HuggingFace analysis...");
      const result = await analyzeWithHuggingFace(extractedText, HF_API_KEY);
      console.log("[AI] HuggingFace analysis succeeded.");
      return { result, provider: "huggingface" };
    } catch (err) {
      console.warn("[AI] HuggingFace failed, falling back to local mock:", err.message);
    }
  }

  // 3) Local rule-based fallback (always succeeds)
  console.log("[AI] Using local mock analysis (offline fallback).");
  const result = analyzeLocally(extractedText);
  return { result, provider: "local" };
}

// ─── Publish Result ───────────────────────────────────────────────────────────
async function publishAnalyzedResult(reportId, userId, analysisResult, status) {
  await producer.send({
    topic: "report-analyzed",
    messages: [
      {
        value: JSON.stringify({
          reportId,
          userId,
          analysisResult,
          status,
          analyzedAt: new Date().toISOString()
        })
      }
    ]
  });
  console.log(`[Kafka] Published report-analyzed event for report: ${reportId} [status=${status}]`);
}

// ─── Main Service Loop ────────────────────────────────────────────────────────
async function start() {
  try {
    await producer.connect();
    console.log("[Kafka] AI Analysis producer connected.");

    await consumer.connect();
    console.log("[Kafka] AI Analysis consumer connected.");

    await consumer.subscribe({ topic: "report-extracted", fromBeginning: true });
    console.log("[Kafka] Subscribed to topic: report-extracted");

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        let payload;
        try {
          payload = JSON.parse(message.value.toString());
        } catch (parseErr) {
          console.error("[Kafka] Failed to parse Kafka message:", parseErr);
          return;
        }

        const { reportId, userId, extractedText } = payload;
        console.log(`\n[AI Service] Received report for analysis — ID: ${reportId}`);

        if (!extractedText || !extractedText.trim()) {
          console.warn(`[AI Service] No extracted text for report ${reportId}. Skipping.`);
          await publishAnalyzedResult(reportId, userId, null, "failed");
          return;
        }

        try {
          const { result, provider } = await runAIAnalysis(extractedText);
          console.log(`[AI Service] Analysis complete via [${provider}] for report: ${reportId}`);
          await publishAnalyzedResult(reportId, userId, result, "completed");
        } catch (analysisErr) {
          console.error(`[AI Service] All providers failed for report ${reportId}:`, analysisErr);
          await publishAnalyzedResult(reportId, userId, null, "failed");
        }
      }
    });
  } catch (err) {
    console.error("[AI Service] Fatal startup error:", err);
    // Retry connection after 5 seconds
    setTimeout(start, 5000);
  }
}

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
async function shutdown() {
  console.log("\n[AI Service] Shutting down gracefully...");
  try {
    await consumer.disconnect();
    await producer.disconnect();
    console.log("[AI Service] Kafka connections closed.");
  } catch (err) {
    console.error("[AI Service] Error during shutdown:", err);
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// ─── Kick Off ─────────────────────────────────────────────────────────────────
console.log("=== AI Analysis Microservice Starting ===");
console.log(`  Kafka Brokers : ${KAFKA_BROKERS.join(", ")}`);
console.log(`  Gemini Key    : ${GEMINI_API_KEY ? "✓ Set" : "✗ Not set"}`);
console.log(`  HF Key        : ${HF_API_KEY ? "✓ Set" : "✗ Not set"}`);
console.log(`  Fallback      : local rule-based (always available)`);
console.log("=========================================\n");

start();
