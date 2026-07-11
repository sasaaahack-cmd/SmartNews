import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';

export default function SignInScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const isWeb = Platform.OS === 'web';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password) return;
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.back();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Check your email and password.';
      Alert.alert('Sign In Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.inner,
          { paddingTop: isWeb ? 67 + 24 : insets.top + 24, paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand */}
        <View style={styles.brand}>
          <Text style={[styles.wordmark, { color: colors.foreground }]}>SmartNews</Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            Sign in to your account
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View
            style={[
              styles.inputRow,
              { backgroundColor: colors.secondary, borderColor: colors.border },
            ]}
          >
            <Feather name="mail" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Email address"
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              testID="email-input"
            />
          </View>

          <View
            style={[
              styles.inputRow,
              { backgroundColor: colors.secondary, borderColor: colors.border },
            ]}
          >
            <Feather name="lock" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Password"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPw}
              returnKeyType="done"
              onSubmitEditing={handleSignIn}
              testID="password-input"
            />
            <Pressable onPress={() => setShowPw((v) => !v)} testID="toggle-password">
              <Feather name={showPw ? 'eye-off' : 'eye'} size={16} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <Pressable
            onPress={handleSignIn}
            disabled={loading || !email || !password}
            testID="sign-in-submit"
            style={({ pressed }) => [
              styles.submitBtn,
              {
                backgroundColor: colors.primary,
                opacity: pressed || loading || !email || !password ? 0.65 : 1,
              },
            ]}
          >
            <Text style={[styles.submitText, { color: colors.primaryForeground }]}>
              {loading ? 'Signing in…' : 'Sign In'}
            </Text>
          </Pressable>
        </View>

        {/* Switch */}
        <Pressable
          onPress={() => {
            router.back();
            setTimeout(() => router.push('/auth/sign-up'), 50);
          }}
          testID="go-sign-up"
        >
          <Text style={[styles.switchText, { color: colors.mutedForeground }]}>
            No account?{' '}
            <Text style={{ color: colors.accent, fontFamily: 'Inter_600SemiBold' }}>Create one</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { paddingHorizontal: 24, gap: 24 },
  brand: { alignItems: 'center', gap: 6, marginBottom: 4 },
  wordmark: { fontSize: 30, fontWeight: '700', fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  tagline: { fontSize: 15, fontFamily: 'Inter_400Regular' },
  form: { gap: 12 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  submitBtn: { paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  submitText: { fontSize: 15, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  switchText: { textAlign: 'center', fontSize: 14, fontFamily: 'Inter_400Regular' },
});
