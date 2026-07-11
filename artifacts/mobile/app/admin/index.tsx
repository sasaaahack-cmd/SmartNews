import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';

interface AdminAction {
  icon: string;
  label: string;
  description: string;
  route: string;
  color: string;
}

const ADMIN_ACTIONS: AdminAction[] = [
  {
    icon: 'file-text',
    label: 'Publish Article',
    description: 'Write and publish a news article',
    route: '/admin/publish-article',
    color: '#3A5A78',
  },
  {
    icon: 'music',
    label: 'Publish Music Video',
    description: 'Add a music video to the library',
    route: '/admin/publish-video',
    color: '#5B4FCF',
  },
  {
    icon: 'film',
    label: 'Publish Movie',
    description: 'Add a movie to the library',
    route: '/admin/publish-movie',
    color: '#2D7A4F',
  },
  {
    icon: 'radio',
    label: 'Start Live Stream',
    description: 'Go live or schedule a stream',
    route: '/admin/live-stream',
    color: '#B3271E',
  },
];

export default function AdminPanelScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const { user, isAdmin } = useAuth();

  const topPad = isWeb ? 67 : insets.top;
  const botPad = isWeb ? 34 : insets.bottom + 16;

  if (!isAdmin) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Feather name="lock" size={40} color={colors.mutedForeground} />
        <Text style={[styles.errTitle, { color: colors.foreground }]}>Access Denied</Text>
        <Text style={[styles.errSub, { color: colors.mutedForeground }]}>
          You need admin privileges to access this panel.
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: colors.accent }]}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Nav */}
      <View
        style={[
          styles.navBar,
          { paddingTop: topPad + 4, borderBottomColor: colors.border, backgroundColor: colors.background },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.navBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.foreground }]}>Admin Panel</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: botPad }]}>
        {/* Admin identity */}
        <View style={[styles.adminCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.adminAvatar, { backgroundColor: colors.primary }]}>
            <Feather name="shield" size={22} color={colors.primaryForeground} />
          </View>
          <View>
            <Text style={[styles.adminLabel, { color: colors.mutedForeground }]}>Signed in as admin</Text>
            <Text style={[styles.adminEmail, { color: colors.foreground }]}>{user?.email}</Text>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PUBLISH CONTENT</Text>

        {ADMIN_ACTIONS.map((action) => (
          <Pressable
            key={action.route}
            onPress={() => router.push(action.route as any)}
            testID={`admin-${action.label}`}
            style={({ pressed }) => [
              styles.actionCard,
              { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.82 : 1 },
            ]}
          >
            <View style={[styles.actionIcon, { backgroundColor: action.color + '1A' }]}>
              <Feather name={action.icon as any} size={22} color={action.color} />
            </View>
            <View style={styles.actionInfo}>
              <Text style={[styles.actionLabel, { color: colors.foreground }]}>{action.label}</Text>
              <Text style={[styles.actionDesc, { color: colors.mutedForeground }]}>
                {action.description}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navBtn: { padding: 8 },
  navTitle: { fontSize: 16, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  scroll: { padding: 16, gap: 12 },
  adminCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
  },
  adminAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminLabel: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  adminEmail: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  sectionLabel: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.8,
    marginTop: 4,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  actionIcon: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actionInfo: { flex: 1 },
  actionLabel: { fontSize: 15, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  actionDesc: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  errTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold' },
  errSub: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 20 },
  backLink: { fontSize: 15, fontFamily: 'Inter_500Medium' },
});
