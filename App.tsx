import React, { useState, useEffect, useCallback } from "react";
import { Download, Share2, Info, FileText, CheckCircle2, ChevronDown } from "lucide-react";
import { api } from "./services/api";
import { ChangeList } from "./components/ChangeList";
import { TextRenderer } from "./components/TextRenderer";
import { ReferenceModal } from "./components/ReferenceModal";
import { Comparison, ReferenceLink, ReferenceSource } from "./types";

export default function App() {
  const [data, setData] = useState<Comparison | null>(null);
  const [activeChangeId, setActiveChangeId] = useState<string | null>(null);
  
  // Reference Modal State
  const [refModalOpen, setRefModalOpen] = useState(false);
  const [selectedRefSource, setSelectedRefSource] = useState<ReferenceSource | null>(null);
  const [selectedRefPage, setSelectedRefPage] = useState<number | undefined>(undefined);

  // Load Data
  useEffect(() => {
    const fetchData = async () => {
      // In a real app, this would come from the URL params (e.g., /v/k3F9ad)
      const slug = "k3F9ad";
      try {
        const comparison = await api.getComparison(slug);
        setData(comparison);
      } catch (err) {
        console.error("Failed to load comparison", err);
      }
    };
    
    fetchData();
  }, []);

  // Scrolling Logic
  const scrollToChange = useCallback((id: string) => {
    // 1. Scroll Sidebar
    const card = document.getElementById(`change-card-${id}`);
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    // 2. Scroll Text
    const highlight = document.getElementById(`change-highlight-${id}`);
    if (highlight) {
      highlight.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const handleSelectChange = (id: string) => {
    setActiveChangeId(id);
    scrollToChange(id);
  };

  const handleReferenceClick = (ref: ReferenceLink) => {
    if (!data) return;
    const source = data.referenceSources.find((s) => s.id === ref.sourceId);
    if (source) {
      setSelectedRefSource(source);
      setSelectedRefPage(ref.page);
      setRefModalOpen(true);
    }
  };

  const handleExport = async () => {
    if (!data) return;
    try {
      await api.downloadCorrectedText(data, 'pdf');
    } catch (e) {
      console.error("Export failed", e);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm z-10 flex-shrink-0">
        <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                LV
              </div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">LektorView</h1>
            </div>
            <div className="h-6 w-px bg-gray-200 mx-2"></div>
            <div>
              <h2 className="text-sm font-medium text-gray-900">{data.title}</h2>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Info size={10} />
                Compared on {new Date(data.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
              <Share2 size={16} />
              Share Link
            </button>
            <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block"></div>
            
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm rounded-md transition-colors"
            >
              <Download size={16} />
              Export PDF
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden max-w-screen-2xl mx-auto w-full">
        {/* Editor Columns */}
        <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200 overflow-hidden">
          
          {/* Left Column: Original */}
          <div className="flex-1 flex flex-col min-w-0 bg-white">
            <div className="px-6 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                <FileText size={14} /> Original Draft
              </span>
              <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full font-medium">
                {data.changes.length} Issues
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-8 relative">
              <TextRenderer
                text={data.originalText}
                changes={data.changes}
                activeChangeId={activeChangeId}
                onHoverChange={(id) => {
                  // Only set active if strictly needed, or handle purely in renderer for tooltip
                  // Here we keep it mainly for sync, but tooltip handles its own hover
                }}
                onSelectChange={handleSelectChange}
              />
            </div>
          </div>

          {/* Right Column: Corrected */}
          <div className="flex-1 flex flex-col min-w-0 bg-white/50">
            <div className="px-6 py-3 border-b border-gray-100 bg-green-50/30 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-green-700 flex items-center gap-2">
                <CheckCircle2 size={14} /> Corrected Version
              </span>
              <button 
                onClick={() => navigator.clipboard.writeText(data.correctedText)}
                className="text-xs text-blue-600 hover:underline"
              >
                Copy Text
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 font-mono text-base leading-loose whitespace-pre-wrap text-gray-900">
              {data.correctedText}
            </div>
          </div>
        </div>

        {/* Sidebar: Change List */}
        <ChangeList
          changes={data.changes}
          activeChangeId={activeChangeId}
          onSelectChange={handleSelectChange}
          onReferenceClick={handleReferenceClick}
        />
      </main>

      {/* Modals */}
      <ReferenceModal
        isOpen={refModalOpen}
        onClose={() => setRefModalOpen(false)}
        source={selectedRefSource}
        page={selectedRefPage}
      />
    </div>
  );
}
