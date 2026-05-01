import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

const Logo = () => (
  <Svg width={120} height={120} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="#2D3250" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 22V12h6v10" stroke="#2D3250" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M2 12h4l2-3 4 8 2-3h4" stroke="#C5A85F" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function Welcome() {
  const router = useRouter();

  // Animation values
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;
  
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const footerTranslateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        })
      ]),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(titleTranslateY, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        })
      ]),
      Animated.parallel([
        Animated.timing(footerOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(footerTranslateY, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        })
      ])
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View 
          style={[styles.logoContainer, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
        >
          <Logo />
        </Animated.View>

        <Animated.View 
          style={[styles.titleContainer, { opacity: titleOpacity, transform: [{ translateY: titleTranslateY }] }]}
        >
          <Text style={styles.title}>HomePulse</Text>
          <Text style={styles.subtitle}>Smart Home Technology</Text>
        </Animated.View>

        <Animated.View 
          style={[styles.footer, { opacity: footerOpacity, transform: [{ translateY: footerTranslateY }] }]}
        >
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.push('/signup')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>
          
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')} activeOpacity={0.6}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#2D3250',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 8,
  },
  footer: {
    width: '100%',
    paddingBottom: 20,
    position: 'absolute',
    bottom: 30,
  },
  primaryButton: {
    backgroundColor: '#2D3250',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
    shadowColor: '#2D3250',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  loginLink: {
    color: '#C5A85F',
    fontSize: 14,
    fontWeight: '700',
  },
});
