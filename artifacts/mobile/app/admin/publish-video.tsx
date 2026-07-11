import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { publishMusicVideo } from '@/lib/firestore-media';
import { PublishMusicVideoForm } from '@/types/media';

const GENRES = ['Pop', 'Afrobeats', 'Hip-Hop', 'R&B', 'Gospel', 'Reggae', 'Jazz', 'Rock', 'Other'];

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  colors,
  testID,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  multiline?: boolean;
  colors: ReturnType<typeof import('@/hooks/useColors').useColors>;
  testID?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label.toUpperCase()}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.secondary },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        multiline={multiline}
        testID={testID}
      />
    </View>
  );
}

export default function PublishVideoScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const { user, isAdmin } = useAuth();

  const [form, setForm] = useState<PublishMusicVideoForm>({
    title: '',
    artist: '',
    thumbnailUrl: '',
    videoUrl: '',
    duration: '',
    genre: 'Pop',
    isExclusive: false,
  });
  const [loading, setLoading] = useState(false);

  const update = (key: keyof PublishMusicVideoForm, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const isValid = form.title.trim() && form.artist.trim() && form.videoUrl.trim();

  const handlePublish = async () => {
    if (!user || !isAdmin) return;
    if (!isValid) { Alert.alert('Missing fields', 'Title, artist, and video URL are required.'); return; }
    setLoading(true);
    try {
      await publishMusicVideo(form, user.uid);
      Alert.alert('Published!', `"${form.title}" is now live.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Publish failed.');
    } finally {
      setLoading(false);
    }
  };

  const topPad = isWeb ? 67 : insets.top;
  const botPad = isWeb ? 34 : insets.bottom + 16;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={[styles.navBar, { paddingTop: topPad + 4, borderBottomColor: colors.border, backgroundColor: colors.background }]}
      >
        <Pressable onPress={() => router.back()} style={styles.navBtn}>
          <Feather name="x" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.foreground }]}>Publish Music Video</Text>
        <Pressable
          onPress={handlePublish}
          disabled={loading || !isValid}
          style={[styles.publishBtn, { backgroundColor: '#5B4FCF', opacity: loading || !isValid ? 0.6 : 1 }]}
        >
          <Text style={styles.publishBtnText}>{loading ? '…' : 'Publish'}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: botPad }]}>
        <Field label="Title *" value={form.title} onChangeText={(t) => update('title', t)} placeholder="Video title" colors={colors} testID="title-input" />
        <Field label="Artist *" value={form.artist} onChangeText={(t) => update('artist', t)} placeholder="Artist name" colors={colors} testID="artist-input" />
        <Field label="Video URL *" value={form.videoUrl} onChangeText={(t) => update('videoUrl', t)} placeholder="https://…" colors={colors} testID="video-url-input" />
        <Field label="Thumbnail URL" value={form.thumbnailUrl} onChangeText={(t) => update('thumbnailUrl', t)} placeholder="https://…" colors={colors} />
        <Field label="Duration" value={form.duration} onChangeText={(t) => update('duration', t)} placeholder="3:45" colors={colors} />

        {/* Genre picker */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>GENRE</Text>
          <View style={styles.genreRow}>
            {GENRES.map((g) => (
              <Pressable
                key={g}
                onPress={() => update('genre', g)}
                style={[
                  styles.genreChip,
                  {
                    backgroundColor: form.genre === g ? '#5B4FCF' : colors.secondary,
                    borderColor: form.genre === g ? '#5B4FCF' : colors.border,
                  },
                ]}
              >
                <Text style={[styles.genreChipText, { color: form.genre === g ? '#FFF' : colors.foreground }]}>
                  {g}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Exclusive toggle */}
        <View style={[styles.toggleRow, { borderColor: colors.border }]}>
          <View>
            <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Exclusive Content</Text>
            <Text style={[styles.toggleSub, { color: colors.mutedForeground }]}>
              Only Pro subscribers can view
            </Text>
          </View>
          <Switch
            value={form.isExclusive}
            onValueChange={(v) => update('isExclusive', v)}
            trackColor={{ true: '#5B4FCF' }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  navBtn: { padding: 8 },
  navTitle: { fontSize: 15, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  publishBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 7 },
  publishBtnText: { color: '#FFF', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  scroll: { padding: 16, gap: 16 },
  field: { gap: 6 },
  fieldLabel: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 0.7 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, fontFamily: 'Inter_400Regular' },
  inputMultiline: { height: 100, textAlignVertical: 'top' },
  genreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  genreChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1 },
  genreChipText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 10, padding: 14 },
  toggleLabel: { fontSize: 15, fontFamily: 'Inter_500Medium' },
  toggleSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
});
