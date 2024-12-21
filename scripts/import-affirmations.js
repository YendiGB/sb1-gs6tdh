const fs = require('fs');
const { parse } = require('csv-parse');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const app = initializeApp({
  projectId: process.env.VITE_FIREBASE_PROJECT_ID
});

const db = getFirestore(app);

async function importAffirmations() {
  const categories = new Map();
  const affirmations = [];

  // Read and parse CSV
  const parser = fs
    .createReadStream('data/affirmations.csv')
    .pipe(parse({ columns: true, delimiter: ',' }));

  for await (const record of parser) {
    const categoryId = record.Categoria
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Add category if not exists
    if (!categories.has(categoryId)) {
      categories.set(categoryId, {
        id: categoryId,
        name: {
          en: record.Categoria,
          es: record.Categoria
        },
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // Add affirmation
    affirmations.push({
      text: {
        es: record.Frase,
        en: '' // You'll need to provide English translations
      },
      category: categoryId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  // Import categories
  const categoriesBatch = db.batch();
  for (const category of categories.values()) {
    const ref = db.collection('affirmationCategories').doc(category.id);
    categoriesBatch.set(ref, category);
  }
  await categoriesBatch.commit();
  console.log(`✅ Imported ${categories.size} categories`);

  // Import affirmations in batches of 500
  const batchSize = 500;
  for (let i = 0; i < affirmations.length; i += batchSize) {
    const batch = db.batch();
    const chunk = affirmations.slice(i, i + batchSize);

    chunk.forEach(affirmation => {
      const ref = db.collection('affirmations').doc();
      batch.set(ref, affirmation);
    });

    await batch.commit();
    console.log(`✅ Imported affirmations ${i + 1} to ${i + chunk.length}`);
  }

  console.log('✅ Import completed successfully');
}

importAffirmations().catch(console.error);