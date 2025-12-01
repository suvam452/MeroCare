import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
  StatusBar,
  Easing,
} from 'react-native';
// We only import the necessary SVG components to minimize potential issues
import LoginScreen from './Login';
import Svg, { Path, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// --- Constants & Colors ---
const COLORS = {
  primaryTeal: '#346e7a', // Main background and button color
  darkText: '#1f2a44',    // Title and tagline color
  white: '#FFFFFF',       // Card background and heart color
  greyText: '#aab4be',    // "Don't have an account" text
};

// --- Animated Logo Component ---

/**
 * The Heart Beat Graphic (Pure Code Re-creation with subtle Pulse Animation)
 */
const HeartLogo = () => {
  // Animation for the heartbeat pulse
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        // Quick expansion (pulse)
        Animated.timing(scaleAnim, {
          toValue: 1.07,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        // Slower return to normal
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
  }, [scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Svg width="140" height="140" viewBox="0 0 100 100">
        {/* White Heart Shape */}
        <Path
          d="M50 88 C48.7 87.3 10 64.5 10 35 C10 21.2 20.6 10.3 33.3 10.3 C40.5 10.3 46.8 13.7 50 19.3 C53.2 13.7 59.5 10.3 66.7 10.3 C79.4 10.3 90 21.2 90 35 C90 64.5 51.3 87.3 50 88 Z"
          fill={COLORS.white}
        />
        {/* Teal Heartbeat Line */}
        <Path
          d="M22 50 H32 L38 32 L46 68 L52 50 H78"
          stroke={COLORS.primaryTeal}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Dots on the line ends */}
        <Circle cx="22" cy="50" r="2.5" fill={COLORS.primaryTeal} />
        <Circle cx="78" cy="50" r="2.5" fill={COLORS.primaryTeal} />
      </Svg>
    </Animated.View>
  );
};

// --- Main App Component ---

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const slideAnim = useRef(new Animated.Value(height * 0.5)).current; // Start the card below the screen
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Card slide-up and content fade-in animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim]);

 // if login screen should be shown
 if (showLogin){
  return <LoginScreen onBack={() => setShowLogin(false)} />;
 }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryTeal} />
      
      {/* Top Section: Graphic Area */}
      <View style={styles.topSection}>
        {/* Placeholder for Doctors/Plant Illustration 
            We use simple views to maintain the correct spacing and background color. */}
        <View style={styles.illustrationPlaceholder}>
          <HeartLogo />
        </View>
      </View>

      {/* Bottom Section: White Card Container */}
      <View style={styles.bottomSectionContainer}>
        <Animated.View 
          style={[
            styles.bottomSection,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }] // Slide animation applied here
            }
          ]}
        >
          <View style={styles.contentContainer}>
            {/* Title */}
            <Text style={styles.title}>Mero-Care</Text>
            
            {/* Tagline - Keeping the typo "Heath" to be 100% faithful to the screenshot */}
            <Text style={styles.tagline}>“Your Heath Our Care”</Text>

            {/* Login Button */}
            <TouchableOpacity 
            style={styles.loginButton} 
            activeOpacity={0.8}
            onPress={()=>setShowLogin(true)}
            >
              <Text style={styles.loginButtonText}>LOGIN</Text>
            </TouchableOpacity>

            {/* Sign Up Area */}
            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don’t have an account? </Text>
              <TouchableOpacity activeOpacity={0.6}>
                <Text style={styles.signupLink}>Sign up!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryTeal,
  },
  topSection: {
    // Ratio of top section to bottom card is about 45:55 on the screen
    height: height * 0.45, 
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
    position: 'relative',
  },
  illustrationPlaceholder: {
    // This maintains the original image layout where the logo is centered
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    // In a final production app, the Doctor/Plant illustration would be placed here
  },
  bottomSectionContainer: {
    flex: 1,
    backgroundColor: COLORS.primaryTeal,
  },
  bottomSection: {
    height: '100%',
    width: '100%',
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 50,
    paddingHorizontal: 35, // Increased padding to match the 'card' look
    alignItems: 'center',
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '800', 
    color: COLORS.darkText,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 18,
    color: COLORS.darkText,
    fontWeight: '500',
    marginBottom: 60,
    letterSpacing: 0.5,
  },
  loginButton: {
    width: '100%',
    backgroundColor: COLORS.primaryTeal,
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    // Soft shadow to match the lifted button look
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  signupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  signupText: {
    color: COLORS.greyText,
    fontSize: 14,
    fontWeight: '500',
  },
  signupLink: {
    color: COLORS.primaryTeal,
    fontSize: 14,
    fontWeight: '800',
  },
});

export default App;