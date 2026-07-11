import React from 'react';
import { FlatList, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useSubscription } from '@/context/SubscriptionContext';
import { PaywallGate } from '@/components/PaywallGate';
import { MediaCard } from '@/components/MediaCard';
import { getMusicVideos, getMovies, getActiveLiveStreams, getLiveStreams } from '@/lib/firestore-media';
import { MusicVideo, Movie, LiveStream } from '@/types/media';

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  const colors = useColors();
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {onSeeAll && (
        <Pressable onPress={onSeeAll}>
          <Text style={[styles.seeAll, { color: colors.accent }]}>See all</Text>
        </Pressable>
      )}
    </View>
  );
}

function LiveBanner({ streams }: { streams: LiveStream[] }) {
  const colors = useColors();
  if (streams.length === 0) return null;
  return (
    <View style={[styles.liveBanner, { backgroundColor: '#B3271E' }]}>
      <Feather name="radio" size={14} color="#FFF" />
      <Text style={styles.liveBannerText}>
        {streams.length} LIVE{streams.length > 1 ? ' STREAMS' : ' STREAM'} NOW
      </Text>
    </View>
  );
}

function EmptySection({ icon, label }: { icon: string; label: string }) {
  const colors = useColors();
  return (
    <View style={styles.emptySection}>
      <Feather name={icon as any} size={32} color={colors.mutedForeground} />
      <Text style={[styles.emptySectionText, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function MusicSection() {
  const colors = useColors();
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['music-videos'],
    queryFn: () => getMusicVideos(15),
    staleTime: 300_000,
  });

  return (
    <PaywallGate contentKey="music_videos">
      <View style={styles.section}>
        <SectionHeader title="Music Videos" />
        {isLoading ? (
          <View style={[styles.loadingRow, { backgroundColor: colors.muted }]} />
        ) : videos.length === 0 ? (
          <EmptySection icon="music" label="No music videos yet — check back soon" />
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={videos}
            keyExtractor={(v) => v.id}
            contentContainerStyle={styles.hList}
            renderItem={({ item }) => (
              <MediaCard item={item} onPress={() => router.push(`/media/video/${item.id}`)} />
            )}
          />
        )}
      </View>
    </PaywallGate>
  );
}

function MoviesSection() {
  const colors = useColors();
  const { data: movies = [], isLoading } = useQuery({
    queryKey: ['movies'],
    queryFn: () => getMovies(15),
    staleTime: 300_000,
  });

  return (
    <PaywallGate contentKey="movies">
      <View style={styles.section}>
        <SectionHeader title="Movies" />
        {isLoading ? (
          <View style={[styles.loadingRow, { backgroundColor: colors.muted }]} />
        ) : movies.length === 0 ? (
          <EmptySection icon="film" label="No movies yet — check back soon" />
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={movies}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.hList}
            renderItem={({ item }) => (
              <MediaCard item={item} onPress={() => router.push(`/media/movie/${item.id}`)} />
            )}
          />
        )}
      </View>
    </PaywallGate>
  );
}

function LiveSection() {
  const colors = useColors();
  const { data: liveStreams = [], isLoading } = useQuery({
    queryKey: ['live-streams'],
    queryFn: () => getLiveStreams(),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
  const active = liveStreams.filter((s) => s.isLive);
  const scheduled = liveStreams.filter((s) => !s.isLive);

  return (
    <PaywallGate contentKey="live_streams">
      <View style={styles.section}>
        <SectionHeader title="Live & Scheduled" />
        {isLoading ? (
          <View style={[styles.loadingRow, { backgroundColor: colors.muted }]} />
        ) : liveStreams.length === 0 ? (
          <EmptySection icon="radio" label="No live streams — check back soon" />
        ) : (
          <>
            {active.length > 0 && (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={active}
                keyExtractor={(s) => s.id}
                contentContainerStyle={styles.hList}
                renderItem={({ item }) => (
                  <MediaCard item={item} onPress={() => router.push(`/media/live/${item.id}`)} />
                )}
              />
            )}
            {scheduled.length > 0 && (
              <>
                <Text style={[styles.subSectionLabel, { color: colors.mutedForeground }]}>
                  UPCOMING
                </Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={scheduled}
                  keyExtractor={(s) => s.id}
                  contentContainerStyle={styles.hList}
                  renderItem={({ item }) => (
                    <MediaCard item={item} onPress={() => router.push(`/media/live/${item.id}`)} />
                  )}
                />
              </>
            )}
          </>
        )}
      </View>
    </PaywallGate>
  );
}

export default function MediaScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const { data: liveNow = [] } = useQuery({
    queryKey: ['active-live'],
    queryFn: getActiveLiveStreams,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  const topPad = isWeb ? 67 : insets.top;
  const botPad = isWeb ? 34 : insets.bottom + 16;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: botPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View
        style={[
          styles.topBar,
          { paddingTop: topPad + 4, borderBottomColor: colors.border, backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.wordmark, { color: colors.foreground }]}>Media</Text>
        <Pressable
          onPress={() => router.push('/subscription/plans')}
          style={[styles.upgradePill, { borderColor: colors.accent }]}
        >
          <Text style={[styles.upgradePillText, { color: colors.accent }]}>Plans</Text>
        </Pressable>
      </View>

      <LiveBanner streams={liveNow} />

      <LiveSection />
      <MusicSection />
      <MoviesSection />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  wordmark: { fontSize: 24, fontWeight: '700', fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  upgradePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  upgradePillText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  liveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  liveBannerText: { color: '#FFF', fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.5 },
  section: { paddingTop: 20, gap: 10 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', fontFamily: 'Inter_700Bold' },
  seeAll: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  hList: { paddingHorizontal: 16 },
  loadingRow: { height: 120, borderRadius: 8, marginHorizontal: 16, opacity: 0.4 },
  emptySection: { alignItems: 'center', paddingVertical: 28, gap: 8, paddingHorizontal: 16 },
  emptySectionText: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  subSectionLabel: {
    paddingHorizontal: 16,
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.8,
    marginTop: 8,
  },
});
