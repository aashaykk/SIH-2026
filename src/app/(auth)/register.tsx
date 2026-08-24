import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../features/auth/AuthContext';
import { COLORS, THEME } from '../../config/constants';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg('Please fill in all fields');
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    try {
      await register(name, email, password);
      router.replace('/(tabs)' as any);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text variant="headlineMedium" style={styles.title}>Create Account</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Join NAGAR-X to report civic issues and verify resolutions
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {errorMsg ? (
              <HelperText type="error" visible={!!errorMsg} style={styles.errorText}>
                {errorMsg}
              </HelperText>
            ) : null}

            <TextInput
              label="Full Name"
              value={name}
              onChangeText={(text) => { setName(text); setErrorMsg(''); }}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="account-outline" />}
              activeOutlineColor={COLORS.primary}
            />

            <TextInput
              label="Email Address"
              value={email}
              onChangeText={(text) => { setEmail(text); setErrorMsg(''); }}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              left={<TextInput.Icon icon="email-outline" />}
              activeOutlineColor={COLORS.primary}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={(text) => { setPassword(text); setErrorMsg(''); }}
              mode="outlined"
              secureTextEntry={secureTextEntry}
              autoCapitalize="none"
              style={styles.input}
              left={<TextInput.Icon icon="lock-outline" />}
              activeOutlineColor={COLORS.primary}
            />

            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={(text) => { setConfirmPassword(text); setErrorMsg(''); }}
              mode="outlined"
              secureTextEntry={secureTextEntry}
              autoCapitalize="none"
              style={styles.input}
              left={<TextInput.Icon icon="lock-check-outline" />}
              right={
                <TextInput.Icon 
                  icon={secureTextEntry ? "eye-outline" : "eye-off-outline"} 
                  onPress={() => setSecureTextEntry(!secureTextEntry)} 
                />
              }
              activeOutlineColor={COLORS.primary}
            />

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.registerButton}
              labelStyle={styles.buttonLabel}
            >
              Sign Up
            </Button>
          </View>

          {/* Redirect to Login */}
          <View style={styles.footer}>
            <Text variant="bodyMedium" style={styles.footerText}>
              Already have an account?{' '}
            </Text>
            <Text
              variant="bodyMedium"
              style={styles.linkText}
              onPress={() => router.push('/(auth)/login')}
            >
              Sign In
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: THEME.padding.lg,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: THEME.padding.lg,
  },
  title: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: THEME.padding.xs,
    paddingHorizontal: THEME.padding.sm,
  },
  formContainer: {
    width: '100%',
    marginBottom: THEME.padding.lg,
  },
  input: {
    marginBottom: THEME.padding.sm,
    backgroundColor: COLORS.surface,
  },
  registerButton: {
    marginTop: THEME.padding.md,
    paddingVertical: 6,
    borderRadius: THEME.roundness,
    backgroundColor: COLORS.primary,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: THEME.padding.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: THEME.padding.md,
  },
  footerText: {
    color: COLORS.textSecondary,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});
