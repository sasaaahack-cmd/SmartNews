import React from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { MusicVideo, Movie, LiveStream } from '@/types/media';

const { width: SW } = Dimensions.get('window');
const CARD_W = SW * 0.52;
const CARD_H = CARD_W * 0.62;

type Item = MusicVideo | Movie | LiveStream;

interface Props {
  item: Item;
  onPress: () => void;
}

export function MediaCard({ item, onPress }: Props) {
  const colors = useColors();
  const isLive = item.kind === 'live_stream';

  const label =
    item.kind === 'music_video'
      ? (item as MusicVideo).artist
      : item.kind === 'movie'
      ? `${(item as Movie).year} · ${(item as Movie).rating}`
      : (item as LiveStream).hostName;

  const sub =
    item.kind === 'music_video'
      ? (item as MusicVideo).duration
      : item.kind === 'movie'
      ? (item as Movie).duration
      : isLive && (item as LiveStream).isLive
      ? `${(item as LiveStream).viewerCount.toLocaleString()} watching`
      : 'Scheduled';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, { opacity: pressed ? 0.85 : 1 }]}
      testID="media-card"
    >
      {/* Thumbnail */}
      <View style={[styles.thumb, { backgroundColor: colors.muted }]}>
        {item.thumbnailUrl ? (
          <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbImg} resizeMode="cover" />
        ) : (
          <Feather
            name={isLive ? 'radio' : item.kind === 'movie' ? 'film' : 'music'}
            size={28}
            color={colors.mutedForeground}
          />
        )}
        {/* Play / Live overlay */}
        {isLive && (item as LiveStream).isLive ? (
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>● LIVE</Text>
          </View>
        ) : (
          <View style={styles.playBtn}>
            <Feather name="play" size={14} color="#FFF" />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.label, { color: colors.mutedForeground }]} numberOfLines={1}>
          {label}
        </Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>{sub}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { width: CARD_W, marginRight: 12 },
  thumb: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImg: { ...StyleSheet.absoluteFillObject },
  liveBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#B3271E',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 3,
  },
  liveBadgeText: { color: '#FFF', fontSize: 9, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  playBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { paddingTop: 8, gap: 2 },
  title: { fontSize: 13, fontWeight: '600', fontFamily: 'Inter_600SemiBold', lineHeight: 18 },
  label: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  sub: { fontSize: 10, fontFamily: 'Inter_400Regular' },
});
