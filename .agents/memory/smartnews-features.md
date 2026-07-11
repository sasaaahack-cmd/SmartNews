---
name: SmartNews feature map
description: Full inventory of what has been built in the SmartNews mobile app
---

## Tabs (5)
Home, Discover, Media, Saved, Profile

## Subscription tiers (4)
- Free – 5 articles/day
- Reader $2.99/mo – unlimited news, no ads
- Plus $7.99/mo – news + music videos + movies  
- Pro $14.99/mo – everything + live streams

## Payment
`context/SubscriptionContext.tsx` has a `purchasePlan()` stub with a clear TODO comment.
Payment provider (RevenueCat / Stripe / Whop) must be wired in before release.
Bank account is configured in the payment provider's dashboard, never in code.

## Admin panel (`/admin`)
Only visible when `user.isAdmin === true` (Firebase custom claim).
Actions: Publish Article, Publish Music Video, Publish Movie, Start/End Live Stream.
All write to Firestore collections: `articles`, `music_videos`, `movies`, `live_streams`.

## PaywallGate
`components/PaywallGate.tsx` wraps any content with a tier check.
`constants/subscriptions.ts → CONTENT_TIERS` maps content keys to minimum required tier.

## Media (Firestore collections)
- `music_videos` – kind, title, artist, videoUrl, thumbnailUrl, genre, isExclusive
- `movies` – kind, title, description, videoUrl, thumbnailUrl, genre, year, duration, rating
- `live_streams` – kind, title, streamUrl, isLive, hostName, viewerCount

## Firebase config location
`artifacts/mobile/lib/firebase.ts` — update firebaseConfig object with real project credentials before release.

**Why:** needed to remember what's been built to avoid duplication in future sessions.
