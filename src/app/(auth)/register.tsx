import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Image } from 'react-native';
import { TextInput, Text, HelperText, SegmentedButtons } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../features/auth/AuthContext';
import { PrimaryButton } from '../../components/UI/PrimaryButton';
import { COLORS, THEME } from '../../config/constants';
import { UserRole } from '../../types/models';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('CITIZEN');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      await register(trimmedName, trimmedEmail, password, role);
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
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <Image
              source={require('../../../assets/images/vjti_logo.png')}
              style={styles.logoImage}
            />
            <Text variant="headlineMedium" style={styles.title}>Create Account</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Join the VJTI Civic Portal to report and track issues
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text variant="titleLarge" style={styles.cardTitle}>Register</Text>
            <Text variant="bodySmall" style={styles.cardSubtitle}>
              Sign up for a municipal civic account
            </Text>

            {errorMsg ? (
              <View style={styles.errorContainer}>
                <HelperText type="error" visible={!!errorMsg} style={styles.errorText}>
                  {errorMsg}
                </HelperText>
              </View>
            ) : null}

            {/* Role Selection */}
            <View style={styles.roleSection}>
              <Text variant="labelSmall" style={styles.roleLabel}>Account Type:</Text>
              <SegmentedButtons
                value={role}
                onValueChange={(val) => setRole(val as UserRole)}
                buttons={[
                  { value: 'CITIZEN', label: 'Citizen' },
                  { value: 'OFFICER', label: 'Officer' },
                  { value: 'ADMIN', label: 'Admin' },
                ]}
                style={styles.segmentedButtons}
                theme={{ colors: { secondaryContainer: COLORS.primaryLight } }}
              />
            </View>

            <TextInput
              label="Full Name"
              value={name}
              onChangeText={(text) => { setName(text); setErrorMsg(''); }}
              mode="outlined"
              style={styles.input}
              outlineStyle={styles.inputOutline}
              left={<TextInput.Icon icon="account-outline" color={COLORS.textSecondary} />}
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
              outlineStyle={styles.inputOutline}
              left={<TextInput.Icon icon="lock-check-outline" color={COLORS.textSecondary} />}
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
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.registerButton}
            >
              Complete Registration
            </PrimaryButton>
          </View>

          {/* Redirect to Login */}
          <View style={styles.footer}>
            <Text variant="bodyMedium" style={styles.footerText}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text variant="bodyMedium" style={styles.linkText}>
                Sign In
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
  roleSection: {
    marginBottom: THEME.padding.md,
  },
  roleLabel: {
    color: COLORS.textSecondary,
    marginBottom: 6,
    fontWeight: '600',
  },
  segmentedButtons: {
    backgroundColor: COLORS.surface,
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
  registerButton: {
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

