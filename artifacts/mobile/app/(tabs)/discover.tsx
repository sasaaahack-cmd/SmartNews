import React, { useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useSearchArticles, useArticlesByCategory } from '@/hooks/useArticles';
import { ArticleCard } from '@/components/ArticleCard';
import { CategoryChip } from '@/components/CategoryChip';
import { ArticleCardSkeleton } from '@/components/SkeletonLoader';
import { CATEGORIES } from '@/types/article';

export default function DiscoverScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('');

  const { data: searchResults = [], isLoading: isSearching } = useSearchArticles(query);
  const { data: catArticles = [], isLoading: isCatLoading } = useArticlesByCategory(cat);

  const searching = query.length > 1;
  const articles = searching ? searchResults : cat ? catArticles : [];
  const isLoading = searching ? isSearching : cat ? isCatLoading : false;
  const hasQuery = searching || Boolean(cat);

  const topPad = isWeb ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Header ── */}
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 12, borderBottomColor: colors.border },
        ]}
      >
        {/* Search bar */}
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.secondary, borderColor: colors.border },
          ]}
        >
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search SmartNews…"
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={(t) => { setQuery(t); setCat(''); }}
            returnKeyType="search"
            autoCorrect={false}
            testID="search-input"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} testID="search-clear">
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        {/* Category chips */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[...CATEGORIES]}
          keyExtractor={(c) => c}
          contentContainerStyle={styles.catList}
          renderItem={({ item }) => (
            <CategoryChip
              label={item}
              selected={cat === item}
              onPress={() => { setCat(cat === item ? '' : item); setQuery(''); }}
            />
          )}
        />
      </View>

      {/* ── Results ── */}
      <FlatList
        data={isLoading ? [] : articles}
        keyExtractor={(a) => a.id}
        renderItem={({ item }) => (
          <ArticleCard article={item} onPress={() => router.push(`/article/${item.id}`)} />
        )}
        ListEmptyComponent={
          isLoading ? (
            <View>{[0, 1, 2, 3].map((i) => <ArticleCardSkeleton key={i} />)}</View>
          ) : hasQuery ? (
            <View style={styles.empty}>
              <Feather name="search" size={36} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No results</Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                Try a different keyword or category
              </Text>
            </View>
          ) : (
            <View style={styles.empty}>
              <Feather name="compass" size={36} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Discover</Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                Search or pick a category above
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
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  catList: { paddingVertical: 4, gap: 8 },
  empty: { paddingTop: 70, alignItems: 'center', gap: 8, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold' },
  emptySub: { fontSize: 14, textAlign: 'center', fontFamily: 'Inter_400Regular', lineHeight: 20 },
});
