import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Search, BookOpen, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBooks } from '../hooks/useBooks';
import { useLocalization } from '../hooks/useLocalization';
import BookReader from '../components/BookReader';
import ReaderSettings from '../components/ReaderSettings';
import type { Book } from '../types/book';

const Read: React.FC = () => {
  const { t } = useTranslation();
  const { getLocalizedContent, getLocalizedUrl } = useLocalization();
  const { books, loading, error } = useBooks();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.5);

  const filteredBooks = books.filter(book =>
    getLocalizedContent(book.title).toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">{t('common.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (selectedBook) {
    const bookUrl = getLocalizedUrl(selectedBook.epubUrl);
    
    if (!bookUrl) {
      return (
        <div className="h-screen flex flex-col">
          <header className="flex items-center justify-between p-4 border-b">
            <button
              onClick={() => setSelectedBook(null)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-lg font-semibold">{getLocalizedContent(selectedBook.title)}</h1>
            <div className="w-10" /> {/* Spacer for alignment */}
          </header>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">No book file available for the current language</p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-screen flex flex-col">
        <header className="flex items-center justify-between p-4 border-b">
          <button
            onClick={() => setSelectedBook(null)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold">{getLocalizedContent(selectedBook.title)}</h1>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Settings size={24} />
          </button>
        </header>
        
        <BookReader
          url={bookUrl}
          fontSize={fontSize}
          lineHeight={lineHeight}
        />

        <ReaderSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          fontSize={fontSize}
          setFontSize={setFontSize}
          lineHeight={lineHeight}
          setLineHeight={setLineHeight}
        />
      </div>
    );
  }

  return (
    <div className="p-4">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold">Library</h1>
        </div>
      </header>

      <div className="relative mb-6">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search books..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredBooks.map((book) => (
          <div
            key={book.id}
            onClick={() => setSelectedBook(book)}
            className="cursor-pointer group"
          >
            <div className="aspect-[2/3] relative rounded-lg overflow-hidden mb-2">
              {book.coverUrl ? (
                <img
                  src={getLocalizedUrl(book.coverUrl)}
                  alt={getLocalizedContent(book.title)}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                  <BookOpen size={24} className="text-primary" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <BookOpen size={20} className="text-white" />
              </div>
            </div>
            <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-2">
              {getLocalizedContent(book.title)}
            </h3>
            <p className="text-xs text-gray-600 mb-1">{book.author}</p>
            <span className="text-xs text-primary block">{book.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Read;