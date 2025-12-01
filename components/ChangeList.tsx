import React from "react";
import { Change, ChangeType, ReferenceLink } from "../types";
import { AlertCircle, BookOpen, Check, Type, Edit3, Sparkles } from "lucide-react";

interface ChangeListProps {
  changes: Change[];
  activeChangeId: string | null;
  onSelectChange: (id: string) => void;
  onReferenceClick: (ref: ReferenceLink) => void;
}

const getChangeIcon = (type: ChangeType) => {
  switch (type) {
    case ChangeType.SPELLING: return <AlertCircle size={14} />;
    case ChangeType.GRAMMAR: return <Edit3 size={14} />;
    case ChangeType.STYLE: return <Sparkles size={14} />;
    case ChangeType.GLOSSARY: return <BookOpen size={14} />;
    case ChangeType.FORMAT: return <Type size={14} />;
    default: return <Check size={14} />;
  }
};

const getChangeColor = (type: ChangeType) => {
  switch (type) {
    case ChangeType.SPELLING: return "bg-red-100 text-red-700 border-red-200";
    case ChangeType.GRAMMAR: return "bg-blue-100 text-blue-700 border-blue-200";
    case ChangeType.STYLE: return "bg-amber-100 text-amber-700 border-amber-200";
    case ChangeType.GLOSSARY: return "bg-purple-100 text-purple-700 border-purple-200";
    case ChangeType.FORMAT: return "bg-gray-100 text-gray-700 border-gray-200";
    default: return "bg-gray-100 text-gray-600 border-gray-200";
  }
};

export const ChangeList: React.FC<ChangeListProps> = ({ 
  changes, 
  activeChangeId, 
  onSelectChange,
  onReferenceClick 
}) => {
  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200 w-80 lg:w-96 flex-shrink-0">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="font-semibold text-gray-800">Change Log</h3>
        <p className="text-xs text-gray-500 mt-1">{changes.length} corrections found</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {changes.map((change) => (
          <div
            key={change.id}
            id={`change-card-${change.id}`}
            onClick={() => onSelectChange(change.id)}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              activeChangeId === change.id
                ? "bg-blue-50 border-blue-400 shadow-sm ring-1 ring-blue-400"
                : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${getChangeColor(change.type)}`}>
                {getChangeIcon(change.type)}
                {change.type.toUpperCase()}
              </span>
            </div>

            <div className="mb-2">
              <div className="text-sm font-medium text-gray-900 line-through decoration-red-400 decoration-2 opacity-60 truncate">
                {change.originalSnippet || <span className="italic text-gray-400">[Deleted]</span>}
              </div>
              <div className="text-sm font-medium text-green-700 flex items-center gap-1">
                <span>→</span>
                <span>{change.correctedSnippet || <span className="italic text-gray-400">[Remove]</span>}</span>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              {change.messageShort}
            </p>

            {change.references && change.references.length > 0 && (
               <div className="mt-2 pt-2 border-t border-gray-100 flex flex-wrap gap-1">
                 {change.references.map((ref, idx) => (
                   <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      onReferenceClick(ref);
                    }}
                    className="flex items-center gap-1 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded transition-colors"
                   >
                     <BookOpen size={10} />
                     {ref.label || `Source ${ref.sourceId}`}
                   </button>
                 ))}
               </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};