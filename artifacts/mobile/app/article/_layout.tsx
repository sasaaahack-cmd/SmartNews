import { Stack } from 'expo-router';

// This layout makes Expo Router properly discover the article/[id] route
// as a nested Stack group. The article detail screen renders its own
// custom navigation bar (headerShown: false here).
export default function ArticleLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
