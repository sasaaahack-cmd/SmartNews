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
import { useSubscription } from '@/context/SubscriptionContext';
import { SUBSCRIPTION_PLANS } from '@/constants/subscriptions';

function Row({
  icon,
  label,
  sublabel,
  onPress,
  danger = false,
  rightEl,
}: {
  icon: string;
  label: string;
  sublabel?: string;
  onPress: () => void;
  danger?: boolean;
  rightEl?: React.ReactNode;
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
        <View>
          <Text style={[styles.rowLabel, { color: danger ? colors.breaking : colors.foreground }]}>
            {label}
          </Text>
          {sublabel ? (
            <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>{sublabel}</Text>
          ) : null}
        </View>
      </View>
      {rightEl ?? <Feather name="chevron-right" size={16} color={colors.mutedForeground} />}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const { user, isLoading, isAdmin, signOut } = useAuth();
  const { tier } = useSubscription();

  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom + 16;

  const currentPlan = SUBSCRIPTION_PLANS.find((p) => p.id === tier)!;

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
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>
      </View>

      {user ? (
        <>
          {/* ── User card ── */}
          <View style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={[styles.avatarLetter, { color: colors.primaryForeground }]}>
                {(user.displayName ?? user.email ?? 'U')[0].toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.foreground }]}>
                {user.displayName ?? 'Reader'}
              </Text>
              <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>{user.email}</Text>
            </View>
          </View>

          {/* ── Subscription card ── */}
          <Pressable
            onPress={() => router.push('/subscription/plans')}
            style={({ pressed }) => [
              styles.subCard,
              {
                backgroundColor: currentPlan.color + '15',
                borderColor: currentPlan.color,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <View style={styles.subCardLeft}>
              <Text style={[styles.subCardTier, { color: currentPlan.color }]}>
                {currentPlan.name.toUpperCase()} PLAN
              </Text>
              <Text style={[styles.subCardTagline, { color: colors.foreground }]}>
                {currentPlan.tagline}
              </Text>
              {tier === 'free' && (
                <Text style={[styles.subCardUpgrade, { color: currentPlan.color }]}>
                  Tap to upgrade →
                </Text>
              )}
            </View>
            <View style={[styles.subCardBadge, { backgroundColor: currentPlan.color }]}>
              <Text style={styles.subCardBadgeText}>{currentPlan.price}</Text>
              {tier !== 'free' && (
                <Text style={styles.subCardBadgePeriod}>/mo</Text>
              )}
            </View>
          </Pressable>

          {/* ── Admin panel ── */}
          {isAdmin && (
            <View style={[styles.section, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ADMIN</Text>
              <Row
                icon="shield"
                label="Admin Panel"
                sublabel="Publish articles, videos, movies & live streams"
                onPress={() => router.push('/admin')}
                rightEl={
                  <View style={[styles.adminBadge, { backgroundColor: '#3A5A78' }]}>
                    <Text style={styles.adminBadgeText}>ADMIN</Text>
                  </View>
                }
              />
            </View>
          )}

          {/* ── Account section ── */}
          <View style={[styles.section, { borderTopColor: colors.border, borderBottomColor: colors.border, marginTop: 16 }]}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ACCOUNT</Text>
            <Row icon="credit-card" label="Manage Subscription" sublabel={`Current: ${currentPlan.name}`} onPress={() => router.push('/subscription/plans')} />
            <Row icon="bell" label="Notification Preferences" onPress={() => {}} />
            <Row icon="heart" label="Followed Topics" onPress={() => {}} />
          </View>

          <View style={[styles.section, { borderTopColor: colors.border, borderBottomColor: colors.border, marginTop: 16 }]}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>SESSION</Text>
            <Row icon="log-out" label="Sign Out" onPress={handleSignOut} danger />
          </View>
        </>
      ) : (
        /* ── Signed-out state ── */
        <View style={styles.authBox}>
          <View style={[styles.authCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="user" size={40} color={colors.mutedForeground} />
            <Text style={[styles.authHeading, { color: colors.foreground }]}>
              Sign in to SmartNews
            </Text>
            <Text style={[styles.authSub, { color: colors.mutedForeground }]}>
              Save articles, follow topics, and subscribe for premium content.
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
            <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>Sign In</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/auth/sign-up')}
            testID="sign-up-cta"
            style={({ pressed }) => [
              styles.outlineBtn,
              { borderColor: colors.border, opacity: pressed ? 0.82 : 1 },
            ]}
          >
            <Text style={[styles.outlineBtnText, { color: colors.foreground }]}>Create Account</Text>
          </Pressable>

          {/* Show plans even when signed out */}
          <Pressable onPress={() => router.push('/subscription/plans')} style={styles.plansLink}>
            <Text style={[styles.plansLinkText, { color: colors.accent }]}>View subscription plans →</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  title: { fontSize: 28, fontWeight: '700', fontFamily: 'Inter_700Bold' },
  userCard: { flexDirection: 'row', alignItems: 'center', margin: 16, padding: 16, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, gap: 14 },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 22, fontWeight: '700', fontFamily: 'Inter_700Bold' },
  userInfo: { flex: 1 },
  userName: { fontSize: 17, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  userEmail: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
  subCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 16, marginBottom: 8, padding: 14, borderRadius: 12, borderWidth: 1.5 },
  subCardLeft: { flex: 1, gap: 3 },
  subCardTier: { fontSize: 9, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  subCardTagline: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  subCardUpgrade: { fontSize: 12, fontFamily: 'Inter_600SemiBold', marginTop: 2 },
  subCardBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignItems: 'center' },
  subCardBadgeText: { color: '#FFF', fontSize: 16, fontFamily: 'Inter_700Bold' },
  subCardBadgePeriod: { color: 'rgba(255,255,255,0.8)', fontSize: 9, fontFamily: 'Inter_400Regular' },
  adminBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  adminBadgeText: { color: '#FFF', fontSize: 9, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  section: { borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth },
  sectionLabel: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 0.7 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  rowLabel: { fontSize: 15, fontFamily: 'Inter_400Regular' },
  rowSub: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 },
  authBox: { padding: 16, gap: 12, marginTop: 24 },
  authCard: { padding: 28, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', gap: 10, marginBottom: 8 },
  authHeading: { fontSize: 20, fontWeight: '700', fontFamily: 'Inter_700Bold', textAlign: 'center' },
  authSub: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 20 },
  primaryBtn: { paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  primaryBtnText: { fontSize: 15, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  outlineBtn: { paddingVertical: 14, borderRadius: 8, alignItems: 'center', borderWidth: 1 },
  outlineBtnText: { fontSize: 15, fontFamily: 'Inter_400Regular' },
  plansLink: { alignItems: 'center', paddingTop: 4 },
  plansLinkText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
});
