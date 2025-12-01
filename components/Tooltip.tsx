import React from "react";
import { createPortal } from "react-dom";
import { Change, ChangeType } from "../types";

interface TooltipProps {
  change: Change;
  rect: DOMRect;
}

const getTypeLabel = (type: ChangeType) => {
  switch (type) {
    case ChangeType.SPELLING: return "Spelling";
    case ChangeType.GRAMMAR: return "Grammar";
    case ChangeType.STYLE: return "Style";
    case ChangeType.GLOSSARY: return "Glossary";
    case ChangeType.FORMAT: return "Format";
    default: return "Correction";
  }
};

const getTypeColor = (type: ChangeType) => {
  switch (type) {
    case ChangeType.SPELLING: return "text-red-300";
    case ChangeType.GRAMMAR: return "text-blue-300";
    case ChangeType.STYLE: return "text-amber-300";
    case ChangeType.GLOSSARY: return "text-purple-300";
    case ChangeType.FORMAT: return "text-gray-300";
    default: return "text-gray-300";
  }
};

export const Tooltip: React.FC<TooltipProps> = ({ change, rect }) => {
  // Calculate position centered above the element
  const top = rect.top + window.scrollY - 8; // 8px gap
  const left = rect.left + window.scrollX + (rect.width / 2);

  return createPortal(
    <div 
      className="fixed z-[100] pointer-events-none transform -translate-x-1/2 -translate-y-full"
      style={{ top, left }}
    >
      <div className="relative bg-slate-900 text-white text-xs rounded-lg shadow-xl p-3 max-w-[240px] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
            <span className={`uppercase text-[10px] font-bold tracking-wider ${getTypeColor(change.type)}`}>
                {getTypeLabel(change.type)}
            </span>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1">
            {change.correctedSnippet ? (
                <div className="font-semibold text-sm text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded w-fit">
                    {change.correctedSnippet}
                </div>
            ) : (
                <div className="font-semibold text-sm text-red-400 italic">
                    [Delete]
                </div>
            )}
            
            <p className="text-slate-300 leading-relaxed mt-1">
                {change.messageShort}
            </p>
        </div>

        {/* Arrow */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-slate-900"></div>
      </div>
    </div>,
    document.body
  );
};
