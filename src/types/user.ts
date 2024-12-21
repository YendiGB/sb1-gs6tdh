export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  membershipType: 'free' | 'premium' | 'unlimited';
  createdAt: string;
  purchasedBooks: string[];
  purchasedChallenges: string[];
}