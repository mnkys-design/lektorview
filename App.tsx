import React, { useState, useEffect, useCallback } from "react";
import { Download, Share2, Info, FileText, CheckCircle2, Key, Loader2, Upload, File } from "lucide-react";
import { api } from "./services/api";
import { ChangeList } from "./components/ChangeList";
import { TextRenderer } from "./components/TextRenderer";
import { ReferenceModal } from "./components/ReferenceModal";
import { Comparison, ReferenceLink, ReferenceSource } from "./types";

export default function App() {
  const [data, setData] = useState<Comparison | null>(null);
  const [activeChangeId, setActiveChangeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Upload/API Key State
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [generatedApiKey, setGeneratedApiKey] = useState<string>("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Reference Modal State
  const [refModalOpen, setRefModalOpen] = useState(false);
  const [selectedRefSource, setSelectedRefSource] = useState<ReferenceSource | null>(null);
  const [selectedRefPage, setSelectedRefPage] = useState<number | undefined>(undefined);

  // Load Data based on URL
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/view\/([a-zA-Z0-9]+)/);
    
    if (match) {
        const slug = match[1];
        setLoading(true);
        api.getComparison(slug)
          .then(setData)
          .catch(err => {
             console.error("Failed to load comparison", err);
             setError("Comparison not found or could not be loaded.");
          })
          .finally(() => setLoading(false));
    } else {
        // Optionally load mock data or show a landing page
        // For now, we will just show the upload/key generation interface if no slug
    }
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

  const handleGenerateApiKey = async () => {
      try {
          const key = await api.generateApiKey();
          setGeneratedApiKey(key);
      } catch (err) {
          console.error(err);
          alert("Failed to generate API Key");
      }
  }

  // Simple landing/upload view if no data is loaded
  if (!data && !loading && !error) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
              <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">LektorView API Access</h1>
                  
                  <div className="space-y-6">
                      <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                          <h3 className="text-sm font-semibold text-blue-800 mb-2">Generate API Key</h3>
                          <p className="text-xs text-blue-600 mb-4">
                              Use this key to upload comparisons securely via our API.
                          </p>
                          {generatedApiKey ? (
                              <div className="bg-white p-2 rounded border border-gray-200 break-all font-mono text-sm">
                                  {generatedApiKey}
                              </div>
                          ) : (
                              <button
                                  onClick={handleGenerateApiKey}
                                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                              >
                                  <Key size={16} />
                                  Generate New Key
                              </button>
                          )}
                      </div>

                      <div className="border-t border-gray-100 pt-6">
                         <h3 className="text-sm font-semibold text-gray-800 mb-2">How to use</h3>
                         <p className="text-xs text-gray-500 leading-relaxed">
                             Send a POST request to <code className="bg-gray-100 px-1 rounded">/api/comparisons</code> with your API key in the <code className="bg-gray-100 px-1 rounded">x-api-key</code> header.
                             Include <code>originalText</code> and <code>correctedText</code> in the JSON body.
                         </p>
                      </div>
                  </div>
              </div>
          </div>
      )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
                  <p className="text-gray-600">{error}</p>
                  <a href="/" className="mt-4 inline-block text-blue-600 hover:underline">Go Home</a>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm z-10 flex-shrink-0">
        <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                LV
              </div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">LektorView</h1>
            </a>
            <div className="h-6 w-px bg-gray-200 mx-2"></div>
            <div>
              <h2 className="text-sm font-medium text-gray-900">{data?.title || 'Untitled Comparison'}</h2>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Info size={10} />
                Compared on {data ? new Date(data.createdAt).toLocaleDateString() : '-'}
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
                {data?.changes.length || 0} Issues
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-8 relative">
              {data && (
                  <TextRenderer
                    text={data.originalText}
                    changes={data.changes}
                    activeChangeId={activeChangeId}
                    onHoverChange={(id) => {
                      // Only set active if strictly needed
                    }}
                    onSelectChange={handleSelectChange}
                  />
              )}
            </div>
          </div>

          {/* Right Column: Corrected */}
          <div className="flex-1 flex flex-col min-w-0 bg-white/50">
            <div className="px-6 py-3 border-b border-gray-100 bg-green-50/30 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-green-700 flex items-center gap-2">
                <CheckCircle2 size={14} /> Corrected Version
              </span>
              <button 
                onClick={() => data && navigator.clipboard.writeText(data.correctedText)}
                className="text-xs text-blue-600 hover:underline"
              >
                Copy Text
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 font-mono text-base leading-loose whitespace-pre-wrap text-gray-900">
              {data?.correctedText}
            </div>
          </div>
        </div>

        {/* Sidebar: Change List */}
        {data && (
            <ChangeList
              changes={data.changes}
              activeChangeId={activeChangeId}
              onSelectChange={handleSelectChange}
              onReferenceClick={handleReferenceClick}
            />
        )}
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
