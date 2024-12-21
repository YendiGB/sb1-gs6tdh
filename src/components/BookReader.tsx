import React, { useEffect, useRef, useState, useCallback } from 'react';
import ePub, { Book, Rendition, NavItem } from 'epubjs';
import { Menu } from 'lucide-react';
import { 
  getBookUrl, 
  createRendition, 
  setupKeyboardNavigation,
  getChapters,
  calculateProgress,
  updateReaderStyles
} from '../lib/epub';
import LoadingOverlay from './reader/LoadingOverlay';
import ErrorOverlay from './reader/ErrorOverlay';
import ChapterList from './reader/ChapterList';
import NavigationBar from './reader/NavigationBar';

interface BookReaderProps {
  url: string;
  fontSize: number;
  lineHeight: number;
}

const BookReader: React.FC<BookReaderProps> = ({ url, fontSize, lineHeight }) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<Book | null>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const resizeTimeoutRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [chapters, setChapters] = useState<NavItem[]>([]);
  const [currentChapter, setCurrentChapter] = useState<string>();
  const [showChapters, setShowChapters] = useState(false);
  const lastLocationRef = useRef<string | null>(null);

  // Handle resize with debouncing
  const handleResize = useCallback(() => {
    if (!renditionRef.current || !viewerRef.current) return;

    if (resizeTimeoutRef.current) {
      window.clearTimeout(resizeTimeoutRef.current);
    }

    resizeTimeoutRef.current = window.setTimeout(() => {
      try {
        if (renditionRef.current && viewerRef.current) {
          const { clientWidth, clientHeight } = viewerRef.current;
          renditionRef.current.resize(clientWidth, clientHeight);
        }
      } catch (error) {
        console.warn('Resize error:', error);
      }
      resizeTimeoutRef.current = null;
    }, 250);
  }, []);

  // Set up resize observer
  useEffect(() => {
    if (!viewerRef.current) return;

    const element = viewerRef.current;
    const resizeObserver = new ResizeObserver(() => {
      if (!resizeTimeoutRef.current) {
        handleResize();
      }
    });

    resizeObserver.observe(element);

    return () => {
      if (resizeTimeoutRef.current) {
        window.clearTimeout(resizeTimeoutRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [handleResize]);

  // Load saved progress on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem(`book-progress-${url}`);
    if (savedLocation) {
      lastLocationRef.current = savedLocation;
    }
  }, [url]);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle style updates without reloading
  useEffect(() => {
    if (renditionRef.current) {
      updateReaderStyles(renditionRef.current, { fontSize, lineHeight });
    }
  }, [fontSize, lineHeight]);

  useEffect(() => {
    if (!mounted) return;

    const initializeReader = async () => {
      if (!viewerRef.current) {
        setError('Viewer reference not found');
        setLoading(false);
        return;
      }

      if (!url) {
        setError('No book URL provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Clean up previous instances
        if (renditionRef.current) {
          renditionRef.current.destroy();
        }
        if (bookRef.current) {
          bookRef.current.destroy();
        }

        // Get book URL and initialize
        const bookUrl = await getBookUrl(url);
        const book = ePub(bookUrl, { openAs: 'epub' });
        bookRef.current = book;

        // Wait for book to be ready
        await book.ready;

        // Generate locations for progress calculation
        await book.locations.generate(1000);

        // Create and setup rendition
        const rendition = createRendition(book, viewerRef.current, { fontSize, lineHeight });
        renditionRef.current = rendition;

        // Set up event handlers
        setupKeyboardNavigation(rendition);

        // Load chapters after rendition is created
        const bookChapters = await getChapters(book);
        setChapters(bookChapters);

        // Track location changes
        rendition.on('locationChanged', (location) => {
          if (location?.start) {
            // Save progress
            if (location.start.cfi) {
              localStorage.setItem(`book-progress-${url}`, location.start.cfi);
              lastLocationRef.current = location.start.cfi;
            }

            if (location.start.href) {
              // Update current chapter
              const chapter = bookChapters.find(c => 
                c.href && location.start.href && 
                location.start.href.includes(c.href)
              );
              if (chapter?.href) {
                setCurrentChapter(chapter.href);
              }
            }
          }
        });

        // Display last location or first page
        if (lastLocationRef.current) {
          await rendition.display(lastLocationRef.current);
        } else {
          await rendition.display();
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing book reader:', error);
        setError(error instanceof Error ? error.message : 'Failed to load book');
        setLoading(false);
      }
    };

    initializeReader();

    return () => {
      if (renditionRef.current) {
        renditionRef.current.destroy();
      }
      if (bookRef.current) {
        bookRef.current.destroy();
      }
    };
  }, [url, mounted, fontSize, lineHeight]);

  const handleChapterSelect = (href: string) => {
    if (href && renditionRef.current) {
      renditionRef.current.display(href);
      setShowChapters(false);
    }
  };

  const handlePrevious = () => {
    if (renditionRef.current) {
      renditionRef.current.prev();
    }
  };

  const handleNext = () => {
    if (renditionRef.current) {
      renditionRef.current.next();
    }
  };

  return (
    <div className="relative flex-1">
      {loading && <LoadingOverlay />}
      {error && <ErrorOverlay message={error} />}
      <div 
        ref={viewerRef} 
        className="absolute inset-0 bg-gray-50"
        tabIndex={0}
      />
      {!loading && !error && (
        <>
          <button
            onClick={() => setShowChapters(true)}
            className="fixed top-4 right-4 z-10 p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
            title="Show chapters"
          >
            <Menu size={20} />
          </button>
          {showChapters && (
            <ChapterList
              chapters={chapters}
              currentChapter={currentChapter}
              onSelectChapter={handleChapterSelect}
              onClose={() => setShowChapters(false)}
            />
          )}
          <NavigationBar
            onPrevious={handlePrevious}
            onNext={handleNext}
            onToggleChapters={() => setShowChapters(true)}
            currentChapter={currentChapter}
            progress={bookRef.current && lastLocationRef.current ? calculateProgress(bookRef.current, lastLocationRef.current) : 0}
          />
        </>
      )}
    </div>
  );
};

export default BookReader;