
import { Comparison } from "../types";
import { jsPDF } from "jspdf";

const API_BASE_URL = 'http://localhost:3001';

/**
 * API Service for LektorView
 */
class ApiClient {
  private apiKey: string | null = null;

  setApiKey(key: string) {
    this.apiKey = key;
  }

  /**
   * Generates a new API key from the server.
   */
  async generateApiKey(): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/generate-key`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to generate API key');
    }
    const data = await response.json();
    return data.apiKey;
  }

  /**
   * Creates a new comparison on the server.
   */
  async createComparison(data: {
    originalText: string;
    correctedText: string;
    changeLog?: any[];
    pdfReferences?: any;
  }): Promise<{ slug: string; shareUrl: string }> {
    if (!this.apiKey) {
      throw new Error("API Key not set. Please set it before making this request.");
    }

    const response = await fetch(`${API_BASE_URL}/api/comparisons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create comparison');
    }

    return response.json();
  }

  /**
   * Fetches the comparison data for a given slug.
   */
  async getComparison(slug: string): Promise<Comparison> {
    const response = await fetch(`${API_BASE_URL}/api/public/comparisons/${slug}`);
    if (!response.ok) {
      // For this public endpoint, we can simulate a not found error
      // similar to the mock, but based on a real 404.
      await new Promise((resolve) => setTimeout(resolve, 600));
      return Promise.reject('Comparison not found');
    }
    return response.json();
  }

  /**
   * Downloads the corrected text in the specified format.
   */
  async downloadCorrectedText(comparison: Comparison, format: 'pdf' | 'txt' | 'docx') {
    if (format === 'pdf') {
      await this.generatePdf(comparison);
    } else if (format === 'txt') {
      this.downloadTxt(comparison);
    } else {
      console.warn("Format not implemented strictly in client-side demo:", format);
      this.downloadTxt(comparison);
    }
  }

  private async generatePdf(comparison: Comparison) {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("LektorView Correction Report", 20, 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Document: ${comparison.title || "Untitled"}`, 20, 30);
    doc.text(`Date: ${new Date(comparison.createdAt).toLocaleDateString()}`,
      20,
      35
    );
    doc.text(`ID: ${comparison.slug}`, 20, 40);
    doc.setDrawColor(200);
    doc.line(20, 45, 190, 45);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(0);
    const margin = 20;
    const maxWidth = 170;
    const startY = 55;
    const splitText = doc.splitTextToSize(comparison.correctedText, maxWidth);
    doc.text(splitText, margin, startY);
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
    }
    doc.save(`lektorview_${comparison.slug}.pdf`);
  }

  private downloadTxt(comparison: Comparison) {
    const blob = new Blob([comparison.correctedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lektorview_${comparison.slug}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const api = new ApiClient();
