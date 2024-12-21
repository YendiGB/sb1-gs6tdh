import React from 'react';
import { X, Minus, Plus } from 'lucide-react';

interface ReaderSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  lineHeight: number;
  setLineHeight: (height: number) => void;
}

const ReaderSettings: React.FC<ReaderSettingsProps> = ({
  isOpen,
  onClose,
  fontSize,
  setFontSize,
  lineHeight,
  setLineHeight
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose}>
      <div
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Reading Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Size
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Minus size={20} />
              </button>
              <span className="flex-1 text-center">{fontSize}px</span>
              <button
                onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Line Height
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setLineHeight(Math.max(1, lineHeight - 0.1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Minus size={20} />
              </button>
              <span className="flex-1 text-center">{lineHeight.toFixed(1)}</span>
              <button
                onClick={() => setLineHeight(Math.min(2, lineHeight + 0.1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReaderSettings;