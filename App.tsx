import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Easing,
} from 'react-native';
import LoginScreen from './Login';
import SignUpScreen from './Signup';
import Landing from './Landing';
import Check from './Check';
import NewBar from './NewBar';
import Svg, { Path, Circle } from 'react-native-svg';
import AddFamily from './AddFamily';
import Notification from './Notification';
import History from './History';
import Reminder from './Reminder';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './src/services/api';


const { height } = Dimensions.get('window');


const COLORS = {
  primaryTeal: '#346e7a',
  darkText: '#1f2a44',
  white: '#FFFFFF',
  greyText: '#aab4be',
};


type NewBarMode = 'about' | 'edit' | 'password';


type ScreenType =
  | 'welcome'
  | 'login'
  | 'signup'
  | 'landing'
  | 'check'
  | 'profile'
  | 'addFamily'
  | 'notification'
  | 'history'
  | 'reminder';


type FamilyMember = {
  id: string;
  name: string;
  relation: string;
  emoji: string;
};


const HeartLogo = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;


  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.07,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
  }, [scaleAnim]);


  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Svg width="140" height="140" viewBox="0 0 100 100">
        <Path
          d="M50 88 C48.7 87.3 10 64.5 10 35 C10 21.2 20.6 10.3 33.3 10.3 C40.5 10.3 46.8 13.7 50 19.3 C53.2 13.7 59.5 10.3 66.7 10.3 C79.4 10.3 90 21.2 90 35 C90 64.5 51.3 87.3 50 88 Z"
          fill={COLORS.white}
        />
        <Path
          d="M22 50 H32 L38 32 L46 68 L52 50 H78"
          stroke={COLORS.primaryTeal}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Circle cx="22" cy="50" r="2.5" fill={COLORS.primaryTeal} />
        <Circle cx="78" cy="50" r="2.5" fill={COLORS.primaryTeal} />
      </Svg>
    </Animated.View>
  );
};


const App = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('welcome');
  const [userName, setUserName] = useState<string>('User');
  const [profileMode, setProfileMode] = useState<NewBarMode>('about');


  // shared family list (initially empty)
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);


  const slideAnim = useRef(new Animated.Value(height * 0.5)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;


  useEffect(() => {
    if (currentScreen === 'welcome') {
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
    }
  }, [slideAnim, fadeAnim, currentScreen]);


  // LOGIN SCREEN
  if (currentScreen === 'login') {
    return (
      <LoginScreen
        onBack={() => setCurrentScreen('welcome')}
        onSignUpClick={() => setCurrentScreen('signup')}
        onLoginSuccess={name => {
          setUserName(name || 'User');
          setCurrentScreen('landing');
        }}
      />
    );
  }


  // SIGNUP SCREEN
  if (currentScreen === 'signup') {
    return (
      <SignUpScreen
        onBack={() => setCurrentScreen('welcome')}
        onSignUpSuccess={() => setCurrentScreen('login')}
      />
    );
  }


  // LANDING SCREEN
  if (currentScreen === 'landing') {
    return (
      <Landing
        userName={userName}
        onLogout={() => setCurrentScreen('login')}
        onOpenCheck={() => setCurrentScreen('check')}
        onOpenProfile={(mode: NewBarMode) => {
          setProfileMode(mode);
          setCurrentScreen('profile');
        }}
        onOpenAddFamily={() => setCurrentScreen('addFamily')}
        onOpenNotification={() => setCurrentScreen('notification')}
        onOpenHistory={() => setCurrentScreen('history')}
        familyMembers={familyMembers}
        onOpenReminders={() => setCurrentScreen('reminder')}
      />
    );
  }


  // CHECK SCREEN
  if (currentScreen === 'check') {
    return <Check onBackToLanding={() => setCurrentScreen('landing')} />;
  }


  // PROFILE SCREEN
  if (currentScreen === 'profile') {
    return (
      <NewBar
        mode={profileMode}
        onBack={() => setCurrentScreen('landing')}
      />
    );
  }


  // ADD FAMILY
  if (currentScreen === 'addFamily') {
    return <AddFamily onBack={() => setCurrentScreen('landing')} />;
  }


  // NOTIFICATION
  if (currentScreen === 'notification') {
    return (
      <Notification
        onBack={() => setCurrentScreen('landing')}
        onAcceptFamily={({ id, name, relation }) => {
          setFamilyMembers(prev => {
            // prevent duplicate relation (only one Father/Mother etc.)
            const alreadyExists = prev.some(
              m => m.relation.toLowerCase() === relation.toLowerCase(),
            );
            if (alreadyExists) {
              return prev;
            }


            return [
              ...prev,
              {
                id,
                name,
                relation,
                emoji:
                  relation === 'Father'
                    ? '👨'
                    : relation === 'Mother'
                    ? '👩'
                    : '👤',
              },
            ];
          });
        }}
      />
    );
  }


  // HISTORY
  if (currentScreen === 'history') {
    return <History onBack={() => setCurrentScreen('landing')} />;
  }

  // REMINDER
  if (currentScreen === 'reminder') {
    return <Reminder onBack={() => setCurrentScreen('landing')} />;
  }


  // WELCOME
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryTeal} />


      <View style={styles.topSection}>
        <View style={styles.illustrationPlaceholder}>
          <HeartLogo />
        </View>
      </View>


      <View style={styles.bottomSectionContainer}>
        <Animated.View
          style={[
            styles.bottomSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Mero-Care</Text>
            <Text style={styles.tagline}>"Your Heath Our Care"</Text>


            <TouchableOpacity
              style={styles.loginButton}
              activeOpacity={0.8}
              onPress={() => setCurrentScreen('login')}
            >
              <Text style={styles.loginButtonText}>LOGIN</Text>
            </TouchableOpacity>


            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => setCurrentScreen('signup')}
              >
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
  container: { flex: 1, backgroundColor: COLORS.primaryTeal },
  topSection: {
    height: height * 0.45,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  illustrationPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSectionContainer: { flex: 1, backgroundColor: COLORS.primaryTeal },
  bottomSection: {
    height: '100%',
    width: '100%',
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 50,
    paddingHorizontal: 35,
    alignItems: 'center',
  },
  contentContainer: { width: '100%', alignItems: 'center' },
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
    color: '#c5d4dd',
    fontSize: 14,
    fontWeight: '500',
  },
  signupLink: {
    color: '#3c6f82',
    fontSize: 14,
    fontWeight: '700',
  },
});


export default App;