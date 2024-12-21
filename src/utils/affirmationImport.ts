import { db } from '../lib/firebase';
import { collection, doc, writeBatch, getDocs } from 'firebase/firestore';
import type { BulkImportRow, AffirmationCategory, Affirmation } from '../types/affirmation';

export async function processCsvData(data: BulkImportRow[]) {
  if (!db) throw new Error('Database not initialized');

  const categories = new Map<string, AffirmationCategory>();
  const affirmations: Partial<Affirmation>[] = [];

  // Process categories first
  for (const row of data) {
    const categoryId = createCategoryId(row.category);
    
    if (!categories.has(categoryId)) {
      categories.set(categoryId, {
        id: categoryId,
        name: {
          es: row.category,
          en: row.categoryTranslated
        },
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // Create affirmation
    affirmations.push({
      text: {
        es: row.es,
        en: row.en
      },
      category: categoryId,
      images: { en: [], es: [] }, // Initialize empty image arrays
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  // Import in batches
  try {
    // Import categories first
    const categoriesBatch = writeBatch(db);
    for (const category of categories.values()) {
      const ref = doc(db, 'affirmationCategories', category.id);
      categoriesBatch.set(ref, category);
    }
    await categoriesBatch.commit();
    console.log(`✅ Imported ${categories.size} categories`);

    // Import affirmations in batches of 500
    const batchSize = 500;
    for (let i = 0; i < affirmations.length; i += batchSize) {
      const batch = writeBatch(db);
      const chunk = affirmations.slice(i, i + batchSize);

      chunk.forEach(affirmation => {
        const ref = doc(collection(db, 'affirmations'));
        batch.set(ref, affirmation);
      });

      await batch.commit();
      console.log(`✅ Imported affirmations ${i + 1} to ${i + chunk.length}`);
    }

    return {
      success: true,
      categoriesCount: categories.size,
      affirmationsCount: affirmations.length
    };
  } catch (error) {
    console.error('Import failed:', error);
    throw new Error('Failed to import data');
  }
}

function createCategoryId(category: string): string {
  return category
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function validateCsvData(data: any[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const requiredColumns = ['es', 'en', 'category', 'categoryTranslated'];

  // Check if data is empty
  if (!data.length) {
    errors.push('CSV file is empty');
    return { valid: false, errors };
  }

  // Check for required columns
  const firstRow = data[0];
  for (const column of requiredColumns) {
    if (!firstRow.hasOwnProperty(column)) {
      errors.push(`Missing required column: ${column}`);
    }
  }

  // Validate each row
  data.forEach((row, index) => {
    if (!row.es?.trim()) {
      errors.push(`Row ${index + 1}: Missing Spanish text`);
    }
    if (!row.en?.trim()) {
      errors.push(`Row ${index + 1}: Missing English text`);
    }
    if (!row.category?.trim()) {
      errors.push(`Row ${index + 1}: Missing category`);
    }
    if (!row.categoryTranslated?.trim()) {
      errors.push(`Row ${index + 1}: Missing category translation`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}