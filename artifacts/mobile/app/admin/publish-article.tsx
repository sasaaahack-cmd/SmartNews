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
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { CATEGORIES } from '@/types/article';

interface ArticleForm {
  title: string;
  subhead: string;
  byline: string;
  body: string;
  imageUrl: string;
  category: string;
  tags: string;          // comma-separated
  readTimeMinutes: string;
  isBreaking: boolean;
}

export default function PublishArticleScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const { user, isAdmin } = useAuth();

  const [form, setForm] = useState<ArticleForm>({
    title: '',
    subhead: '',
    byline: user?.displayName ?? 'SmartNews Staff',
    body: '',
    imageUrl: '',
    category: CATEGORIES[0],
    tags: '',
    readTimeMinutes: '3',
    isBreaking: false,
  });
  const [loading, setLoading] = useState(false);

  const update = (key: keyof ArticleForm, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const isValid = form.title.trim() && form.body.trim() && form.category;

  const handlePublish = async () => {
    if (!user || !isAdmin) return;
    if (!isValid) { Alert.alert('Missing fields', 'Title, body, and category are required.'); return; }
    setLoading(true);
    try {
      await addDoc(collection(db, 'articles'), {
        title: form.title.trim(),
        subhead: form.subhead.trim() || null,
        byline: form.byline.trim() || 'SmartNews Staff',
        body: form.body.trim(),
        imageUrl: form.imageUrl.trim() || null,
        category: form.category,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        readTimeMinutes: parseInt(form.readTimeMinutes, 10) || 3,
        isBreaking: form.isBreaking,
        status: 'published',
        publishedAt: serverTimestamp(),
        publishedBy: user.uid,
        reads: 0,
        shares: 0,
        slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        type: 'standard',
      });
      Alert.alert('Published!', `"${form.title}" is now live.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Publish failed. Check Firestore rules.');
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
        <Text style={[styles.navTitle, { color: colors.foreground }]}>Publish Article</Text>
        <Pressable
          onPress={handlePublish}
          disabled={loading || !isValid}
          style={[styles.publishBtn, { backgroundColor: '#3A5A78', opacity: loading || !isValid ? 0.6 : 1 }]}
        >
          <Text style={styles.publishBtnText}>{loading ? '…' : 'Publish'}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: botPad }]} keyboardShouldPersistTaps="handled">
        {/* Title */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>TITLE *</Text>
          <TextInput style={inputStyle} value={form.title} onChangeText={(t) => update('title', t)} placeholder="Article headline" placeholderTextColor={colors.mutedForeground} testID="title-input" />
        </View>

        {/* Subhead */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>SUBHEADLINE</Text>
          <TextInput style={inputStyle} value={form.subhead} onChangeText={(t) => update('subhead', t)} placeholder="Optional summary line" placeholderTextColor={colors.mutedForeground} />
        </View>

        {/* Body */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>BODY * (supports ## headings, &gt; blockquotes)</Text>
          <TextInput
            style={[...inputStyle, styles.bodyInput]}
            value={form.body}
            onChangeText={(t) => update('body', t)}
            placeholder="Write your article here…&#10;&#10;Use double line breaks between paragraphs.&#10;## H2 heading&#10;&gt; Blockquote"
            placeholderTextColor={colors.mutedForeground}
            multiline
            testID="body-input"
          />
        </View>

        {/* Byline */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>BYLINE</Text>
          <TextInput style={inputStyle} value={form.byline} onChangeText={(t) => update('byline', t)} placeholder="Author name" placeholderTextColor={colors.mutedForeground} />
        </View>

        {/* Image URL */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>HERO IMAGE URL</Text>
          <TextInput style={inputStyle} value={form.imageUrl} onChangeText={(t) => update('imageUrl', t)} placeholder="https://…" placeholderTextColor={colors.mutedForeground} autoCapitalize="none" />
        </View>

        {/* Category */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>CATEGORY *</Text>
          <View style={styles.chipRow}>
            {CATEGORIES.map((c) => (
              <Pressable
                key={c}
                onPress={() => update('category', c)}
                style={[styles.chip, { backgroundColor: form.category === c ? '#3A5A78' : colors.secondary, borderColor: form.category === c ? '#3A5A78' : colors.border }]}
              >
                <Text style={[styles.chipText, { color: form.category === c ? '#FFF' : colors.foreground }]}>{c}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Tags + Read time row */}
        <View style={styles.rowFields}>
          <View style={[styles.field, { flex: 2 }]}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>TAGS (comma-separated)</Text>
            <TextInput style={inputStyle} value={form.tags} onChangeText={(t) => update('tags', t)} placeholder="politics, climate" placeholderTextColor={colors.mutedForeground} />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>READ TIME (min)</Text>
            <TextInput style={inputStyle} value={form.readTimeMinutes} onChangeText={(t) => update('readTimeMinutes', t)} keyboardType="numeric" placeholder="3" placeholderTextColor={colors.mutedForeground} />
          </View>
        </View>

        {/* Breaking toggle */}
        <View style={[styles.toggleRow, { borderColor: colors.border }]}>
          <View>
            <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Breaking News</Text>
            <Text style={[styles.toggleSub, { color: colors.mutedForeground }]}>Show in breaking banner</Text>
          </View>
          <Switch value={form.isBreaking} onValueChange={(v) => update('isBreaking', v)} trackColor={{ true: '#B3271E' }} />
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
  bodyInput: { height: 240, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 11, paddingVertical: 6, borderRadius: 6, borderWidth: 1 },
  chipText: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  rowFields: { flexDirection: 'row', gap: 12 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 10, padding: 14 },
  toggleLabel: { fontSize: 15, fontFamily: 'Inter_500Medium' },
  toggleSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
});
