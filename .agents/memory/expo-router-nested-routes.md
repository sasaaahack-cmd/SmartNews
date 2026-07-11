---
name: Expo Router nested dynamic routes
description: How to make Expo Router discover dynamic routes in subdirectories
---

## Rule
Any file at `app/<dir>/[param].tsx` requires a companion `app/<dir>/_layout.tsx` to be discovered by Expo Router. Without it, the root `_layout.tsx` Stack emits "No route named '<dir>/[param]' exists in nested children" and navigation silently fails.

## How to apply
1. Create `app/<dir>/_layout.tsx` returning `<Stack screenOptions={{ headerShown: false }} />`.
2. In the root `_layout.tsx` Stack, register `<Stack.Screen name="<dir>" options={{ headerShown: false }} />` — reference the **directory name**, not `<dir>/[param]`.
3. Navigate with `router.push('/\<dir\>/\<value\>')` as normal.

**Why:** Expo Router's file-system discovery treats a directory without `_layout.tsx` as an ambiguous group — the dynamic screen inside is not promoted to the root Stack's child list.
