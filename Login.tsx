import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';

const { height } = Dimensions.get('window');

const THEME_COLOR = '#265E68';
const TEXT_COLOR = '#333';
const PLACEHOLDER_COLOR = '#AAA';
const BORDER_COLOR = '#E0E0E0';
const ERROR_COLOR = '#D32F2F';

const HERO_OUTER = '#164248';
const HERO_INNER = '#b2d8d8';
const HERO_HEART = '#40c8a8';

interface InputFieldProps {
  icon: string;
  placeholder: string;
  isPassword?: boolean;
  keyboardType?: 'default' | 'email-address';
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
  error?: string;
}

const InputField = ({
  icon,
  placeholder,
  isPassword = false,
  keyboardType = 'default',
  value,
  onChangeText,
  editable = true,
  error,
}: InputFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const hasError = !!error;

  return (
    <View style={styles.inputContainer}>
      <View
        style={[
          styles.inputRow,
          hasError && {
            borderColor: ERROR_COLOR,
            borderWidth: 2,
            borderRadius: 10,
          },
        ]}
      >
        <Text style={styles.inputIcon}>{icon}</Text>
        <View style={styles.inputDivider} />
        <TextInput
          style={[styles.textInput, !editable && { opacity: 0.5 }]}
          placeholder={placeholder}
          placeholderTextColor={PLACEHOLDER_COLOR}
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize={isPassword ? 'none' : 'sentences'}
          autoCorrect={!isPassword}
          editable={editable}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            disabled={!editable}
          >
            <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🔒'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {hasError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

interface LoginScreenProps {
  onBack: () => void;
  onSignUpClick: () => void;
  onLoginSuccess: (userName: string) => void;
}

export default function LoginScreen({
  onBack,
  onSignUpClick,
  onLoginSuccess,
}: LoginScreenProps) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<
    Partial<Record<'email' | 'password', string>>
  >({});
  const [loading, setLoading] = useState(false);

  const buttonScale = useState(new Animated.Value(1))[0];
  const heroScale = useState(new Animated.Value(1))[0];
  const heroTranslateY = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(heroScale, {
            toValue: 1.08,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(heroTranslateY, {
            toValue: -8,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(heroScale, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(heroTranslateY, {
            toValue: 0,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, [heroScale, heroTranslateY]);

  const updateField = (field: 'email' | 'password', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<'email' | 'password', string>> = {};
    const email = formData.email.trim();
    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!email) newErrors.email = 'Please enter your email address';
    else if (!emailRegex.test(email))
      newErrors.email = 'Please enter a valid email address';

    if (!formData.password.trim())
      newErrors.password = 'Please enter your password';
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await new Promise<void>(resolve => setTimeout(resolve, 1200));
      const raw = formData.email.split('@')[0] || 'User';
      const name = raw.charAt(0).toUpperCase() + raw.slice(1);
      onLoginSuccess(name);
    } catch {
      Alert.alert('Error', 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    const email = formData.email.trim();
    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Please enter your email address' }));
      return;
    }
    if (!emailRegex.test(email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      return;
    }

    Alert.alert('Success', `Password reset link sent to ${email}`);
  };

  const onPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={THEME_COLOR}
        translucent={false}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backCircle}
              onPress={onBack}
              disabled={loading}
            >
              <Text style={styles.backArrow}>‹</Text>
            </TouchableOpacity>
            <View style={styles.topTitles}>
              <Text style={styles.topTitle}>Login</Text>
              <Text style={styles.topSubtitle}>Welcome back</Text>
            </View>
          </View>
        </View>

        <View style={styles.sheetContainer}>
          <View style={styles.sheet}>
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <ScrollView
                contentContainerStyle={styles.sheetScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.heroWrapper}>
                  <Animated.View
                    style={[
                      styles.heroCircle,
                      {
                        transform: [
                          { scale: heroScale },
                          { translateY: heroTranslateY },
                        ],
                      },
                    ]}
                  >
                    <Text style={styles.heroDoctor}>🧑‍⚕️</Text>
                    <Text style={styles.heroHeart}>💚</Text>
                  </Animated.View>
                  <Text style={styles.heroText}>
                    Caring for you, every day
                  </Text>
                </View>

                <View style={styles.card}>
                  <InputField
                    icon="✉️"
                    placeholder="Email address"
                    keyboardType="email-address"
                    value={formData.email}
                    onChangeText={text => updateField('email', text)}
                    editable={!loading}
                    error={errors.email}
                  />
                  <InputField
                    icon="🔐"
                    placeholder="Password"
                    isPassword
                    value={formData.password}
                    onChangeText={text => updateField('password', text)}
                    editable={!loading}
                    error={errors.password}
                  />
                </View>

                <TouchableOpacity
                  style={styles.forgotPasswordContainer}
                  disabled={loading}
                  onPress={handleForgotPassword}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                <Animated.View
                  style={[
                    styles.loginButtonWrapper,
                    { transform: [{ scale: buttonScale }] },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.loginButton,
                      loading && styles.loginButtonDisabled,
                    ]}
                    onPress={handleLogin}
                    disabled={loading}
                    activeOpacity={0.9}
                    onPressIn={onPressIn}
                    onPressOut={onPressOut}
                  >
                    <Text style={styles.loginButtonText}>
                      {loading ? 'Logging in...' : 'Login'}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>

                <View style={styles.signupRow}>
                  <Text style={styles.signupText}>Don't have an account? </Text>
                  <TouchableOpacity
                    onPress={onSignUpClick}
                    disabled={loading}
                    activeOpacity={0.6}
                  >
                    <Text style={styles.signupLink}>Sign up!</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: THEME_COLOR },
  safeArea: { flex: 1, backgroundColor: THEME_COLOR },
  headerContainer: {
    height: height * 0.27,
    backgroundColor: THEME_COLOR,
    justifyContent: 'flex-start',
  },
  topBar: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  topTitles: { marginLeft: 14 },
  topTitle: { fontSize: 30, fontWeight: '700', color: '#fff' },
  topSubtitle: { color: '#e0e0e0', marginTop: 4, fontSize: 14 },
  sheetContainer: {
    flex: 1,
    backgroundColor: THEME_COLOR,
    marginTop: -10,
  },
  sheet: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  sheetScrollContent: { paddingBottom: 32 },
  heroWrapper: { alignItems: 'center', marginBottom: 22, marginTop: 24 },
  heroCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: HERO_INNER,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: HERO_OUTER,
  },
  heroDoctor: { fontSize: 44 },
  heroHeart: { fontSize: 30, marginTop: -4, color: HERO_HEART as any },
  heroText: {
    marginTop: 12,
    fontSize: 15,
    color: '#2e5a68',
    fontWeight: '600',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  inputContainer: { paddingVertical: 8 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
    paddingBottom: 8,
  },
  inputIcon: { fontSize: 22, width: 32, textAlign: 'center' },
  inputDivider: {
    width: 1,
    height: 24,
    backgroundColor: BORDER_COLOR,
    marginHorizontal: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: TEXT_COLOR,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  eyeIcon: { fontSize: 18, marginLeft: 8, color: '#555' },
  errorText: { color: ERROR_COLOR, fontSize: 12, marginTop: 4 },
  forgotPasswordContainer: { alignItems: 'center', marginBottom: 20 },
  forgotPasswordText: {
    color: '#265E68',
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  loginButtonWrapper: { width: '100%', marginBottom: 24 },
  loginButton: {
    width: '100%',
    backgroundColor: THEME_COLOR,
    borderRadius: 32,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonDisabled: { opacity: 0.7 },
  loginButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  signupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupText: { color: '#777', fontSize: 13, fontWeight: '500' },
  signupLink: { color: THEME_COLOR, fontSize: 13, fontWeight: '700' },
});
