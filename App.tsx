import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import Svg, { Rect, Circle, Path, Ellipse } from 'react-native-svg';

// Single-file, asset-free recreation of the provided UI.
// Uses react-native-svg for the top illustration so there are no external images to manage.
// This file is written to work with Expo (which includes react-native-svg) or a standard
// react-native project that has react-native-svg installed.

const { width, height } = Dimensions.get('window');
const HEADER_RATIO = 0.42; // portion of screen for the top illustration
const HEADER_HEIGHT = Math.round(height * HEADER_RATIO);

function HeaderIllustration({ w = width, h = HEADER_HEIGHT }: { w?: number; h?: number }) {
  // A simple vector illustration that roughly matches the screenshot: background window,
  // two medical characters, a plant, and a heart with pulse. All drawn with basic shapes so
  // the UI needs no external image files.
  const centerX = w / 2;
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice">
      {/* teal background */}
      <Rect x={0} y={0} width={w} height={h} rx={18} fill="#155f61" />

      {/* subtle rounded window / panel in back */}
      <Rect
        x={w * 0.06}
        y={h * 0.08}
        width={w * 0.88}
        height={h * 0.68}
        rx={28}
        fill="#18626322"
      />

      {/* left plant (pot + leaves) */}
      <Rect
        x={w * 0.08}
        y={h * 0.58}
        width={w * 0.08}
        height={h * 0.18}
        rx={8}
        fill="#434a54"
        opacity={0.9}
      />
      <Ellipse cx={w * 0.12} cy={h * 0.56} rx={w * 0.05} ry={h * 0.03} fill="#2e6b6b" />

      {/* left doctor (simple shapes) */}
      <Circle cx={w * 0.28} cy={h * 0.38} r={h * 0.06} fill="#6f3d6b" />
      <Rect
        x={w * 0.20}
        y={h * 0.44}
        width={w * 0.16}
        height={h * 0.20}
        rx={12}
        fill="#ffffff"
        opacity={1}
      />

      {/* right doctor */}
      <Circle cx={w * 0.74} cy={h * 0.34} r={h * 0.056} fill="#7a3a6d" />
      <Rect
        x={w * 0.66}
        y={h * 0.42}
        width={w * 0.16}
        height={h * 0.20}
        rx={12}
        fill="#ffffff"
      />

      {/* heart with pulse in center */}
      <Path
        d={`M ${centerX - 36} ${h * 0.15}
           c -12 -18 -36 -18 -48 0
           c -12 18 -6 36 24 56
           c 30 -20 36 -38 24 -56
           c -12 -18 -36 -18 -48 0`}
        fill="#ffffff"
        transform={`translate(${centerX - 36}, ${0})`}
        opacity={1}
      />

      {/* pulse line inside small heart icon (simplified) */}
      <Path
        d={`M ${centerX + 10} ${h * 0.10} L ${centerX + 28} ${h * 0.10} L ${centerX + 34} ${h * 0.06} L ${centerX + 44} ${h * 0.14} L ${centerX + 54} ${h * 0.08}`}
        stroke="#155f61"
        strokeWidth={3}
        fill="none"
      />
    </Svg>
  );
}

export default function App(): JSX.Element {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={styles.header.backgroundColor as string}
        translucent={false}
      />

      <View style={styles.screen}>
        <View style={styles.header}>{/* Vector illustration */}
          <HeaderIllustration />
        </View>

        {/* Overlapping white card */}
        <View style={styles.cardContainer} pointerEvents="box-none">
          <View style={styles.card} accessibilityRole="summary">
            <Text style={styles.title} accessible accessibilityRole="header">
              Mero-Care
            </Text>

            <Text style={styles.subtitle}>“Your Health Our Care”</Text>

            <Pressable
              style={({ pressed }) => [
                styles.loginButton,
                pressed ? styles.loginButtonPressed : undefined,
              ]}
              android_ripple={{ color: '#133536' }}
              accessibilityRole="button"
              accessibilityLabel="Login to Mero Care"
            >
              <Text style={styles.loginButtonText}>LOGIN</Text>
            </Pressable>

            <View style={styles.footerRow}>
              <Text style={styles.smText}>Don't have an account? </Text>
              <Text style={styles.linkText} accessibilityRole="link">
                Sign up!
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#4c1b1a', // deep maroon behind the phone frame in screenshot
  },
  screen: {
    flex: 1,
    backgroundColor: '#155f61',
  },
  header: {
    height: HEADER_HEIGHT,
    backgroundColor: '#155f61',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  cardContainer: {
    flex: 1,
    marginHorizontal: 18,
    // Pull up so the card overlaps the header similarly to the screenshot
    marginTop: -40,
  },

  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    paddingTop: 44,
    paddingHorizontal: 26,
    paddingBottom: 26,

    // subtle shadows
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),

    alignItems: 'center',
  },

  title: {
    fontSize: 52,
    lineHeight: 58,
    fontWeight: '800',
    color: '#23344b',
    letterSpacing: 2,
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 16,
    color: '#2b6c6a',
    marginBottom: 34,
    fontWeight: '600',
  },

  loginButton: {
    width: '66%',
    height: 56,
    borderRadius: 14,
    backgroundColor: '#296e6c',
    alignItems: 'center',
    justifyContent: 'center',

    ...Platform.select({
      ios: {
        shadowColor: '#0c3b3a',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  loginButtonPressed: {
    transform: [{ scale: 0.995 }],
    opacity: 0.95,
  },
  loginButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    letterSpacing: 1.6,
    fontSize: 16,
  },

  footerRow: {
    flexDirection: 'row',
    marginTop: 14,
    alignItems: 'center',
  },
  smText: {
    color: '#bfcfcf',
    fontSize: 14,
  },
  linkText: {
    color: '#184f4e',
    fontSize: 14,
    fontWeight: '700',
  },
});
