import React from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';

function Row({
  icon,
  label,
  onPress,
  danger = false,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      testID={`row-${label}`}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={styles.rowLeft}>
        <Feather name={icon as any} size={18} color={danger ? colors.breaking : colors.foreground} />
        <Text style={[styles.rowLabel, { color: danger ? colors.breaking : colors.foreground }]}>
          {label}
        </Text>
      </View>
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const { user, isLoading, signOut } = useAuth();

  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom + 16;

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Sign out of SmartNews?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  if (isLoading) {
    return <View style={[styles.container, { backgroundColor: colors.background }]} />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
    >
      {/* ── Header ── */}
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 12, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>
      </View>

      {user ? (
        <>
          {/* ── User card ── */}
          <View
            style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={[styles.avatarLetter, { color: colors.primaryForeground }]}>
                {(user.displayName ?? user.email ?? 'U')[0].toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.foreground }]}>
                {user.displayName ?? 'Reader'}
              </Text>
              <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>
                {user.email}
              </Text>
            </View>
          </View>

          {/* ── Account section ── */}
          <View
            style={[
              styles.section,
              { borderTopColor: colors.border, borderBottomColor: colors.border },
            ]}
          >
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ACCOUNT</Text>
            <Row icon="bell" label="Notification Preferences" onPress={() => {}} />
            <Row icon="heart" label="Followed Topics" onPress={() => {}} />
            <Row icon="type" label="Reading Preferences" onPress={() => {}} />
          </View>

          <View
            style={[
              styles.section,
              { borderTopColor: colors.border, borderBottomColor: colors.border, marginTop: 16 },
            ]}
          >
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>SESSION</Text>
            <Row icon="log-out" label="Sign Out" onPress={handleSignOut} danger />
          </View>
        </>
      ) : (
        /* ── Signed-out state ── */
        <View style={styles.authBox}>
          <View
            style={[
              styles.authCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Feather name="user" size={40} color={colors.mutedForeground} />
            <Text style={[styles.authHeading, { color: colors.foreground }]}>
              Sign in to SmartNews
            </Text>
            <Text style={[styles.authSub, { color: colors.mutedForeground }]}>
              Save articles, follow topics, and get personalised news.
            </Text>
          </View>

          <Pressable
            onPress={() => router.push('/auth/sign-in')}
            testID="sign-in-cta"
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.82 : 1 },
            ]}
          >
            <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>
              Sign In
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/auth/sign-up')}
            testID="sign-up-cta"
            style={({ pressed }) => [
              styles.outlineBtn,
              { borderColor: colors.border, opacity: pressed ? 0.82 : 1 },
            ]}
          >
            <Text style={[styles.outlineBtnText, { color: colors.foreground }]}>
              Create Account
            </Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 28, fontWeight: '700', fontFamily: 'Inter_700Bold' },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontSize: 22, fontWeight: '700', fontFamily: 'Inter_700Bold' },
  userInfo: { flex: 1 },
  userName: { fontSize: 17, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  userEmail: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
  section: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionLabel: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.7,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowLabel: { fontSize: 15, fontFamily: 'Inter_400Regular' },
  authBox: { padding: 16, gap: 12, marginTop: 24 },
  authCard: {
    padding: 28,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  authHeading: { fontSize: 20, fontWeight: '700', fontFamily: 'Inter_700Bold', textAlign: 'center' },
  authSub: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  primaryBtn: { paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  primaryBtnText: { fontSize: 15, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  outlineBtn: { paddingVertical: 14, borderRadius: 8, alignItems: 'center', borderWidth: 1 },
  outlineBtnText: { fontSize: 15, fontFamily: 'Inter_400Regular' },
});
