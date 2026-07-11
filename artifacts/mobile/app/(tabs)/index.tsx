import React, { useState, useCallback } from 'react';
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useLatestArticles, useBreakingArticles } from '@/hooks/useArticles';
import { ArticleCard } from '@/components/ArticleCard';
import { ArticleCardFeatured } from '@/components/ArticleCardFeatured';
import { BreakingBanner } from '@/components/BreakingBanner';
import { CategoryChip } from '@/components/CategoryChip';
import { ArticleCardSkeleton, FeaturedCardSkeleton } from '@/components/SkeletonLoader';
import { CATEGORIES } from '@/types/article';

const ALL_CATS = ['All', ...CATEGORIES] as const;

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [refreshing, setRefreshing] = useState(false);

  const { data: breaking = [] } = useBreakingArticles();
  const { data: articles = [], isLoading, refetch } = useLatestArticles(50);

  const filtered =
    selectedCat === 'All' ? articles : articles.filter((a) => a.category === selectedCat);
  const featured = filtered[0];
  const rest = filtered.slice(1);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const goTo = (id: string) => router.push(`/article/${id}`);

  const ListHeader = (
    <View>
      {/* ── Brand topbar ── */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
            paddingTop: isWeb ? 67 : insets.top + 4,
          },
        ]}
      >
        <Text style={[styles.wordmark, { color: colors.foreground }]}>SmartNews</Text>
      </View>

      {/* ── Breaking banner ── */}
      {breaking.length > 0 && (
        <BreakingBanner articles={breaking} onPress={(a) => goTo(a.id)} />
      )}

      {/* ── Category filter row ── */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[...ALL_CATS]}
        keyExtractor={(c) => c}
        contentContainerStyle={styles.catList}
        style={[styles.catRow, { borderBottomColor: colors.border }]}
        renderItem={({ item }) => (
          <CategoryChip
            label={item}
            selected={selectedCat === item}
            onPress={() => setSelectedCat(item)}
          />
        )}
      />

      {/* ── Lead story / skeleton ── */}
      {isLoading ? (
        <FeaturedCardSkeleton />
      ) : featured ? (
        <ArticleCardFeatured article={featured} onPress={() => goTo(featured.id)} />
      ) : (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            No articles published yet. Check back soon.
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      data={isLoading ? [] : rest}
      keyExtractor={(a) => a.id}
      renderItem={({ item }) => <ArticleCard article={item} onPress={() => goTo(item.id)} />}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={
        isLoading ? (
          <View>{[0, 1, 2, 3, 4].map((i) => <ArticleCardSkeleton key={i} />)}</View>
        ) : null
      }
      ListFooterComponent={<View style={{ height: isWeb ? 34 : insets.bottom + 16 }} />}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.accent}
          colors={[colors.accent]}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  wordmark: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
  },
  catRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
  },
  catList: { paddingHorizontal: 16, gap: 8 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
