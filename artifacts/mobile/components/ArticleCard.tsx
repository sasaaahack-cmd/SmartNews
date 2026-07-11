import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Article } from '@/types/article';
import { CategoryChip } from './CategoryChip';

export function timeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface Props {
  article: Article;
  onPress: () => void;
  showCategory?: boolean;
}

export function ArticleCard({ article, onPress, showCategory = true }: Props) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      testID="article-card"
      style={({ pressed }) => [
        styles.container,
        { borderBottomColor: colors.border, opacity: pressed ? 0.82 : 1 },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.textBox}>
          {showCategory && (
            <CategoryChip label={article.category} isBreaking={article.isBreaking} />
          )}
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={3}>
            {article.title}
          </Text>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            {article.byline} · {timeAgo(article.publishedAt)} · {article.readTimeMinutes}m
          </Text>
        </View>

        {article.imageUrl ? (
          <Image
            source={{ uri: article.imageUrl }}
            style={[styles.thumb, { backgroundColor: colors.muted }]}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.thumbLetter, { color: colors.mutedForeground }]}>
              {article.category[0]}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  textBox: { flex: 1, gap: 5 },
  title: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
    fontFamily: 'Inter_600SemiBold',
  },
  meta: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  thumb: { width: 88, height: 68, borderRadius: 5 },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  thumbLetter: { fontSize: 22, fontWeight: '700', fontFamily: 'Inter_700Bold' },
});
