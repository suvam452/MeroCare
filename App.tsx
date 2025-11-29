import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  
  return (
    <SafeAreaProvider>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#0a0e27' : '#ffffff'}
      />
      <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
        <View style={styles.content}>
          {/* Decorative Elements */}
          <View style={[styles.circle, styles.circleTop, isDarkMode && styles.circleDark]} />
          <View style={[styles.circle, styles.circleBottom, isDarkMode && styles.circleDark]} />
          
          {/* Main Content */}
          <View style={styles.logoContainer}>
            <View style={styles.iconWrapper}>
              <View style={[styles.heartIcon, isDarkMode && styles.heartIconDark]}>
                <Text style={styles.heartSymbol}>♥</Text>
              </View>
            </View>
            
            <Text style={[styles.brandName, isDarkMode && styles.brandNameDark]}>
              Mero<Text style={styles.brandAccent}>Care</Text>
            </Text>
            
            <View style={styles.taglineContainer}>
              <View style={[styles.taglineLine, isDarkMode && styles.taglineLineDark]} />
              <Text style={[styles.tagline, isDarkMode && styles.taglineDark]}>
                Your Health, Our Priority
              </Text>
              <View style={[styles.taglineLine, isDarkMode && styles.taglineLineDark]} />
            </View>
          </View>
          
          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            <View style={styles.featureRow}>
              <View style={styles.featureDot} />
              <Text style={[styles.featureText, isDarkMode && styles.featureTextDark]}>
                Professional Healthcare
              </Text>
            </View>
            <View style={styles.featureRow}>
              <View style={styles.featureDot} />
              <Text style={[styles.featureText, isDarkMode && styles.featureTextDark]}>
                Anytime, Anywhere
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  containerDark: {
    backgroundColor: '#0a0e27',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  
  // Decorative circles
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.05,
  },
  circleDark: {
    opacity: 0.03,
  },
  circleTop: {
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: '#4A90E2',
    top: -width * 0.4,
    right: -width * 0.3,
  },
  circleBottom: {
    width: width * 0.6,
    height: width * 0.6,
    backgroundColor: '#50C878',
    bottom: -width * 0.2,
    left: -width * 0.2,
  },
  
  // Logo Container
  logoContainer: {
    alignItems: 'center',
    zIndex: 1,
  },
  iconWrapper: {
    marginBottom: 24,
  },
  heartIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  heartIconDark: {
    backgroundColor: '#1a2a4a',
    shadowColor: '#000',
  },
  heartSymbol: {
    fontSize: 36,
    color: '#4A90E2',
    fontWeight: '300',
  },
  
  // Brand Name
  brandName: {
    fontSize: 52,
    fontWeight: '700',
    color: '#1a1a2e',
    letterSpacing: -1,
    marginBottom: 8,
  },
  brandNameDark: {
    color: '#ffffff',
  },
  brandAccent: {
    color: '#4A90E2',
    fontWeight: '300',
  },
  
  // Tagline
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  taglineLine: {
    width: 30,
    height: 1,
    backgroundColor: '#cbd5e0',
  },
  taglineLineDark: {
    backgroundColor: '#4a5568',
  },
  tagline: {
    fontSize: 14,
    color: '#718096',
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  taglineDark: {
    color: '#a0aec0',
  },
  
  // Bottom Features
  bottomSection: {
    position: 'absolute',
    bottom: 60,
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4A90E2',
  },
  featureText: {
    fontSize: 13,
    color: '#718096',
    fontWeight: '500',
  },
  featureTextDark: {
    color: '#a0aec0',
  },
});

export default App;