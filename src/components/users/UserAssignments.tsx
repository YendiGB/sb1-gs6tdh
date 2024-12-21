import React, { useState, useEffect } from 'react';
import { X, Search, Check } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { Challenge } from '../../types/challenge';
import type { Book } from '../../types/book';

interface UserAssignmentsProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  purchasedBooks: string[];
  purchasedChallenges: string[];
  onAssign: (type: 'book' | 'challenge', ids: string[]) => Promise<void>;
}

const UserAssignments: React.FC<UserAssignmentsProps> = ({
  isOpen,
  onClose,
  userId,
  purchasedBooks,
  purchasedChallenges,
  onAssign
}) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<Set<string>>(new Set(purchasedBooks));
  const [selectedChallenges, setSelectedChallenges] = useState<Set<string>>(new Set(purchasedChallenges));
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'books' | 'challenges'>('books');

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      if (!db) throw new Error('Database is not initialized');

      // Load books
      const booksSnapshot = await getDocs(collection(db, 'books'));
      const loadedBooks = booksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Book[];
      setBooks(loadedBooks);

      // Load challenges
      const challengesSnapshot = await getDocs(collection(db, 'challenges'));
      const loadedChallenges = challengesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Challenge[];
      setChallenges(loadedChallenges);

      setLoading(false);
    } catch (error) {
      console.error('Error loading content:', error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await onAssign('book', Array.from(selectedBooks));
      await onAssign('challenge', Array.from(selectedChallenges));
      onClose();
    } catch (error) {
      console.error('Error saving assignments:', error);
    }
  };

  if (!isOpen) return null;

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredChallenges = challenges.filter(challenge =>
    challenge.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Assign Content</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('books')}
            className={`flex-1 px-6 py-3 text-sm font-medium ${
              activeTab === 'books'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Books
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`flex-1 px-6 py-3 text-sm font-medium ${
              activeTab === 'challenges'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Challenges
          </button>
        </div>

        <div className="p-6">
          <div className="relative mb-4">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="overflow-y-auto max-h-[400px]">
            {activeTab === 'books' ? (
              <div className="space-y-2">
                {filteredBooks.map((book) => (
                  <label
                    key={book.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {book.coverUrl ? (
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-16 bg-gray-100 rounded" />
                      )}
                      <div>
                        <h3 className="font-medium">{book.title}</h3>
                        <p className="text-sm text-gray-500">{book.author}</p>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={selectedBooks.has(book.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedBooks);
                          if (e.target.checked) {
                            newSelected.add(book.id);
                          } else {
                            newSelected.delete(book.id);
                          }
                          setSelectedBooks(newSelected);
                        }}
                      />
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedBooks.has(book.id)
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300'
                      }`}>
                        {selectedBooks.has(book.id) && <Check size={14} />}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredChallenges.map((challenge) => (
                  <label
                    key={challenge.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {challenge.thumbnail ? (
                        <img
                          src={challenge.thumbnail}
                          alt={challenge.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded" />
                      )}
                      <div>
                        <h3 className="font-medium">{challenge.title}</h3>
                        <p className="text-sm text-gray-500">{challenge.duration} days</p>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={selectedChallenges.has(challenge.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedChallenges);
                          if (e.target.checked) {
                            newSelected.add(challenge.id);
                          } else {
                            newSelected.delete(challenge.id);
                          }
                          setSelectedChallenges(newSelected);
                        }}
                      />
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedChallenges.has(challenge.id)
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300'
                      }`}>
                        {selectedChallenges.has(challenge.id) && <Check size={14} />}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t mt-auto">
          <button
            onClick={handleSave}
            className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Save Assignments
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserAssignments;