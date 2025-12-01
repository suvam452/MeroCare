import React, { useState } from "react";
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
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";

interface LoginScreenProps {
  onBack?: () => void;
}

export default function LoginScreen({ onBack }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Focus states for UX feedback
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const themeColor = "#265E68";

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        translucent={false}
      />

      {/* Dismiss keyboard when tapping outside */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={onBack}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            >
              <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>
            
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Welcome Back</Text>
              <Text style={styles.headerSubtitle}>Sign in to continue</Text>
            </View>
          </View>

          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Form Section */}
            <View style={styles.form}>
              
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={[
                  styles.inputWrapper, 
                  emailFocused && { borderColor: themeColor, backgroundColor: "#F0FDFD" }
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="name@example.com"
                    placeholderTextColor="#A0A0A0"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={[
                  styles.inputWrapper, 
                  passwordFocused && { borderColor: themeColor, backgroundColor: "#F0FDFD" }
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#A0A0A0"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((s) => !s)}
                    style={styles.eyeIcon}
                  >
                    <Text style={{ fontSize: 18 }}>{showPassword ? "🙈" : "👁️"}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot Password */}
              <TouchableOpacity 
                style={styles.forgotWrap} 
                onPress={() => console.log("Forgot pressed")}
              >
                <Text style={[styles.forgot, { color: themeColor }]}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Main Button */}
              <TouchableOpacity
                style={[styles.button, { backgroundColor: themeColor }]}
                onPress={onBack}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Log In</Text>
              </TouchableOpacity>

              {/* Sign Up Prompt (Bottom) */}
              <View style={styles.footerRow}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => console.log("Sign up")}>
                  <Text style={[styles.signupText, { color: themeColor }]}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 10,
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  backIcon: {
    fontSize: 40,
    color: "#333",
    marginTop: -10, // Adjust alignment for standard font arrows
  },
  headerTextContainer: {
    marginTop: 10,
  },
  headerTitle: { 
    fontSize: 32, 
    fontWeight: "800", 
    color: "#1A1A1A",
    letterSpacing: -0.5,
  },
  headerSubtitle: { 
    fontSize: 16, 
    color: "#888", 
    marginTop: 8 
  },
  form: { 
    paddingHorizontal: 24, 
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F9FC", // Light gray background
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "transparent", // Default border invisible
    height: 56, // Taller inputs are easier to tap
    paddingHorizontal: 16,
  },
  input: { 
    flex: 1, 
    fontSize: 16, 
    color: "#333",
    height: '100%',
  },
  eyeIcon: {
    padding: 8,
  },
  forgotWrap: { 
    alignItems: "flex-end", // Align right is standard for Forgot Password
    marginBottom: 32,
  },
  forgot: { 
    fontWeight: "600",
    fontSize: 14,
  },
  button: { 
    height: 56, // Match input height
    borderRadius: 16, 
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#265E68",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  buttonText: { 
    color: "#fff", 
    fontSize: 18, 
    fontWeight: "700" 
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    color: "#888",
    fontSize: 15,
  },
  signupText: {
    fontWeight: "700",
    fontSize: 15,
  }
});