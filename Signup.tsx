import React, { useState } from 'react';
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
} from 'react-native';

const THEME_COLOR = '#265E68';
const TEXT_COLOR = '#333';
const PLACEHOLDER_COLOR = '#AAA';
const BORDER_COLOR = '#E0E0E0';
const ERROR_COLOR = '#D32F2F';

interface InputFieldProps {
  icon: string;
  placeholder: string;
  isPassword?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
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
          hasError && { borderColor: ERROR_COLOR, borderWidth: 2, borderRadius: 10 },
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

interface SignUpScreenProps {
  onBack?: () => void;
  onSignUpSuccess?: () => void;
}

const SignUpScreen = ({ onBack, onSignUpSuccess }: SignUpScreenProps) => {
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
    dateOfBirth: '',
    address: '',
    bloodGroup: '',
    password: '',
    conformPassword: '',
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof formData, string>>
  >({});
  const [loading, setLoading] = useState(false);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Please enter your full name';

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Please enter your mobile number';
    } else if (formData.mobileNumber.length < 10) {
      newErrors.mobileNumber = 'Mobile number must be at least 10 digits';
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Please enter your date of birth';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.dateOfBirth)) {
      newErrors.dateOfBirth = 'Format must be YYYY-MM-DD';
    }

    if (!formData.address.trim()) newErrors.address = 'Please enter your address';

    const validBloodGroups = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
    if (!formData.bloodGroup.trim()) {
      newErrors.bloodGroup = 'Please enter your blood group';
    } else if (!validBloodGroups.includes(formData.bloodGroup)) {
      newErrors.bloodGroup = 'Invalid blood group (e.g. O+, AB-)';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Please enter your password';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.conformPassword.trim()) {
      newErrors.conformPassword = 'Please confirm your password';
    } else if (formData.password !== formData.conformPassword) {
      newErrors.conformPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await new Promise<void>(resolve => setTimeout(resolve, 1500));

      Alert.alert('Success! 🎉', 'Account created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setFormData({
              fullName: '',
              mobileNumber: '',
              email: '',
              dateOfBirth: '',
              address: '',
              bloodGroup: '',
              password: '',
              conformPassword: '',
            });
            setErrors({});
            onSignUpSuccess?.();
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={THEME_COLOR} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backCircle} onPress={onBack}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>

          <View style={styles.topTitles}>
            <Text style={styles.topTitle}>Sign up</Text>
            <Text style={styles.topSubtitle}>Create account</Text>
          </View>
        </View>

        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.card}>
              <InputField icon="👤" placeholder="Full Name" value={formData.fullName} onChangeText={t => updateField('fullName', t)} error={errors.fullName} />
              <InputField icon="📱" placeholder="Mobile Number" keyboardType="phone-pad" value={formData.mobileNumber} onChangeText={t => updateField('mobileNumber', t.replace(/[^0-9]/g, ''))} error={errors.mobileNumber} />
              <InputField icon="✉️" placeholder="Email" keyboardType="email-address" value={formData.email} onChangeText={t => updateField('email', t)} error={errors.email} />
              <InputField icon="🎂" placeholder="Date of Birth (YYYY-MM-DD)" value={formData.dateOfBirth} onChangeText={t => updateField('dateOfBirth', t)} error={errors.dateOfBirth} />
              <InputField icon="📍" placeholder="Address" value={formData.address} onChangeText={t => updateField('address', t)} error={errors.address} />
              <InputField icon="🩸" placeholder="Blood Group (O+, AB-, etc)" value={formData.bloodGroup} onChangeText={t => updateField('bloodGroup', t.toUpperCase())} error={errors.bloodGroup} />
              <InputField icon="🔐" placeholder="Password" isPassword value={formData.password} onChangeText={t => updateField('password', t)} error={errors.password} />
              <InputField icon="🔐" placeholder="Confirm Password" isPassword value={formData.conformPassword} onChangeText={t => updateField('conformPassword', t)} error={errors.conformPassword} />
            </View>

            <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
              <Text style={styles.signupButtonText}>Sign UP</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};



const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
    backgroundColor: THEME_COLOR,
  },
  flex: {
    flex: 1,
    backgroundColor: '#fff',
  },

  topBar: {
    backgroundColor: THEME_COLOR,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  backArrow: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: -1,
  },
  topTitles: {
    marginLeft: 12,
  },
  topTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  topSubtitle: {
    color: '#e0e0e0',
    marginTop: 2,
    fontSize: 13,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 18,
  },

  inputContainer: {
    paddingVertical: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
    paddingBottom: 8,
  },
  inputIcon: {
    fontSize: 22,
    width: 32,
    textAlign: 'center',
  },
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
  eyeIcon: {
    fontSize: 18,
    marginLeft: 8,
    color: '#555',
  },

  errorText: {
    color: ERROR_COLOR,
    fontSize: 12,
    marginTop: 4,
  },

  termsText: {
    textAlign: 'center',
    color: '#777',
    fontSize: 12,
    marginBottom: 16,
  },

  signupButton: {
    backgroundColor: THEME_COLOR,
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  signupButtonDisabled: {
    opacity: 0.7,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SignUpScreen;
