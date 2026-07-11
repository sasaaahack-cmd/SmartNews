import { useQuery } from '@tanstack/react-query';
import {
  getPublishedArticles,
  getBreakingArticles,
  getArticlesByCategory,
  getArticleById,
  searchArticles,
} from '@/lib/firestore';

export function useLatestArticles(count = 20) {
  return useQuery({
    queryKey: ['articles', 'latest', count],
    queryFn: () => getPublishedArticles(count),
    staleTime: 60_000,
  });
}

export function useBreakingArticles() {
  return useQuery({
    queryKey: ['articles', 'breaking'],
    queryFn: getBreakingArticles,
    staleTime: 30_000,
  });
}

export function useArticlesByCategory(category: string) {
  return useQuery({
    queryKey: ['articles', 'category', category],
    queryFn: () => getArticlesByCategory(category),
    staleTime: 60_000,
    enabled: Boolean(category),
  });
}

export function useArticle(id: string) {
  return useQuery({
    queryKey: ['article', id],
    queryFn: () => getArticleById(id),
    staleTime: 120_000,
    enabled: Boolean(id),
  });
}

export function useSearchArticles(searchQuery: string) {
  return useQuery({
    queryKey: ['articles', 'search', searchQuery],
    queryFn: () => searchArticles(searchQuery),
    staleTime: 60_000,
    enabled: searchQuery.length > 1,
  });
}
