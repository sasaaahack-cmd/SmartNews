import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useSubscription } from '@/context/SubscriptionContext';
import { useAuth } from '@/context/AuthContext';
import { SUBSCRIPTION_PLANS, SubscriptionTier } from '@/constants/subscriptions';

export default function PlansScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const { tier: currentTier, purchasePlan, restorePurchases } = useSubscription();
  const { user } = useAuth();
  const [loading, setLoading] = useState<SubscriptionTier | null>(null);

  const topPad = isWeb ? 67 : insets.top;
  const botPad = isWeb ? 34 : insets.bottom + 16;

  const handleSelect = async (tier: SubscriptionTier) => {
    if (!user) {
      Alert.alert(
        'Sign in required',
        'Please sign in before subscribing.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/auth/sign-in') },
        ],
      );
      return;
    }
    if (tier === 'free') {
      Alert.alert('Free Plan', 'You are already on the free plan.');
      return;
    }
    if (tier === currentTier) {
      Alert.alert('Already subscribed', `You are already on the ${tier} plan.`);
      return;
    }
    setLoading(tier);
    try {
      await purchasePlan(tier);
      Alert.alert('🎉 Subscribed!', `Welcome to SmartNews ${tier.charAt(0).toUpperCase() + tier.slice(1)}!`);
      router.back();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Purchase failed. Please try again.';
      Alert.alert('Purchase Failed', msg);
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Nav bar */}
      <View
        style={[
          styles.navBar,
          { paddingTop: topPad + 4, borderBottomColor: colors.border, backgroundColor: colors.background },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.navBtn}>
          <Feather name="x" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.foreground }]}>Choose a Plan</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headline, { color: colors.foreground }]}>
            Unlock All of SmartNews
          </Text>
          <Text style={[styles.headlineSub, { color: colors.mutedForeground }]}>
            News, music videos, movies, and live streams — all in one place.
          </Text>
        </View>

        {/* Plan cards */}
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isCurrent = plan.id === currentTier;
          const isLoading = loading === plan.id;
          return (
            <Pressable
              key={plan.id}
              onPress={() => handleSelect(plan.id)}
              disabled={isLoading}
              testID={`plan-${plan.id}`}
              style={({ pressed }) => [
                styles.card,
                {
                  borderColor: isCurrent ? plan.color : colors.border,
                  backgroundColor: colors.card,
                  borderWidth: isCurrent ? 2 : 1,
                  opacity: pressed || isLoading ? 0.85 : 1,
                },
              ]}
            >
              {plan.highlight && (
                <View style={[styles.badge, { backgroundColor: plan.color }]}>
                  <Text style={styles.badgeText}>MOST POPULAR</Text>
                </View>
              )}
              {isCurrent && (
                <View style={[styles.badge, { backgroundColor: plan.color }]}>
                  <Text style={styles.badgeText}>CURRENT PLAN</Text>
                </View>
              )}

              <View style={styles.cardTop}>
                <View>
                  <Text style={[styles.planName, { color: colors.foreground }]}>{plan.name}</Text>
                  <Text style={[styles.planTagline, { color: colors.mutedForeground }]}>
                    {plan.tagline}
                  </Text>
                </View>
                <View style={styles.priceBox}>
                  <Text style={[styles.price, { color: plan.color }]}>{plan.price}</Text>
                  {plan.period !== 'free' && (
                    <Text style={[styles.pricePeriod, { color: colors.mutedForeground }]}>
                      /{plan.period}
                    </Text>
                  )}
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.featureList}>
                {plan.features.map((f) => (
                  <View key={f} style={styles.featureRow}>
                    <Feather name="check" size={14} color={plan.color} />
                    <Text style={[styles.featureText, { color: colors.foreground }]}>{f}</Text>
                  </View>
                ))}
              </View>

              {plan.id !== 'free' && (
                <View
                  style={[
                    styles.selectBtn,
                    {
                      backgroundColor: isCurrent ? colors.secondary : plan.color,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.selectBtnText,
                      { color: isCurrent ? colors.mutedForeground : '#FFF' },
                    ]}
                  >
                    {isLoading
                      ? 'Processing…'
                      : isCurrent
                      ? 'Current Plan'
                      : `Get ${plan.name}`}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}

        {/* Restore purchases */}
        <Pressable onPress={restorePurchases} style={styles.restore}>
          <Text style={[styles.restoreText, { color: colors.mutedForeground }]}>
            Restore purchases
          </Text>
        </Pressable>

        <Text style={[styles.legal, { color: colors.mutedForeground }]}>
          Subscriptions auto-renew monthly unless cancelled at least 24 hours before the renewal date.
          Manage subscriptions in your account settings.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  scroll: { padding: 16, gap: 14 },
  header: { paddingVertical: 12, gap: 6 },
  headline: { fontSize: 24, fontWeight: '700', fontFamily: 'Inter_700Bold', lineHeight: 30 },
  headlineSub: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  card: { borderRadius: 14, padding: 18, gap: 14, overflow: 'hidden' },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
  },
  badgeText: { fontSize: 9, fontFamily: 'Inter_700Bold', color: '#FFF', letterSpacing: 0.5 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  planName: { fontSize: 18, fontWeight: '700', fontFamily: 'Inter_700Bold' },
  planTagline: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  priceBox: { alignItems: 'flex-end' },
  price: { fontSize: 22, fontWeight: '700', fontFamily: 'Inter_700Bold' },
  pricePeriod: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  divider: { height: StyleSheet.hairlineWidth },
  featureList: { gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1 },
  selectBtn: { paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  selectBtnText: { fontSize: 14, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  restore: { alignItems: 'center', paddingVertical: 8 },
  restoreText: { fontSize: 13, fontFamily: 'Inter_400Regular', textDecorationLine: 'underline' },
  legal: { fontSize: 10, textAlign: 'center', fontFamily: 'Inter_400Regular', lineHeight: 15 },
});
