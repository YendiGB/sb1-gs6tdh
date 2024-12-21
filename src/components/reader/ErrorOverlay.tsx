import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorOverlayProps {
  message: string;
}

const ErrorOverlay: React.FC<ErrorOverlayProps> = ({ message }) => (
  <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
      <p className="text-red-600">{message}</p>
      <p className="text-sm text-gray-500 mt-2">
        Please try again or contact support if the problem persists.
      </p>
    </div>
  </div>
);

export default ErrorOverlay;