import { Book, Rendition, NavItem } from 'epubjs';
import { storage } from './firebase';
import { ref, getDownloadURL } from 'firebase/storage';

export interface ReaderConfig {
  fontSize: number;
  lineHeight: number;
}

export async function getBookUrl(url: string): Promise<string> {
  try {
    if (url.startsWith('http')) {
      return url;
    }
    
    if (!storage) {
      throw new Error('Storage is not initialized');
    }

    const storageRef = ref(storage, url);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.error('Error getting book URL:', error);
    throw new Error('Failed to get book URL');
  }
}

export function createRendition(
  book: Book, 
  element: HTMLElement, 
  config: ReaderConfig
): Rendition {
  const rendition = book.renderTo(element, {
    width: '100%',
    height: '100%',
    spread: 'none',
    flow: 'scrolled-doc',
    allowScriptedContent: false,
    ignoreClass: 'annotator-hl',
    manager: 'continuous'
  });

  updateReaderStyles(rendition, config);
  return rendition;
}

export function updateReaderStyles(rendition: Rendition, config: ReaderConfig): void {
  rendition.themes.override('font-size', '');
  rendition.themes.override('line-height', '');
  
  rendition.themes.default({
    'body': {
      'padding': '20px',
      'max-width': '800px',
      'margin': '0 auto',
      'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      'font-size': `${config.fontSize}px !important`,
      'line-height': `${config.lineHeight} !important`
    },
    'p': {
      'margin': '0 0 1em 0',
      'text-align': 'justify',
      'line-height': 'inherit',
      'font-size': 'inherit'
    },
    'h1, h2, h3, h4, h5, h6': {
      'margin': '2em 0 1em 0',
      'font-weight': 'bold',
      'line-height': '1.2',
      'font-size': 'larger'
    },
    'img': {
      'max-width': '100%',
      'height': 'auto'
    }
  });

  rendition.views().forEach(view => {
    view.pane?.render();
  });
}

export function setupKeyboardNavigation(rendition: Rendition): void {
  rendition.on('keyup', (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') rendition.prev();
    if (event.key === 'ArrowRight') rendition.next();
    if (event.key === 'PageUp') rendition.prev();
    if (event.key === 'PageDown') rendition.next();
    if (event.key === 'Home') rendition.display(0);
    if (event.key === 'End') rendition.display(-1);
  });
}

export async function getChapters(book: Book): Promise<NavItem[]> {
  try {
    // Ensure book is loaded
    if (!book.loaded.navigation) {
      await book.loaded.navigation;
    }
    if (!book.loaded.spine) {
      await book.loaded.spine;
    }

    let chapters: NavItem[] = [];

    // Try to get chapters from the table of contents
    if (book.navigation?.toc?.length > 0) {
      chapters = book.navigation.toc.map(item => ({
        ...item,
        label: cleanChapterTitle(item.label || ''),
        href: ensureValidHref(item.href || '', book)
      }));
    }

    // If no TOC, try to get chapters from spine
    if (chapters.length === 0 && book.spine) {
      chapters = book.spine.spineItems.map((item, index) => ({
        id: `spine-${index}`,
        href: item.href,
        label: `Chapter ${index + 1}`,
        subitems: []
      }));
    }

    // Try to extract better titles from content
    const enhancedChapters = await Promise.all(
      chapters.map(async (chapter, index) => {
        if (!chapter.label || chapter.label === `Chapter ${index + 1}`) {
          const title = await extractChapterTitle(book, chapter.href);
          return {
            ...chapter,
            label: title || `Chapter ${index + 1}`
          };
        }
        return chapter;
      })
    );

    return enhancedChapters;
  } catch (error) {
    console.error('Error loading chapters:', error);
    // Return basic chapter structure as fallback
    return book.spine.spineItems.map((item, index) => ({
      id: `fallback-${index}`,
      href: item.href,
      label: `Chapter ${index + 1}`,
      subitems: []
    }));
  }
}

async function extractChapterTitle(book: Book, href: string): Promise<string> {
  try {
    if (!href) return '';

    const section = book.spine.get(href);
    if (!section) return '';

    const content = await section.load();
    if (!content) return '';

    const doc = new DOMParser().parseFromString(content, 'text/html');

    // Try different selectors to find the title
    const selectors = [
      'h1:first-of-type',
      'h2:first-of-type',
      'title',
      '.chapter-title',
      '.title',
      '[role="heading"]'
    ];

    for (const selector of selectors) {
      const element = doc.querySelector(selector);
      if (element?.textContent) {
        const title = cleanChapterTitle(element.textContent);
        if (title) return title;
      }
    }

    return '';
  } catch (error) {
    console.warn('Error extracting chapter title:', error);
    return '';
  }
}

function cleanChapterTitle(title: string): string {
  if (!title) return '';
  
  return title
    .replace(/^\s*Chapter\s+\d+[:.]\s*/i, '')
    .replace(/^\d+[:.]\s*/, '')
    .replace(/^[IVX]+[:.]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function ensureValidHref(href: string, book: Book): string {
  if (!href) return '';

  // Remove fragment identifier and decode URI components
  const baseHref = decodeURIComponent(href.split('#')[0]);
  
  // Check if href exists in spine
  const spineItem = book.spine.get(baseHref);
  if (spineItem) {
    return spineItem.href;
  }

  // Try to find matching spine item
  const matchingItem = book.spine.spineItems.find(item => 
    item.href.endsWith(baseHref) || baseHref.endsWith(item.href)
  );

  return matchingItem ? matchingItem.href : href;
}

export function calculateProgress(book: Book, currentCfi: string): number {
  try {
    if (!book.locations?.total || !currentCfi) {
      return 0;
    }

    const percentage = book.locations.percentageFromCfi(currentCfi);
    return typeof percentage === 'number' && !isNaN(percentage)
      ? Math.round(percentage * 100)
      : 0;
  } catch (error) {
    console.error('Error calculating progress:', error);
    return 0;
  }
}

export function isValidCfi(book: Book, cfi: string): boolean {
  try {
    return book.spine.get(cfi) !== null;
  } catch {
    return false;
  }
}