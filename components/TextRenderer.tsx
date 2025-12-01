import React, { useState } from "react";
import { Change, ChangeType } from "../types";
import { Tooltip } from "./Tooltip";

interface TextRendererProps {
  text: string;
  changes: Change[];
  activeChangeId: string | null;
  onHoverChange: (id: string | null) => void;
  onSelectChange: (id: string) => void;
}

// Map change types to highlighting styles
const getHighlightClass = (type: ChangeType, isActive: boolean) => {
  const base = "transition-all duration-200 cursor-pointer rounded px-0.5 py-0.5 -mx-0.5 border-b-2 relative";
  
  // Active state gets darker background
  if (isActive) {
    switch (type) {
      case ChangeType.SPELLING: return `${base} bg-red-200 border-red-600 text-red-900`;
      case ChangeType.GRAMMAR: return `${base} bg-blue-200 border-blue-600 text-blue-900`;
      case ChangeType.STYLE: return `${base} bg-amber-200 border-amber-600 text-amber-900`;
      case ChangeType.GLOSSARY: return `${base} bg-purple-200 border-purple-600 text-purple-900`;
      case ChangeType.FORMAT: return `${base} bg-gray-300 border-gray-600 text-gray-900`;
      default: return `${base} bg-gray-300 border-gray-600`;
    }
  }

  // Inactive state gets lighter background
  switch (type) {
    case ChangeType.SPELLING: return `${base} bg-red-50 border-red-300 hover:bg-red-100`;
    case ChangeType.GRAMMAR: return `${base} bg-blue-50 border-blue-300 hover:bg-blue-100`;
    case ChangeType.STYLE: return `${base} bg-amber-50 border-amber-300 hover:bg-amber-100`;
    case ChangeType.GLOSSARY: return `${base} bg-purple-50 border-purple-300 hover:bg-purple-100`;
    case ChangeType.FORMAT: return `${base} bg-gray-100 border-gray-300 hover:bg-gray-200`;
    default: return `${base} bg-gray-100 border-gray-300 hover:bg-gray-200`;
  }
};

export const TextRenderer: React.FC<TextRendererProps> = ({
  text,
  changes,
  activeChangeId,
  onHoverChange,
  onSelectChange,
}) => {
  const [hoveredChange, setHoveredChange] = useState<Change | null>(null);
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null);

  // Sort changes by start position to process linearly
  const sortedChanges = [...changes].sort((a, b) => a.originalRange.start - b.originalRange.start);
  
  const segments = [];
  let lastIndex = 0;

  sortedChanges.forEach((change) => {
    // 1. Text before the change
    if (change.originalRange.start > lastIndex) {
      segments.push(
        <span key={`text-${lastIndex}`}>
          {text.slice(lastIndex, change.originalRange.start)}
        </span>
      );
    }

    // 2. The changed text itself
    const content = text.slice(change.originalRange.start, change.originalRange.end);
    const isActive = activeChangeId === change.id;

    segments.push(
      <span
        key={change.id}
        id={`change-highlight-${change.id}`}
        className={getHighlightClass(change.type, isActive)}
        onClick={(e) => {
          e.stopPropagation();
          onSelectChange(change.id);
        }}
        onMouseEnter={(e) => {
          onHoverChange(change.id);
          const rect = e.currentTarget.getBoundingClientRect();
          setHoveredRect(rect);
          setHoveredChange(change);
        }}
        onMouseLeave={() => {
          onHoverChange(null);
          setHoveredRect(null);
          setHoveredChange(null);
        }}
        role="button"
        tabIndex={0}
        aria-label={`Correction available: ${change.messageShort}`}
      >
        {content}
      </span>
    );

    lastIndex = change.originalRange.end;
  });

  // 3. Remaining text
  if (lastIndex < text.length) {
    segments.push(
      <span key={`text-${lastIndex}`}>
        {text.slice(lastIndex)}
      </span>
    );
  }

  return (
    <>
      <div className="font-mono text-base leading-loose whitespace-pre-wrap text-gray-800">
        {segments}
      </div>
      
      {/* Render tooltip if we have a hovered change and its position */}
      {hoveredChange && hoveredRect && (
        <Tooltip change={hoveredChange} rect={hoveredRect} />
      )}
    </>
  );
};
