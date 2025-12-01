import React from "react";
import { X, ExternalLink, FileText } from "lucide-react";
import { ReferenceSource } from "../types";

interface ReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: ReferenceSource | null;
  page?: number;
}

export const ReferenceModal: React.FC<ReferenceModalProps> = ({
  isOpen,
  onClose,
  source,
  page,
}) => {
  if (!isOpen || !source) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{source.name}</h3>
              {page && (
                <p className="text-sm text-gray-500">
                  Reference found on page <span className="font-medium text-gray-900">{page}</span>
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 bg-gray-100 p-8 flex flex-col items-center justify-center text-center relative">
          {/* Mock PDF Viewer UI */}
          <div className="bg-white shadow-lg w-full max-w-2xl aspect-[3/4] flex flex-col items-center justify-center border border-gray-200 rounded-sm">
             <FileText size={48} className="text-gray-300 mb-4" />
             <h4 className="text-xl font-bold text-gray-800 mb-2">{source.name}</h4>
             <div className="w-16 h-1 bg-blue-500 rounded-full mb-4"></div>
             <p className="text-gray-500 max-w-xs">
               This is a simulated PDF viewer. In a real application, the PDF from <code>{source.url}</code> would be rendered here using PDF.js.
             </p>
             {page && (
               <div className="mt-8 px-4 py-2 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md font-medium">
                 Scrolled to Page {page}
               </div>
             )}
          </div>

          <a 
            href={source.url} 
            target="_blank" 
            rel="noreferrer"
            className="absolute bottom-6 right-6 flex items-center gap-2 px-4 py-2 bg-white shadow-md rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
          >
            Open Original Source <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
};