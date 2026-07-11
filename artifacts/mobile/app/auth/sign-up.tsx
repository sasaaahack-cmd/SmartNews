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

export default function SignUpScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();
  const isWeb = Platform.OS === 'web';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValid = name.trim().length > 0 && email.trim().length > 0 && password.length >= 6;

  const handleSignUp = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      await signUp(email.trim(), password, name.trim());
      router.back();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not create account. Try again.';
      Alert.alert('Sign Up Failed', msg);
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
            Create your free account
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Field
            icon="user"
            placeholder="Full name"
            value={name}
            onChangeText={setName}
            colors={colors}
            autoCapitalize="words"
            testID="name-input"
          />
          <Field
            icon="mail"
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            colors={colors}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            testID="email-input"
          />
          <View
            style={[
              styles.inputRow,
              { backgroundColor: colors.secondary, borderColor: colors.border },
            ]}
          >
            <Feather name="lock" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Password (min. 6 chars)"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPw}
              returnKeyType="done"
              onSubmitEditing={handleSignUp}
              testID="password-input"
            />
            <Pressable onPress={() => setShowPw((v) => !v)}>
              <Feather name={showPw ? 'eye-off' : 'eye'} size={16} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <Pressable
            onPress={handleSignUp}
            disabled={loading || !isValid}
            testID="sign-up-submit"
            style={({ pressed }) => [
              styles.submitBtn,
              {
                backgroundColor: colors.primary,
                opacity: pressed || loading || !isValid ? 0.65 : 1,
              },
            ]}
          >
            <Text style={[styles.submitText, { color: colors.primaryForeground }]}>
              {loading ? 'Creating account…' : 'Create Account'}
            </Text>
          </Pressable>

          <Text style={[styles.legal, { color: colors.mutedForeground }]}>
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </Text>
        </View>

        {/* Switch */}
        <Pressable
          onPress={() => {
            router.back();
            setTimeout(() => router.push('/auth/sign-in'), 50);
          }}
          testID="go-sign-in"
        >
          <Text style={[styles.switchText, { color: colors.mutedForeground }]}>
            Already have an account?{' '}
            <Text style={{ color: colors.accent, fontFamily: 'Inter_600SemiBold' }}>Sign In</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  icon,
  colors,
  ...props
}: {
  icon: string;
  colors: ReturnType<typeof import('@/hooks/useColors').useColors>;
  [k: string]: unknown;
}) {
  return (
    <View
      style={[
        styles.inputRow,
        { backgroundColor: colors.secondary, borderColor: colors.border },
      ]}
    >
      <Feather name={icon as any} size={16} color={colors.mutedForeground} />
      <TextInput
        style={[styles.input, { color: colors.foreground }]}
        placeholderTextColor={colors.mutedForeground}
        {...(props as object)}
      />
    </View>
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
  legal: { fontSize: 11, textAlign: 'center', fontFamily: 'Inter_400Regular', lineHeight: 16 },
  switchText: { textAlign: 'center', fontSize: 14, fontFamily: 'Inter_400Regular' },
});
