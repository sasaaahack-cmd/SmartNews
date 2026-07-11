import React from 'react';
import { ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Article } from '@/types/article';

interface Props {
  articles: Article[];
  onPress?: (article: Article) => void;
}

export function BreakingBanner({ articles, onPress }: Props) {
  const colors = useColors();
  if (!articles.length) return null;
  return (
    <View style={[styles.container, { backgroundColor: colors.breaking }]}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>BREAKING</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {articles.map((a, i) => (
          <Pressable key={a.id} onPress={() => onPress?.(a)}>
            <Text style={styles.headline}>
              {a.title}
              {i < articles.length - 1 ? '   ·   ' : ''}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 12, gap: 10 },
  badge: { backgroundColor: 'rgba(0,0,0,0.22)', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 2 },
  badgeText: { color: '#FFF', fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.5 },
  scroll: { flex: 1 },
  headline: { color: '#FFF', fontFamily: 'Inter_600SemiBold', fontSize: 13 },
});
