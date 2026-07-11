/**
 * SubscriptionContext
 *
 * Tracks the user's current subscription tier.
 * Wire `purchasePlan` to your chosen payment provider SDK before release:
 *   - RevenueCat:  Purchases.purchasePackage(...)
 *   - Stripe:      open Stripe checkout session
 *   - Whop:        open Whop checkout
 *
 * The bank account payout is configured once in the payment provider's
 * dashboard — never in app code.
 */
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { SubscriptionTier, hasAccess, CONTENT_TIERS } from '@/constants/subscriptions';

const STORAGE_KEY = '@smartnews/subscription_tier';

interface SubscriptionCtx {
  tier: SubscriptionTier;
  isLoading: boolean;
  /** Call this with the selected plan's tier to initiate purchase flow */
  purchasePlan: (tier: SubscriptionTier) => Promise<void>;
  /** Returns true if the user can access a specific content type */
  canAccess: (contentKey: keyof typeof CONTENT_TIERS) => boolean;
  /** Restore previously purchased subscription */
  restorePurchases: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionCtx | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted tier on mount / user change
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        if (!user) {
          setTier('free');
          return;
        }
        const stored = await AsyncStorage.getItem(`${STORAGE_KEY}/${user.uid}`);
        if (stored && ['free', 'reader', 'plus', 'pro'].includes(stored)) {
          setTier(stored as SubscriptionTier);
        } else {
          setTier('free');
        }
      } catch {
        setTier('free');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [user?.uid]);

  /**
   * Initiate a subscription purchase.
   *
   * ── Before releasing the app ──────────────────────────────────────────
   * Replace the TODO block with your payment SDK call, e.g. RevenueCat:
   *
   *   const offerings = await Purchases.getOfferings();
   *   const pkg = offerings.current?.availablePackages.find(
   *     p => p.product.identifier === SUBSCRIPTION_PLANS.find(s => s.id === tier)?.productId
   *   );
   *   if (pkg) {
   *     const { customerInfo } = await Purchases.purchasePackage(pkg);
   *     // customerInfo.entitlements will confirm access
   *   }
   * ─────────────────────────────────────────────────────────────────────
   */
  const purchasePlan = async (newTier: SubscriptionTier) => {
    if (!user) throw new Error('Sign in before purchasing a subscription.');
    // TODO: call payment SDK here
    // For now, store locally (replace with real verification in production)
    await AsyncStorage.setItem(`${STORAGE_KEY}/${user.uid}`, newTier);
    setTier(newTier);
  };

  const canAccess = (contentKey: keyof typeof CONTENT_TIERS): boolean => {
    const required = CONTENT_TIERS[contentKey];
    return hasAccess(tier, required);
  };

  const restorePurchases = async () => {
    // TODO: call payment SDK restore, e.g. Purchases.restorePurchases()
    // then update tier from restored customerInfo
  };

  return (
    <SubscriptionContext.Provider value={{ tier, isLoading, purchasePlan, canAccess, restorePurchases }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionCtx {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used inside SubscriptionProvider');
  return ctx;
}
