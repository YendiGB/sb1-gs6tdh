import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const LoadingOverlay: React.FC = () => {
  const [loadingText, setLoadingText] = useState('Loading book');
  const [dots, setDots] = useState('');

  useEffect(() => {
    const textInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    const messages = [
      'Loading book',
      'Preparing pages',
      'Generating chapters',
      'Almost ready'
    ];
    let currentIndex = 0;

    const messageInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % messages.length;
      setLoadingText(messages[currentIndex]);
    }, 2000);

    return () => {
      clearInterval(textInterval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-6 p-8 max-w-sm">
        <div className="relative w-16 h-16 mx-auto">
          <Loader2 className="w-16 h-16 animate-spin text-primary" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-primary/5" />
          </div>
        </div>
        
        <div>
          <p className="text-gray-600 font-medium">
            {loadingText}
            <span className="inline-block w-6">{dots}</span>
          </p>
          <p className="text-sm text-gray-400 mt-2">
            This may take a few moments
          </p>
        </div>

        <div className="w-48 h-1 bg-gray-100 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-primary/20 animate-pulse rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;