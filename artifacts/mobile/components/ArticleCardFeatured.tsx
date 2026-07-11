import React from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Article } from '@/types/article';
import { CategoryChip } from './CategoryChip';
import { timeAgo } from './ArticleCard';

const { width: SW } = Dimensions.get('window');

interface Props {
  article: Article;
  onPress: () => void;
}

export function ArticleCardFeatured({ article, onPress }: Props) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      testID="article-card-featured"
      style={({ pressed }) => [
        styles.container,
        { borderBottomColor: colors.border, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      {article.imageUrl ? (
        <Image
          source={{ uri: article.imageUrl }}
          style={[styles.image, { backgroundColor: colors.muted }]}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.image, { backgroundColor: colors.primary }]}>
          <Text style={[styles.imagePlaceholderText, { color: colors.primaryForeground }]}>
            {article.category.toUpperCase()}
          </Text>
        </View>
      )}
      <View style={[styles.body, { backgroundColor: colors.card }]}>
        <CategoryChip label={article.category} isBreaking={article.isBreaking} />
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={3}>
          {article.title}
        </Text>
        {article.subhead ? (
          <Text style={[styles.subhead, { color: colors.mutedForeground }]} numberOfLines={2}>
            {article.subhead}
          </Text>
        ) : null}
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
          {article.byline} · {timeAgo(article.publishedAt)} · {article.readTimeMinutes}m read
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { borderBottomWidth: StyleSheet.hairlineWidth },
  image: { width: SW, height: SW * 0.58 },
  imagePlaceholderText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2,
    alignSelf: 'center',
    marginTop: SW * 0.25,
  },
  body: { padding: 16, gap: 8 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 29,
    fontFamily: 'Inter_700Bold',
  },
  subhead: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Lora_400Regular',
  },
  meta: { fontSize: 12, fontFamily: 'Inter_400Regular' },
});
