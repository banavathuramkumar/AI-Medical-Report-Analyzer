import { fetchJson } from "./api";

export const reportService = {
  async uploadReport(fileOrText, fileName = "report.txt") {
    let body;
    let isFile = false;

    if (fileOrText instanceof File) {
      body = new FormData();
      body.append("report", fileOrText);
      isFile = true;
    } else {
      body = JSON.stringify({ text: fileOrText, fileName });
    }

    return fetchJson("/reports/upload", {
      method: "POST",
      body,
    });
  },

  async getReportsHistory() {
    return fetchJson("/reports/history");
  },

  async getReportStatus(reportId) {
    return fetchJson(`/reports/status/${reportId}`);
  },
};
