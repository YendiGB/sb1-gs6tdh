export interface LocalizedContent {
  en: string;
  es: string;
  [key: string]: string;
}

export interface Book {
  id: string;
  title: LocalizedContent;
  author: string;
  description: LocalizedContent;
  category: string;
  price: number;
  membershipAccess: ('free' | 'premium' | 'unlimited')[];
  coverUrl: {
    en?: string;
    es?: string;
    [key: string]: string | undefined;
  };
  epubUrl: {
    en?: string;
    es?: string;
    [key: string]: string | undefined;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BookFormData {
  title: LocalizedContent;
  author: string;
  description: LocalizedContent;
  category: string;
  price: string;
  membershipAccess: ('free' | 'premium' | 'unlimited')[];
  coverFiles: {
    en: File | null;
    es: File | null;
  };
  epubFiles: {
    en: File | null;
    es: File | null;
  };
}