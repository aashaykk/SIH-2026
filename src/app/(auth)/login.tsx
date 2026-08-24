import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Image } from 'react-native';
import { TextInput, Text, HelperText, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../features/auth/AuthContext';
import { PrimaryButton } from '../../components/UI/PrimaryButton';
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
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      await login(trimmedEmail, password);
      router.replace('/(tabs)' as any);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Quick preset loader for demonstration / rapid testing
  const selectPreset = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword('password123');
    setErrorMsg('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Header */}
          <View style={styles.headerContainer}>
            <Image
              source={require('../../../assets/images/vjti_logo.png')}
              style={styles.logoImage}
            />
            <Text variant="headlineMedium" style={styles.title}>NAGAR-X</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              VJTI Civic Intelligence & Operations Portal
            </Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <Text variant="titleLarge" style={styles.cardTitle}>Sign In</Text>
            <Text variant="bodySmall" style={styles.cardSubtitle}>
              Access your civic dashboard and reports
            </Text>

            {errorMsg ? (
              <View style={styles.errorContainer}>
                <HelperText type="error" visible={!!errorMsg} style={styles.errorText}>
                  {errorMsg}
                </HelperText>
              </View>
            ) : null}

            {/* Quick test credentials */}
            <View style={styles.presetSection}>
              <Text variant="labelSmall" style={styles.presetLabel}>Quick Demo Account:</Text>
              <View style={styles.chipRow}>
                <Chip
                  mode="outlined"
                  compact
                  selected={email === 'citizen@nagarx.gov'}
                  onPress={() => selectPreset('citizen@nagarx.gov')}
                  style={styles.chip}
                  textStyle={styles.chipText}
                >
                  Citizen Demo Account
                </Chip>
              </View>
            </View>

            <TextInput
              label="Email Address"
              value={email}
              onChangeText={(text) => { setEmail(text); setErrorMsg(''); }}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              outlineStyle={styles.inputOutline}
              left={<TextInput.Icon icon="email-outline" color={COLORS.textSecondary} />}
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
              outlineStyle={styles.inputOutline}
              left={<TextInput.Icon icon="lock-outline" color={COLORS.textSecondary} />}
              right={
                <TextInput.Icon 
                  icon={secureTextEntry ? "eye-outline" : "eye-off-outline"} 
                  onPress={() => setSecureTextEntry(!secureTextEntry)} 
                  color={COLORS.textSecondary}
                />
              }
              activeOutlineColor={COLORS.primary}
            />

            <PrimaryButton
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
            >
              Sign In to Account
            </PrimaryButton>
          </View>

          {/* Registration Redirect */}
          <View style={styles.footer}>
            <Text variant="bodyMedium" style={styles.footerText}>
              {"Don't have an account? "}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text variant="bodyMedium" style={styles.linkText}>
                Register Here
              </Text>
            </TouchableOpacity>
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
  logoImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: THEME.padding.sm,
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
    paddingHorizontal: THEME.padding.md,
    fontSize: 13,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: THEME.roundness * 1.5,
    padding: THEME.padding.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardTitle: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  cardSubtitle: {
    color: COLORS.textSecondary,
    marginBottom: THEME.padding.md,
    marginTop: 2,
  },
  presetSection: {
    marginBottom: THEME.padding.md,
    padding: THEME.padding.sm,
    backgroundColor: COLORS.background,
    borderRadius: THEME.roundness,
  },
  presetLabel: {
    color: COLORS.textSecondary,
    marginBottom: 6,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    backgroundColor: COLORS.surface,
  },
  chipText: {
    fontSize: 11,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: THEME.roundness,
    padding: THEME.padding.xs,
    marginBottom: THEME.padding.sm,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    margin: 0,
    padding: 0,
  },
  input: {
    marginBottom: THEME.padding.sm,
    backgroundColor: COLORS.surface,
  },
  inputOutline: {
    borderRadius: THEME.roundness,
    borderColor: COLORS.border,
  },
  submitButton: {
    marginTop: THEME.padding.sm,
    paddingVertical: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: THEME.padding.lg,
  },
  footerText: {
    color: COLORS.textSecondary,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

