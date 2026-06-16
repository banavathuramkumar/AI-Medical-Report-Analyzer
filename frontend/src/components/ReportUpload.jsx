import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileImage, Loader2, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reportService } from "@/services/reportService";

const ReportUpload = ({ onAnalysisComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [error, setError] = useState(null);
  
  // Tab state for Upload File vs Paste Text
  const [inputTab, setInputTab] = useState("file");
  const [rawText, setRawText] = useState("");
  const [textFileName, setTextFileName] = useState("Direct Text Input");

  const pollReportStatus = (reportId) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > 60) { // Timeout after 2 minutes
        clearInterval(interval);
        setError("Analysis timed out. Please try again.");
        setIsProcessing(false);
        return;
      }

      try {
        const report = await reportService.getReportStatus(reportId);
        
        if (report.status === "completed") {
          clearInterval(interval);
          setIsProcessing(false);
          onAnalysisComplete(report);
        } else if (report.status === "failed") {
          clearInterval(interval);
          setError("AI Analysis failed. Please check the report contents and try again.");
          setIsProcessing(false);
        }
      } catch (err) {
        clearInterval(interval);
        setError("Failed to verify analysis status.");
        setIsProcessing(false);
      }
    }, 2000);
  };

  const handleUpload = async (fileOrText, fileName) => {
    setIsProcessing(true);
    setError(null);
    setProgressMsg("Uploading report to secure server...");

    try {
      const response = await reportService.uploadReport(fileOrText, fileName);
      setProgressMsg("AI engine is analyzing and structuring values...");
      pollReportStatus(response.reportId || response._id || response.id);
    } catch (err) {
      setError(err.message || "Failed to process report. Please try again.");
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      handleUpload(file, file.name);
    }
  }, []);

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!rawText.trim()) return;
    handleUpload(rawText, textFileName || "Text Report");
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp", ".bmp"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    disabled: isProcessing,
  });

  return (
    <section id="upload" className="py-16 lg:py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">
              Analyze Your Report
            </h2>
            <p className="text-muted-foreground">
              Select your input format to start processing
            </p>
            
            {/* Input Options Tabs */}
            <div className="mt-6 inline-flex rounded-lg bg-muted p-1">
              <button
                onClick={() => setInputTab("file")}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                  inputTab === "file" 
                    ? "bg-card text-foreground shadow-soft" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Upload File (PDF/Image)
              </button>
              <button
                onClick={() => setInputTab("text")}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                  inputTab === "text" 
                    ? "bg-card text-foreground shadow-soft" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Paste Report Text
              </button>
            </div>
          </div>

          {isProcessing ? (
            <div className="relative rounded-2xl border border-border/50 bg-card p-12 text-center shadow-soft animate-pulse-soft">
              <div className="space-y-4">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                <div>
                  <p className="font-semibold text-foreground">{progressMsg}</p>
                  <p className="mt-2 text-xs text-muted-foreground">This may take up to a minute</p>
                </div>
              </div>
            </div>
          ) : inputTab === "file" ? (
            <div
              {...getRootProps()}
              className={`
                relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center
                transition-all duration-300 ease-out
                ${isDragActive 
                  ? "border-primary bg-primary/5 scale-[1.02]" 
                  : "border-border hover:border-primary/50 hover:bg-accent/30"
                }
              `}
            >
              <input {...getInputProps()} />
              
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                {isDragActive ? (
                  <FileImage className="h-8 w-8 text-primary" />
                ) : (
                  <Upload className="h-8 w-8 text-primary" />
                )}
              </div>
              <p className="mb-2 text-lg font-medium text-foreground">
                {isDragActive ? "Drop your file here" : "Drop your report here"}
              </p>
              <p className="mb-4 text-sm text-muted-foreground">
                Supports PNG, JPG, JPEG, WebP, BMP, and PDF
              </p>
              <Button variant="secondary" size="sm">
                Browse Files
              </Button>
            </div>
          ) : (
            <form onSubmit={handleTextSubmit} className="space-y-4 rounded-2xl border border-border/50 bg-card p-6 shadow-soft">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Report Label</label>
                <input
                  type="text"
                  placeholder="e.g. Blood Test June 2026"
                  value={textFileName}
                  onChange={(e) => setTextFileName(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Paste Report Text</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Paste the text from your laboratory report here..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              
              <Button type="submit" className="w-full flex items-center justify-center gap-1.5">
                <FileText className="h-4 w-4" />
                Analyze Text Report
              </Button>
            </form>
          )}

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-health-critical-bg p-4 text-health-critical">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-health-normal" />
              <span>Secure Upload</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-health-info" />
              <span>Kafka Triggered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span>Gemini AI powered</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReportUpload;
