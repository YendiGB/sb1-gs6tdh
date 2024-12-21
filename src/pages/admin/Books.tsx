import React, { useState, useEffect } from 'react';
import { db, storage } from '../../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Book } from '../../types/book';
import { uploadFile } from '../../lib/storage';
import BookForm from '../../components/books/BookForm';
import { useBookForm } from '../../hooks/useBookForm';

const Books: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});

  const {
    formData,
    updateField,
    updateLocalizedField,
    updateFile,
    resetForm
  } = useBookForm(editingBook);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      if (!db) throw new Error('Database is not initialized');
      const querySnapshot = await getDocs(collection(db, 'books'));
      const loadedBooks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Book[];
      setBooks(loadedBooks);
      setLoading(false);
    } catch (error) {
      console.error('Error loading books:', error);
      setError('Failed to load books. Please try again.');
      setLoading(false);
    }
  };

  const handleDeleteFile = async (bookId: string, fileType: 'coverUrl' | 'epubUrl', language: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      if (!db || !storage) throw new Error('Database or storage not initialized');

      const bookRef = doc(db, 'books', bookId);
      const book = books.find(b => b.id === bookId);
      if (!book) return;

      // Delete file from storage
      const fileUrl = book[fileType]?.[language];
      if (fileUrl) {
        const fileRef = ref(storage, fileUrl);
        await deleteObject(fileRef);
      }

      // Update book document
      const updatedUrls = { ...book[fileType] };
      delete updatedUrls[language];

      await updateDoc(bookRef, {
        [fileType]: updatedUrls,
        updatedAt: new Date().toISOString()
      });

      await loadBooks();
    } catch (error) {
      console.error('Error deleting file:', error);
      setError('Failed to delete file. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUploadProgress({});

    try {
      if (!db) throw new Error('Database not initialized');

      // Upload files and get URLs
      const coverUrls: { [key: string]: string } = { ...editingBook?.coverUrl };
      const epubUrls: { [key: string]: string } = { ...editingBook?.epubUrl };

      // Upload cover images
      for (const lang of ['en', 'es'] as const) {
        if (formData.coverFiles[lang]) {
          const result = await uploadFile(formData.coverFiles[lang]!, 'covers', {
            onProgress: (progress) => setUploadProgress(prev => ({
              ...prev,
              [`cover_${lang}`]: progress
            }))
          });
          coverUrls[lang] = result.url;
        }
      }

      // Upload EPUB files
      for (const lang of ['en', 'es'] as const) {
        if (formData.epubFiles[lang]) {
          const result = await uploadFile(formData.epubFiles[lang]!, 'books', {
            onProgress: (progress) => setUploadProgress(prev => ({
              ...prev,
              [`epub_${lang}`]: progress
            }))
          });
          epubUrls[lang] = result.url;
        }
      }

      const bookData = {
        title: formData.title,
        author: formData.author,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        membershipAccess: formData.membershipAccess,
        coverUrl: coverUrls,
        epubUrl: epubUrls,
        updatedAt: new Date().toISOString()
      };

      if (editingBook) {
        await updateDoc(doc(db, 'books', editingBook.id), bookData);
      } else {
        bookData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'books'), bookData);
      }

      setIsAddingBook(false);
      setEditingBook(null);
      resetForm();
      await loadBooks();
    } catch (error) {
      console.error('Error saving book:', error);
      setError(error instanceof Error ? error.message : 'Failed to save book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading books...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Books Management</h1>
        <button
          onClick={() => setIsAddingBook(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <Plus size={20} />
          Add Book
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {books.map((book) => (
          <div key={book.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{book.title.en}</h3>
                <p className="text-gray-600">{book.author}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingBook(book)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Pencil size={16} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-2">{book.description.en}</p>
            <div className="flex justify-between items-center text-sm">
              <span className="text-primary font-medium">${book.price}</span>
              <span className="text-gray-500">{book.category}</span>
            </div>
          </div>
        ))}
      </div>

      {(isAddingBook || editingBook) && (
        <BookForm
          formData={formData}
          onUpdateField={updateField}
          onUpdateLocalizedField={updateLocalizedField}
          onUpdateFile={updateFile}
          onSubmit={handleSubmit}
          onClose={() => {
            setIsAddingBook(false);
            setEditingBook(null);
            resetForm();
          }}
          loading={Object.keys(uploadProgress).length > 0}
          isEditing={!!editingBook}
          existingFiles={editingBook ? {
            coverUrl: editingBook.coverUrl,
            epubUrl: editingBook.epubUrl
          } : undefined}
          onDeleteFile={editingBook ? 
            (type, lang) => handleDeleteFile(editingBook.id, type, lang) : 
            undefined}
        />
      )}
    </div>
  );
};

export default Books;