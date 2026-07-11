import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface Props {
  label: string;
  isBreaking?: boolean;
  selected?: boolean;
  onPress?: () => void;
  testID?: string;
}

export function CategoryChip({ label, isBreaking, selected, onPress, testID }: Props) {
  const colors = useColors();
  const bg = isBreaking ? colors.breaking : selected ? colors.accent : 'transparent';
  const textColor = isBreaking || selected ? '#FFFFFF' : colors.accent;
  const borderColor = isBreaking ? colors.breaking : colors.accent;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      testID={testID ?? 'category-chip'}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: bg, borderColor, opacity: pressed ? 0.75 : 1 },
      ]}
    >
      <Text style={[styles.label, { color: textColor }]}>
        {isBreaking ? '● ' : ''}{label.toUpperCase()}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  label: { fontSize: 9, fontFamily: 'Inter_700Bold', letterSpacing: 0.9 },
});
