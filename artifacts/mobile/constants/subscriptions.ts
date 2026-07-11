// Subscription tier definitions
// Payment processing happens through the chosen provider (RevenueCat / Stripe / Whop).
// Bank account payout is configured once in your payment processor's dashboard.

export type SubscriptionTier = 'free' | 'reader' | 'plus' | 'pro';

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  price: string;         // display price e.g. "$4.99"
  priceUsd: number;      // numeric USD cents for comparison
  period: 'month' | 'year' | 'free';
  tagline: string;
  features: string[];
  highlight?: boolean;   // show "Most Popular" badge
  color: string;         // accent colour for card
  productId: string;     // RevenueCat / Stripe / store product ID (set before going live)
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    priceUsd: 0,
    period: 'free',
    tagline: 'Get started with the basics',
    features: [
      'Up to 5 articles per day',
      'Breaking news alerts',
      'Standard categories',
    ],
    color: '#6B7280',
    productId: '',
  },
  {
    id: 'reader',
    name: 'Reader',
    price: '$2.99',
    priceUsd: 299,
    period: 'month',
    tagline: 'Unlimited news, zero ads',
    features: [
      'Unlimited articles',
      'No advertisements',
      'Offline reading',
      'Save unlimited articles',
      'Breaking news alerts',
    ],
    color: '#3A5A78',
    productId: 'smartnews_reader_monthly',
  },
  {
    id: 'plus',
    name: 'Plus',
    price: '$7.99',
    priceUsd: 799,
    period: 'month',
    tagline: 'News + music & movies',
    highlight: true,
    features: [
      'Everything in Reader',
      'Music video library',
      'Movie streaming',
      'Exclusive interviews',
      'Download for offline viewing',
    ],
    color: '#5B4FCF',
    productId: 'smartnews_plus_monthly',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$14.99',
    priceUsd: 1499,
    period: 'month',
    tagline: 'Everything, including live',
    features: [
      'Everything in Plus',
      'Live stream access',
      'Live event chat',
      'Early access to content',
      'Priority customer support',
      'Ad-free experience',
    ],
    color: '#B3271E',
    productId: 'smartnews_pro_monthly',
  },
];

// Map each piece of content to the minimum tier required
export const CONTENT_TIERS: Record<string, SubscriptionTier> = {
  news_unlimited: 'reader',
  music_videos: 'plus',
  movies: 'plus',
  live_streams: 'pro',
};

export function tierRank(tier: SubscriptionTier): number {
  return { free: 0, reader: 1, plus: 2, pro: 3 }[tier];
}

export function hasAccess(userTier: SubscriptionTier, required: SubscriptionTier): boolean {
  return tierRank(userTier) >= tierRank(required);
}
