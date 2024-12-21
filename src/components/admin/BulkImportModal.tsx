import React, { useState, useRef } from 'react';
import { X, Upload, AlertCircle, Check } from 'lucide-react';
import Papa from 'papaparse';
import { processCsvData, validateCsvData } from '../../utils/affirmationImport';
import type { BulkImportRow } from '../../types/affirmation';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<BulkImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setValidationErrors([]);

    Papa.parse(selectedFile, {
      header: true,
      complete: (results) => {
        const { valid, errors } = validateCsvData(results.data);
        if (!valid) {
          setValidationErrors(errors);
          return;
        }
        setPreview(results.data as BulkImportRow[]);
      },
      error: (error) => {
        setError(`Failed to parse CSV: ${error.message}`);
      }
    });
  };

  const handleImport = async () => {
    if (!preview.length) return;

    try {
      setImporting(true);
      setError(null);
      
      const result = await processCsvData(preview);
      console.log('Import completed:', result);
      
      onSuccess();
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Bulk Import Affirmations</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
              {file ? (
                <div className="text-center">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {preview.length} rows found
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 text-primary text-sm hover:underline"
                  >
                    Choose a different file
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-2 text-gray-600 hover:text-gray-800"
                >
                  <Upload size={24} />
                  <span>Choose CSV file</span>
                </button>
              )}
            </div>
          </div>

          {validationErrors.length > 0 && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
              <div className="flex items-center gap-2 font-medium mb-2">
                <AlertCircle size={20} />
                Validation Errors
              </div>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {preview.length > 0 && !validationErrors.length && (
            <div>
              <h3 className="font-medium mb-2">Preview</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Spanish</th>
                      <th className="px-4 py-2 text-left">English</th>
                      <th className="px-4 py-2 text-left">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {preview.slice(0, 5).map((row, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">{row.es}</td>
                        <td className="px-4 py-2">{row.en}</td>
                        <td className="px-4 py-2">{row.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.length > 5 && (
                  <div className="px-4 py-2 bg-gray-50 text-sm text-gray-500">
                    And {preview.length - 5} more rows...
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!preview.length || validationErrors.length > 0 || importing}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              {importing ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Importing...
                </>
              ) : (
                <>
                  <Check size={20} />
                  Import {preview.length} Affirmations
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;