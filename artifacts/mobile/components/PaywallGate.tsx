import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useSubscription } from '@/context/SubscriptionContext';
import { CONTENT_TIERS, SUBSCRIPTION_PLANS } from '@/constants/subscriptions';

interface Props {
  contentKey: keyof typeof CONTENT_TIERS;
  children: ReactNode;
}

export function PaywallGate({ contentKey, children }: Props) {
  const { canAccess } = useSubscription();
  if (canAccess(contentKey)) return <>{children}</>;

  const requiredTier = CONTENT_TIERS[contentKey];
  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === requiredTier)!;

  return <UpgradeWall plan={plan} />;
}

function UpgradeWall({ plan }: { plan: (typeof SUBSCRIPTION_PLANS)[number] }) {
  const colors = useColors();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.icon, { backgroundColor: plan.color + '22' }]}>
          <Feather name="lock" size={32} color={plan.color} />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {plan.name} Plan Required
        </Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          Upgrade to {plan.name} to access this content.{'\n'}Starting from {plan.price}/month.
        </Text>
        <Pressable
          onPress={() => router.push('/subscription/plans')}
          style={({ pressed }) => [
            styles.btn,
            { backgroundColor: plan.color, opacity: pressed ? 0.82 : 1 },
          ]}
          testID="upgrade-btn"
        >
          <Text style={styles.btnText}>View Plans</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
    gap: 14,
  },
  icon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700', fontFamily: 'Inter_700Bold', textAlign: 'center' },
  sub: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 21,
  },
  btn: { paddingHorizontal: 32, paddingVertical: 13, borderRadius: 8, marginTop: 4 },
  btnText: { color: '#FFF', fontSize: 15, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
});
