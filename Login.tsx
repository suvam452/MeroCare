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
} from "react-native";

interface LoginScreenProps {
  onBack?: () => void;
}

export default function LoginScreen({ onBack }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const themeColor = "#265E68";

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={themeColor}
        translucent={false}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={[styles.headerBadge, { backgroundColor: themeColor }]}
            onPress={onBack}
          >
            <Text style={styles.headerBadgeText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sign in</Text>
          <Text style={styles.headerSubtitle}>Welcome back</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputRow}>
            <Text style={styles.icon}>@</Text>
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.icon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(s => !s)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.icon}>{showPassword ? "🙈" : "👁️"}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotWrap} onPress={() => console.log("Forgot pressed")}>
            <Text style={styles.forgot}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: themeColor }]}
            onPress={() => console.log("Login pressed", { email, password })}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Tap the back button to return to welcome screen</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 12,
  },
  headerBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    marginBottom: 12,
  },
  headerBadgeText: { color: "#fff", fontSize: 22, marginTop: -2 },
  headerTitle: { fontSize: 32, fontWeight: "700", color: "#111" },
  headerSubtitle: { color: "#666", marginTop: 4, marginBottom: 12 },
  form: {
    paddingHorizontal: 24,
    marginTop: 6,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 12,
    marginBottom: 20,
  },
  icon: { width: 28, textAlign: "center", color: "#666", marginRight: 8 },
  input: { flex: 1, fontSize: 16, color: "#222" },
  forgotWrap: { alignItems: "center", marginBottom: 20 },
  forgot: { color: "#265E68" },
  button: { paddingVertical: 14, borderRadius: 28, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  footer: { flex: 1, justifyContent: "flex-end", padding: 20 },
  footerText: { textAlign: "center", color: "#999", fontSize: 12 },
});