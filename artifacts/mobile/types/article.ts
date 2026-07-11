export type ArticleType = 'standard' | 'breaking' | 'photo-gallery' | 'video' | 'live-blog';
export type ArticleStatus = 'published' | 'draft';

export interface Article {
  id: string;
  title: string;
  subhead?: string;
  byline: string;
  body: string;
  imageUrl?: string;
  category: string;
  tags: string[];
  slug: string;
  type: ArticleType;
  isBreaking: boolean;
  status: ArticleStatus;
  publishedAt: Date;
  readTimeMinutes: number;
  reads: number;
  shares: number;
}

export interface Comment {
  id: string;
  articleId: string;
  userId: string;
  userDisplayName: string;
  body: string;
  createdAt: Date;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'reader' | 'admin';
  savedArticleIds: string[];
  followedCategories: string[];
  createdAt: Date;
}

export const CATEGORIES = [
  'World',
  'Politics',
  'Business',
  'Technology',
  'Science',
  'Health',
  'Sports',
  'Entertainment',
  'Opinion',
  'Local',
] as const;

export type Category = (typeof CATEGORIES)[number];
