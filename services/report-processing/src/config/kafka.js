const { Kafka } = require("kafkajs");
const MedicalReport = require("../models/MedicalReport");
const AnalysisHistory = require("../models/AnalysisHistory");

const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID || "report-service";
const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || "localhost:9092").split(",");

const kafka = new Kafka({
  clientId: KAFKA_CLIENT_ID,
  brokers: KAFKA_BROKERS,
  retry: {
    initialRetryTime: 1000,
    retries: 15
  }
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "report-service-group" });

async function connectKafka() {
  try {
    await producer.connect();
    console.log("Report service Kafka Producer connected");
    
    await consumer.connect();
    console.log("Report service Kafka Consumer connected");
    
    await consumer.subscribe({ topic: "report-analyzed", fromBeginning: true });
    
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const payload = JSON.parse(message.value.toString());
          console.log(`Report service received analyzed event for report: ${payload.reportId}`);
          
          const report = await MedicalReport.findById(payload.reportId);
          if (report) {
            report.status = payload.status === "failed" ? "failed" : "completed";
            if (payload.status !== "failed") {
              report.analysisResult = payload.analysisResult;
              
              const history = new AnalysisHistory({
                reportId: report._id,
                aiResponse: payload.analysisResult
              });
              await history.save();
            }
            await report.save();
            
            // Send Completion Notification
            await sendNotification({
              userId: report.userId,
              reportId: report._id,
              fileName: report.fileName,
              status: report.status,
              event: "analysis_complete"
            });
          }
        } catch (err) {
          console.error("Error processing report-analyzed message:", err);
        }
      }
    });
  } catch (err) {
    console.error("Kafka connection error in Report service:", err);
    // Restart logic fallback
    setTimeout(connectKafka, 5000);
  }
}

async function publishReportExtracted(reportId, userId, extractedText) {
  try {
    await producer.send({
      topic: "report-extracted",
      messages: [
        {
          value: JSON.stringify({
            reportId,
            userId,
            extractedText
          })
        }
      ]
    });
    console.log(`Published report-extracted event for report ${reportId}`);
  } catch (err) {
    console.error("Failed to publish report-extracted:", err);
    throw err;
  }
}

async function sendNotification(data) {
  try {
    await producer.send({
      topic: "notifications",
      messages: [
        {
          value: JSON.stringify(data)
        }
      ]
    });
    console.log(`Published notification event for report ${data.reportId}`);
  } catch (err) {
    console.error("Failed to publish notification event:", err);
  }
}

module.exports = { connectKafka, publishReportExtracted };
