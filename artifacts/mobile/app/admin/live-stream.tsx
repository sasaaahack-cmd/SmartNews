import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { startLiveStream, endLiveStream, getLiveStreams } from '@/lib/firestore-media';
import { PublishLiveStreamForm, LiveStream } from '@/types/media';

export default function LiveStreamScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const { user, isAdmin } = useAuth();
  const qc = useQueryClient();

  const [form, setForm] = useState<PublishLiveStreamForm>({
    title: '',
    description: '',
    thumbnailUrl: '',
    streamUrl: '',
    hostName: user?.displayName ?? '',
    scheduledFor: '',
  });
  const [launching, setLaunching] = useState(false);

  const { data: streams = [], isLoading } = useQuery({
    queryKey: ['admin-live-streams'],
    queryFn: getLiveStreams,
    staleTime: 15_000,
    refetchInterval: 15_000,
  });

  const liveStreams = streams.filter((s) => s.isLive);
  const scheduledStreams = streams.filter((s) => !s.isLive);

  const update = (key: keyof PublishLiveStreamForm, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const isValid = form.title.trim() && form.streamUrl.trim() && form.hostName.trim();

  const handleGoLive = async () => {
    if (!user || !isAdmin) return;
    if (!isValid) { Alert.alert('Missing fields', 'Title, stream URL, and host name are required.'); return; }
    setLaunching(true);
    try {
      await startLiveStream(form, user.uid);
      qc.invalidateQueries({ queryKey: ['admin-live-streams'] });
      qc.invalidateQueries({ queryKey: ['live-streams'] });
      qc.invalidateQueries({ queryKey: ['active-live'] });
      Alert.alert('🔴 You are live!', `"${form.title}" is now streaming.`);
      setForm({ title: '', description: '', thumbnailUrl: '', streamUrl: '', hostName: user?.displayName ?? '', scheduledFor: '' });
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to start stream.');
    } finally {
      setLaunching(false);
    }
  };

  const handleEnd = (stream: LiveStream) => {
    Alert.alert('End Stream', `End "${stream.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Stream',
        style: 'destructive',
        onPress: async () => {
          await endLiveStream(stream.id);
          qc.invalidateQueries({ queryKey: ['admin-live-streams'] });
          qc.invalidateQueries({ queryKey: ['live-streams'] });
          qc.invalidateQueries({ queryKey: ['active-live'] });
        },
      },
    ]);
  };

  const topPad = isWeb ? 67 : insets.top;
  const botPad = isWeb ? 34 : insets.bottom + 16;

  const inputStyle = [
    styles.input,
    { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.secondary },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Nav */}
      <View style={[styles.navBar, { paddingTop: topPad + 4, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.back()} style={styles.navBtn}>
          <Feather name="x" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.foreground }]}>Live Streams</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: botPad }]} keyboardShouldPersistTaps="handled">

        {/* ── Active streams ── */}
        {liveStreams.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>● LIVE NOW</Text>
            {liveStreams.map((s) => (
              <View key={s.id} style={[styles.streamCard, { backgroundColor: '#B3271E18', borderColor: '#B3271E' }]}>
                <View style={styles.streamCardTop}>
                  <View style={[styles.liveDot, { backgroundColor: '#B3271E' }]} />
                  <Text style={[styles.streamTitle, { color: colors.foreground }]} numberOfLines={1}>{s.title}</Text>
                </View>
                <Text style={[styles.streamHost, { color: colors.mutedForeground }]}>
                  Host: {s.hostName}  ·  {s.viewerCount} watching
                </Text>
                <Pressable
                  onPress={() => handleEnd(s)}
                  style={({ pressed }) => [styles.endBtn, { opacity: pressed ? 0.7 : 1 }]}
                >
                  <Text style={styles.endBtnText}>End Stream</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* ── Start new stream ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>START NEW STREAM</Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>TITLE *</Text>
            <TextInput style={inputStyle} value={form.title} onChangeText={(t) => update('title', t)} placeholder="Stream title" placeholderTextColor={colors.mutedForeground} testID="title-input" />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>HOST NAME *</Text>
            <TextInput style={inputStyle} value={form.hostName} onChangeText={(t) => update('hostName', t)} placeholder="Your name" placeholderTextColor={colors.mutedForeground} />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>STREAM URL * (HLS / RTMP)</Text>
            <TextInput style={inputStyle} value={form.streamUrl} onChangeText={(t) => update('streamUrl', t)} placeholder="https://… or rtmp://…" placeholderTextColor={colors.mutedForeground} autoCapitalize="none" testID="stream-url-input" />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>THUMBNAIL URL</Text>
            <TextInput style={inputStyle} value={form.thumbnailUrl} onChangeText={(t) => update('thumbnailUrl', t)} placeholder="https://…" placeholderTextColor={colors.mutedForeground} autoCapitalize="none" />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>DESCRIPTION</Text>
            <TextInput style={[...inputStyle, styles.multiline]} value={form.description} onChangeText={(t) => update('description', t)} placeholder="What's this stream about?" placeholderTextColor={colors.mutedForeground} multiline />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>SCHEDULE FOR (optional)</Text>
            <TextInput style={inputStyle} value={form.scheduledFor} onChangeText={(t) => update('scheduledFor', t)} placeholder="2025-12-31T20:00" placeholderTextColor={colors.mutedForeground} />
          </View>

          <Pressable
            onPress={handleGoLive}
            disabled={launching || !isValid}
            testID="go-live-btn"
            style={({ pressed }) => [
              styles.goLiveBtn,
              { opacity: pressed || launching || !isValid ? 0.65 : 1 },
            ]}
          >
            <View style={styles.liveDot} />
            <Text style={styles.goLiveBtnText}>{launching ? 'Going live…' : 'Go Live Now'}</Text>
          </Pressable>
        </View>

        {/* ── Scheduled ── */}
        {scheduledStreams.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>UPCOMING / ENDED</Text>
            {scheduledStreams.map((s) => (
              <View key={s.id} style={[styles.streamCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.streamTitle, { color: colors.foreground }]} numberOfLines={1}>{s.title}</Text>
                <Text style={[styles.streamHost, { color: colors.mutedForeground }]}>Host: {s.hostName}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  navBtn: { padding: 8 },
  navTitle: { fontSize: 15, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  scroll: { padding: 16, gap: 20 },
  section: { gap: 12 },
  sectionLabel: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 0.8 },
  field: { gap: 6 },
  label: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 0.7 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, fontFamily: 'Inter_400Regular' },
  multiline: { height: 90, textAlignVertical: 'top' },
  streamCard: { borderWidth: 1, borderRadius: 10, padding: 14, gap: 6 },
  streamCardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFF' },
  streamTitle: { fontSize: 14, fontWeight: '600', fontFamily: 'Inter_600SemiBold', flex: 1 },
  streamHost: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  endBtn: { marginTop: 4, backgroundColor: '#B3271E', paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  endBtnText: { color: '#FFF', fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  goLiveBtn: { backgroundColor: '#B3271E', paddingVertical: 14, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  goLiveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700', fontFamily: 'Inter_700Bold' },
});
