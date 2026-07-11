import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Article } from '@/types/article';

function toArticle(id: string, data: Record<string, unknown>): Article {
  const publishedAt =
    data.publishedAt instanceof Timestamp
      ? (data.publishedAt as Timestamp).toDate()
      : data.publishedAt instanceof Date
        ? (data.publishedAt as Date)
        : new Date();

  return {
    id,
    title: (data.title as string) ?? '',
    subhead: data.subhead as string | undefined,
    byline: (data.byline as string) ?? 'SmartNews Staff',
    body: (data.body as string) ?? '',
    imageUrl: data.imageUrl as string | undefined,
    category: (data.category as string) ?? 'General',
    tags: (data.tags as string[]) ?? [],
    slug: (data.slug as string) ?? id,
    type: (data.type as Article['type']) ?? 'standard',
    isBreaking: Boolean(data.isBreaking),
    status: (data.status as Article['status']) ?? 'published',
    publishedAt,
    readTimeMinutes: (data.readTimeMinutes as number) ?? 1,
    reads: (data.reads as number) ?? 0,
    shares: (data.shares as number) ?? 0,
  };
}

export async function getPublishedArticles(limitCount = 20): Promise<Article[]> {
  try {
    const q = query(
      collection(db, 'articles'),
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc'),
      limit(limitCount),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => toArticle(d.id, d.data() as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function getBreakingArticles(): Promise<Article[]> {
  try {
    const q = query(
      collection(db, 'articles'),
      where('status', '==', 'published'),
      where('isBreaking', '==', true),
      orderBy('publishedAt', 'desc'),
      limit(5),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => toArticle(d.id, d.data() as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function getArticlesByCategory(category: string, limitCount = 15): Promise<Article[]> {
  try {
    const q = query(
      collection(db, 'articles'),
      where('status', '==', 'published'),
      where('category', '==', category),
      orderBy('publishedAt', 'desc'),
      limit(limitCount),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => toArticle(d.id, d.data() as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function getArticleById(id: string): Promise<Article | null> {
  try {
    const snap = await getDoc(doc(db, 'articles', id));
    if (!snap.exists()) return null;
    return toArticle(snap.id, snap.data() as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function getArticlesByIds(ids: string[]): Promise<Article[]> {
  if (!ids.length) return [];
  try {
    const results = await Promise.all(ids.map((id) => getArticleById(id)));
    return results.filter((a): a is Article => a !== null);
  } catch {
    return [];
  }
}

export async function searchArticles(searchQuery: string): Promise<Article[]> {
  // Firestore doesn't support full-text search natively;
  // we fetch recent articles and filter client-side.
  const all = await getPublishedArticles(100);
  const q = searchQuery.toLowerCase();
  return all.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q)) ||
      (a.subhead ?? '').toLowerCase().includes(q),
  );
}
