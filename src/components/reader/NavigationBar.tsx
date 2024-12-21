import React from 'react';
import { ChevronLeft, ChevronRight, Menu, Bookmark } from 'lucide-react';

interface NavigationBarProps {
  onPrevious: () => void;
  onNext: () => void;
  onToggleChapters: () => void;
  currentChapter?: string;
  progress?: number;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  onPrevious,
  onNext,
  onToggleChapters,
  currentChapter,
  progress = 0
}) => (
  <div className="absolute bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
    <div className="flex items-center justify-between max-w-4xl mx-auto">
      <button
        onClick={onToggleChapters}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Menu size={24} />
      </button>

      <div className="flex-1 mx-8">
        <div className="text-sm text-gray-600 text-center mb-2">
          {currentChapter || 'Reading...'}
        </div>
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onPrevious}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={onNext}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  </div>
);

export default NavigationBar;