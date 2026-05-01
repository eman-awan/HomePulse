import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { useAuthStore } from '../../store/useAuthStore';
import InputField from '../../components/InputField';
import { seedDefaultData } from '../../db/seed';

const BackArrow = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#2D3250" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const UserIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#8E8E93" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="7" r="4" stroke="#8E8E93" strokeWidth={2} />
  </Svg>
);

const MailIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#8E8E93" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M22 6l-10 7L2 6" stroke="#8E8E93" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const LockIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M19 11H5c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7c0-1.1-.9-2-2-2z" stroke="#8E8E93" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M7 11V7c0-2.76 2.24-5 5-5s5 2.24 5 5v4" stroke="#8E8E93" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function Signup() {
  const router = useRouter();
  const { signup, isLoading } = useAuthStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async () => {
    setError('');
    
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    const { success, message } = await signup(name, email, password);
    
    if (success) {
      // Seed initial data for new user
      seedDefaultData();
      router.replace('/');
    } else {
      setError(message || 'Signup failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <BackArrow />
            </TouchableOpacity>
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start building your smart home today</Text>
          </View>

          <View style={styles.formContainer}>
            <InputField
              label="Full Name"
              placeholder="Enter your full name"
              value={name}
              onChangeText={(text) => { setName(text); setError(''); }}
              icon={<UserIcon />}
            />

            <InputField
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => { setEmail(text); setError(''); }}
              icon={<MailIcon />}
              keyboardType="email-address"
            />
            
            <InputField
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={(text) => { setPassword(text); setError(''); }}
              icon={<LockIcon />}
              secureTextEntry
            />

            <InputField
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={(text) => { setConfirmPassword(text); setError(''); }}
              icon={<LockIcon />}
              secureTextEntry
            />

            {error ? <Text style={styles.mainError}>{error}</Text> : null}

            <TouchableOpacity 
              style={[styles.primaryButton, isLoading && styles.buttonDisabled, { marginTop: 16 }]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              <Text style={styles.primaryButtonText}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.footerLink}>Login</Text>
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
    backgroundColor: '#F5F5F7',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginTop: 10,
    marginBottom: 30,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginLeft: -8,
  },
  titleContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2D3250',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  formContainer: {
    flex: 1,
  },
  mainError: {
    color: '#C55A5A',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#2D3250',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: '#2D3250',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  footerText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  footerLink: {
    color: '#C5A85F',
    fontSize: 14,
    fontWeight: '700',
  },
});
