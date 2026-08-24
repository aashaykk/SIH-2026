import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../features/auth/AuthContext';
import { COLORS, THEME } from '../../config/constants';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Please fill in all fields');
      return;
    }
    
    // Quick email format check
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)' as any);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please try again.');
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
          {/* Brand Header */}
          <View style={styles.headerContainer}>
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>NX</Text>
            </View>
            <Text variant="headlineMedium" style={styles.title}>NAGAR-X</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              AI-Powered Civic Intelligence & Resolution Network
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
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.loginButton}
              labelStyle={styles.buttonLabel}
            >
              Sign In
            </Button>
          </View>

          {/* Registration Redirect */}
          <View style={styles.footer}>
            <Text variant="bodyMedium" style={styles.footerText}>
              New to NAGAR-X?{' '}
            </Text>
            <Text
              variant="bodyMedium"
              style={styles.linkText}
              onPress={() => router.push('/(auth)/register')}
            >
              Register Account
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
    marginBottom: THEME.padding.xl,
  },
  logoPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: THEME.padding.md,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  logoText: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  title: {
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 1,
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
    marginBottom: THEME.padding.md,
    backgroundColor: COLORS.surface,
  },
  loginButton: {
    marginTop: THEME.padding.sm,
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
