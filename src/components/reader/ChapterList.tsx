import React from 'react';
import { X } from 'lucide-react';
import type { NavItem } from 'epubjs';

interface ChapterListProps {
  chapters: NavItem[];
  currentChapter?: string;
  onSelectChapter: (href: string) => void;
  onClose: () => void;
}

const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  currentChapter,
  onSelectChapter,
  onClose
}) => (
  <div className="fixed inset-0 z-50 bg-black/50">
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-lg">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Chapters</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="overflow-y-auto h-[calc(100vh-64px)]">
        {chapters.map((chapter, index) => (
          <button
            key={chapter.href}
            onClick={() => {
              onSelectChapter(chapter.href);
              onClose();
            }}
            className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
              chapter.href === currentChapter ? 'bg-primary/5 text-primary' : ''
            }`}
          >
            <div className="text-sm font-medium">
              Chapter {index + 1}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {chapter.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default ChapterList;