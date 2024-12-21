import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import type { Book } from '../types/book';

interface UseBooksOptions {
  userId?: string;
  onlyPurchased?: boolean;
}

export function useBooks({ userId, onlyPurchased = false }: UseBooksOptions = {}) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBooks();
  }, [userId, onlyPurchased]);

  const normalizeUrl = (url: any): { [key: string]: string } | undefined => {
    if (!url) return undefined;
    
    // If it's already a properly structured object
    if (typeof url === 'object' && !Array.isArray(url)) {
      const normalized: { [key: string]: string } = {};
      Object.entries(url).forEach(([lang, value]) => {
        if (typeof value === 'string') {
          normalized[lang] = value;
        } else if (Array.isArray(value)) {
          normalized[lang] = value.join('');
        }
      });
      return normalized;
    }
    
    // If it's an array, convert to string and use as default
    if (Array.isArray(url)) {
      const urlString = url.join('');
      return { en: urlString, es: urlString };
    }
    
    // If it's a string, use as default
    if (typeof url === 'string') {
      return { en: url, es: url };
    }
    
    return undefined;
  };

  const loadBooks = async () => {
    try {
      if (!db) {
        throw new Error('Database is not initialized');
      }

      console.log('Loading books from database...');
      const booksQuery = query(collection(db, 'books'));
      const booksSnapshot = await getDocs(booksQuery);
      
      const loadedBooks = booksSnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Normalize the book data
        const book: Book = {
          id: doc.id,
          title: typeof data.title === 'string' ? { en: data.title, es: data.title } : data.title,
          author: data.author,
          description: typeof data.description === 'string' ? { en: data.description, es: data.description } : data.description,
          category: data.category,
          price: data.price,
          membershipAccess: data.membershipAccess,
          coverUrl: normalizeUrl(data.coverUrl) || {},
          epubUrl: normalizeUrl(data.epubUrl) || {},
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };

        return book;
      });

      console.log('Loaded books:', loadedBooks);
      setBooks(loadedBooks);
      setLoading(false);
    } catch (error) {
      console.error('Error loading books:', error);
      setError(error instanceof Error ? error.message : 'Failed to load books');
      setLoading(false);
    }
  };

  const refreshBooks = () => {
    setLoading(true);
    loadBooks();
  };

  return {
    books,
    loading,
    error,
    refreshBooks
  };
}