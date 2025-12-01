import { Comparison } from "../types";
import { MOCK_COMPARISON } from "./mockData";
import { jsPDF } from "jspdf";

/**
 * API Service
 * 
 * Follows the RESTful design patterns described in the product specification.
 * 
 * Endpoints simulated:
 * - GET /api/public/comparisons/{slug}
 * - GET /api/comparisons/{slug}/download
 */
class ApiClient {
  /**
   * Fetches the comparison data for a given slug.
   * Maps to GET /api/public/comparisons/{slug}
   */
  async getComparison(slug: string): Promise<Comparison> {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    // In a real implementation:
    // const response = await fetch(`/api/public/comparisons/${slug}`);
    // return response.json();
    
    return MOCK_COMPARISON;
  }

  /**
   * Downloads the corrected text in the specified format.
   * Maps to GET /api/comparisons/{slug}/download?format={format}
   */
  async downloadCorrectedText(comparison: Comparison, format: 'pdf' | 'txt' | 'docx') {
    if (format === 'pdf') {
      await this.generatePdf(comparison);
    } else if (format === 'txt') {
      this.downloadTxt(comparison);
    } else {
      console.warn("Format not implemented strictly in client-side demo:", format);
      // Fallback to text for docx in this demo context
      this.downloadTxt(comparison);
    }
  }

  private async generatePdf(comparison: Comparison) {
    const doc = new jsPDF();
    
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("LektorView Correction Report", 20, 20);
    
    // Metadata
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Document: ${comparison.title || "Untitled"}`, 20, 30);
    doc.text(`Date: ${new Date(comparison.createdAt).toLocaleDateString()}`, 20, 35);
    doc.text(`ID: ${comparison.slug}`, 20, 40);

    // Separator
    doc.setDrawColor(200);
    doc.line(20, 45, 190, 45);

    // Content
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(0);
    
    const margin = 20;
    const maxWidth = 170;
    const startY = 55;
    
    // Handle basic text wrapping
    // Note: Standard jsPDF fonts supports Latin-1 (including German umlauts)
    const splitText = doc.splitTextToSize(comparison.correctedText, maxWidth);
    
    doc.text(splitText, margin, startY);
    
    // Footer
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
