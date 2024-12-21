export interface LocalizedContent {
  en: string;
  es: string;
  [key: string]: string;
}

export interface AffirmationImage {
  url: string;
  width: number;
  height: number;
  aspectRatio: string; // e.g., "square", "portrait", "landscape"
  style?: string; // Optional style reference
}

export interface LocalizedImages {
  en: AffirmationImage[];
  es: AffirmationImage[];
  [key: string]: AffirmationImage[];
}

export interface AffirmationStyle {
  id: string;
  name: LocalizedContent;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  textAlign: string;
  color: string;
  backgroundColor: string;
  backgroundImage?: string;
  padding: string;
}

export interface Affirmation {
  id: string;
  text: LocalizedContent;
  category: string;
  images: LocalizedImages;
  styles?: AffirmationStyle[];
  createdAt: string;
  updatedAt: string;
}

export interface AffirmationCategory {
  id: string;
  name: LocalizedContent;
  description?: LocalizedContent;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserAffirmationPreferences {
  userId: string;
  selectedCategories: string[];
  preferredStyle?: string;
  lastAffirmationDate?: string;
  lastAffirmationId?: string;
  updatedAt: string;
}

export interface BulkImportRow {
  es: string;
  en: string;
  category: string;
  categoryTranslated: string;
}