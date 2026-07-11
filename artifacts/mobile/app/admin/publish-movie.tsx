import React, { useState } from 'react';
import {
  Alert,
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
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { publishMovie } from '@/lib/firestore-media';
import { PublishMovieForm } from '@/types/media';

const GENRES = ['Action', 'Drama', 'Comedy', 'Thriller', 'Documentary', 'Romance', 'Sci-Fi', 'Horror', 'Animation', 'Other'];
const RATINGS = ['G', 'PG', 'PG-13', 'R', 'NR'];

export default function PublishMovieScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const { user, isAdmin } = useAuth();

  const [form, setForm] = useState<PublishMovieForm>({
    title: '',
    description: '',
    thumbnailUrl: '',
    videoUrl: '',
    genre: 'Drama',
    year: new Date().getFullYear().toString(),
    duration: '',
    rating: 'PG',
  });
  const [loading, setLoading] = useState(false);

  const update = (key: keyof PublishMovieForm, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const isValid = form.title.trim() && form.videoUrl.trim() && form.description.trim();

  const handlePublish = async () => {
    if (!user || !isAdmin) return;
    if (!isValid) { Alert.alert('Missing fields', 'Title, description, and video URL are required.'); return; }
    setLoading(true);
    try {
      await publishMovie(form, user.uid);
      Alert.alert('Published!', `"${form.title}" has been added to the movie library.`, [
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

  const inputStyle = [styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.secondary }];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.navBar, { paddingTop: topPad + 4, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.back()} style={styles.navBtn}>
          <Feather name="x" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.foreground }]}>Publish Movie</Text>
        <Pressable
          onPress={handlePublish}
          disabled={loading || !isValid}
          style={[styles.publishBtn, { backgroundColor: '#2D7A4F', opacity: loading || !isValid ? 0.6 : 1 }]}
        >
          <Text style={styles.publishBtnText}>{loading ? '…' : 'Publish'}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: botPad }]}>
        {/* Title */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>TITLE *</Text>
          <TextInput style={inputStyle} value={form.title} onChangeText={(t) => update('title', t)} placeholder="Movie title" placeholderTextColor={colors.mutedForeground} testID="title-input" />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>DESCRIPTION *</Text>
          <TextInput style={[...inputStyle, styles.multiline]} value={form.description} onChangeText={(t) => update('description', t)} placeholder="Movie synopsis…" placeholderTextColor={colors.mutedForeground} multiline testID="desc-input" />
        </View>

        {/* Video URL */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>VIDEO URL *</Text>
          <TextInput style={inputStyle} value={form.videoUrl} onChangeText={(t) => update('videoUrl', t)} placeholder="https://…" placeholderTextColor={colors.mutedForeground} testID="video-url-input" />
        </View>

        {/* Thumbnail */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>THUMBNAIL URL</Text>
          <TextInput style={inputStyle} value={form.thumbnailUrl} onChangeText={(t) => update('thumbnailUrl', t)} placeholder="https://…" placeholderTextColor={colors.mutedForeground} />
        </View>

        {/* Year + Duration row */}
        <View style={styles.rowFields}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>YEAR</Text>
            <TextInput style={inputStyle} value={form.year} onChangeText={(t) => update('year', t)} placeholder="2024" placeholderTextColor={colors.mutedForeground} keyboardType="numeric" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>DURATION</Text>
            <TextInput style={inputStyle} value={form.duration} onChangeText={(t) => update('duration', t)} placeholder="1h 42m" placeholderTextColor={colors.mutedForeground} />
          </View>
        </View>

        {/* Genre */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>GENRE</Text>
          <View style={styles.chipRow}>
            {GENRES.map((g) => (
              <Pressable key={g} onPress={() => update('genre', g)} style={[styles.chip, { backgroundColor: form.genre === g ? '#2D7A4F' : colors.secondary, borderColor: form.genre === g ? '#2D7A4F' : colors.border }]}>
                <Text style={[styles.chipText, { color: form.genre === g ? '#FFF' : colors.foreground }]}>{g}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Rating */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>RATING</Text>
          <View style={styles.chipRow}>
            {RATINGS.map((r) => (
              <Pressable key={r} onPress={() => update('rating', r)} style={[styles.chip, { backgroundColor: form.rating === r ? '#2D7A4F' : colors.secondary, borderColor: form.rating === r ? '#2D7A4F' : colors.border }]}>
                <Text style={[styles.chipText, { color: form.rating === r ? '#FFF' : colors.foreground }]}>{r}</Text>
              </Pressable>
            ))}
          </View>
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
  label: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 0.7 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, fontFamily: 'Inter_400Regular' },
  multiline: { height: 100, textAlignVertical: 'top' },
  rowFields: { flexDirection: 'row', gap: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1 },
  chipText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
});
