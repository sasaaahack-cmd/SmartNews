import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

function SkeletonBox({
  width,
  height,
  borderRadius = 4,
}: {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
}) {
  const opacity = useRef(new Animated.Value(0.35)).current;
  const colors = useColors();

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 700, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{ width: width as number, height, borderRadius, backgroundColor: colors.muted, opacity }}
    />
  );
}

export function ArticleCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <SkeletonBox width="60%" height={12} />
        <SkeletonBox width="95%" height={15} />
        <SkeletonBox width="80%" height={15} />
        <SkeletonBox width="55%" height={11} />
      </View>
      <SkeletonBox width={88} height={68} borderRadius={5} />
    </View>
  );
}

export function FeaturedCardSkeleton() {
  return (
    <View>
      <SkeletonBox width="100%" height={220} borderRadius={0} />
      <View style={styles.featured}>
        <SkeletonBox width="35%" height={12} />
        <SkeletonBox width="95%" height={22} />
        <SkeletonBox width="80%" height={22} />
        <SkeletonBox width="60%" height={16} />
        <SkeletonBox width="45%" height={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D8D5CE',
    alignItems: 'flex-start',
  },
  cardLeft: { flex: 1, gap: 8 },
  featured: { padding: 16, gap: 10 },
});
