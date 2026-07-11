import React from 'react';
import { FlatList, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useSaved } from '@/context/SavedContext';
import { getArticlesByIds } from '@/lib/firestore';
import { ArticleCard } from '@/components/ArticleCard';
import { ArticleCardSkeleton } from '@/components/SkeletonLoader';

export default function SavedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const { savedIds } = useSaved();

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['saved-articles', savedIds.join(',')],
    queryFn: () => getArticlesByIds(savedIds),
    enabled: savedIds.length > 0,
    staleTime: 120_000,
  });

  const topPad = isWeb ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={isLoading ? [] : articles}
        keyExtractor={(a) => a.id}
        renderItem={({ item }) => (
          <ArticleCard article={item} onPress={() => router.push(`/article/${item.id}`)} />
        )}
        ListHeaderComponent={
          <View
            style={[
              styles.header,
              { paddingTop: topPad + 12, borderBottomColor: colors.border },
            ]}
          >
            <Text style={[styles.title, { color: colors.foreground }]}>Saved</Text>
            {articles.length > 0 && (
              <Text style={[styles.count, { color: colors.mutedForeground }]}>
                {articles.length} article{articles.length !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View>{[0, 1, 2].map((i) => <ArticleCardSkeleton key={i} />)}</View>
          ) : (
            <View style={styles.empty}>
              <Feather name="bookmark" size={44} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                No saved articles
              </Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                Tap the bookmark icon on any article to save it for later reading.
              </Text>
            </View>
          )
        }
        ListFooterComponent={<View style={{ height: isWeb ? 34 : insets.bottom + 16 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  title: { fontSize: 28, fontWeight: '700', fontFamily: 'Inter_700Bold' },
  count: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  empty: {
    paddingTop: 80,
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold' },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
});
