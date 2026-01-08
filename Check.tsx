// Check.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  StatusBar,
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
// ---------------------- Constants ----------------------
const COLORS = {
  gradientStart: '#00C4B4',
  gradientEnd: '#00796B',
  background: '#F7FAFC',
  lightCircle: '#D0F4EF',
  userBubble: '#00C4B4',
  botBubble: '#F1F5F9',
  textDark: '#1C1C1E',
  inputBg: '#FFF',
};

const ANIMATION = {
  fadeDuration: 300,
  iconFloatDuration: 1200,
  dotDuration: 300,
};

// ---------------------- Types ----------------------
type Sender = 'user' | 'bot';

interface Message {
  id: string;
  sender: Sender;
  text: string;
}

interface CheckProps {
  onBackToLanding: () => void;
}

// ---------------------- Backend Placeholder ----------------------
async function sendMessageToBackend(userText: string): Promise<string> {
  // TODO: Replace this with your real API call
  return `AI Response for "${userText}" (mock backend)`;
}

// ---------------------- Check Component ----------------------
const Check = ({ onBackToLanding }: CheckProps) => {
  // ---------------------- State ----------------------
  const [step, setStep] = useState<'intro' | 'chat'>('intro');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showPreChat, setShowPreChat] = useState(true);

  // ---------------------- Refs & Animations ----------------------
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const iconFloat = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0.2)).current;
  const dot2 = useRef(new Animated.Value(0.2)).current;
  const dot3 = useRef(new Animated.Value(0.2)).current;
  const flatListRef = useRef<FlatList<Message> | null>(null);
  const inputRef = useRef<TextInput | null>(null);

  const examples = ['Tooth pain', 'Fever & headache', 'Stomach ache', 'Skin rash'];

  // ---------------------- Animations ----------------------
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(iconFloat, { toValue: -8, duration: ANIMATION.iconFloatDuration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(iconFloat, { toValue: 0, duration: ANIMATION.iconFloatDuration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(dot1, { toValue: 1, duration: ANIMATION.dotDuration, useNativeDriver: true }),
        Animated.timing(dot2, { toValue: 1, duration: ANIMATION.dotDuration, useNativeDriver: true }),
        Animated.timing(dot3, { toValue: 1, duration: ANIMATION.dotDuration, useNativeDriver: true }),
        Animated.timing(dot1, { toValue: 0.2, duration: ANIMATION.dotDuration, useNativeDriver: true }),
        Animated.timing(dot2, { toValue: 0.2, duration: ANIMATION.dotDuration, useNativeDriver: true }),
        Animated.timing(dot3, { toValue: 0.2, duration: ANIMATION.dotDuration, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // ---------------------- Auto-scroll ----------------------
  useEffect(() => {
    if (!flatListRef.current) return;
    const t = setTimeout(() => (flatListRef.current as any).scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(t);
  }, [messages]);

  // ---------------------- Handlers ----------------------
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    setShowPreChat(false);

    const userMessage: Message = { id: Date.now().toString(), sender: 'user', text: trimmed };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      const replyText = await sendMessageToBackend(trimmed);
      const botMessage: Message = { id: (Date.now() + 1).toString(), sender: 'bot', text: replyText };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const onInputChange = (text: string) => setInput(text);

  const onPressExample = (ex: string) => {
    setInput(ex);
    setShowPreChat(false);
    setTimeout(() => inputRef.current?.focus?.(), 150);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
      <Animated.View style={[styles.messageRow, { justifyContent: isUser ? 'flex-end' : 'flex-start', opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0,1], outputRange: [10,0] }) }] }]}>
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
          <Text style={isUser ? styles.userText : styles.botText}>{item.text}</Text>
        </View>
      </Animated.View>
    );
  };

  // ---------------------- Intro Page ----------------------
  if (step === 'intro') {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" />
        <Animated.View style={[styles.introWrapper, { opacity: fadeAnim }]}>
          <Animated.View style={{ transform: [{ translateY: iconFloat }] }}>
            <View style={styles.heroCircle}>
              <Text style={{ fontSize: 60 }}>🩺</Text>
            </View>
          </Animated.View>
          <Text style={styles.appTitle}>Mero-Care</Text>
          <Text style={styles.introText}>AI-powered symptom checker. Get guidance instantly.</Text>

          <TouchableOpacity style={styles.startBtn} onPress={() => setStep('chat')}>
            <Text style={styles.startText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backBtn} onPress={onBackToLanding}>
            <Text style={styles.backText}>Back to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // ---------------------- Chat Page ----------------------
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={onBackToLanding}><Text style={styles.backIcon}>‹</Text></TouchableOpacity>
          <Text style={styles.chatTitle}>Mero-Care</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Pre-chat */}
        {messages.length === 0 && showPreChat && (
          <Animated.View style={styles.preChatCard}>
            <Animated.View style={[styles.preIconWrap, { transform: [{ translateY: iconFloat }] }]}>
              <Text style={{ fontSize: 28 }}>🤖</Text>
            </Animated.View>
            <View style={styles.preTextWrap}>
              <Text style={styles.preTitle}>Hi! I'm MeroCare</Text>
              <Text style={styles.preSubtitle}>Tell me your symptoms and I will suggest possible causes.</Text>
              <View style={styles.chipsRow}>
                {examples.map(ex => (
                  <TouchableOpacity key={ex} style={styles.chip} onPress={() => onPressExample(ex)}>
                    <Text style={styles.chipText}>{ex}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.dotsWrap}>
              <Animated.View style={[styles.dot, { opacity: dot1 }]} />
              <Animated.View style={[styles.dot, { opacity: dot2, marginHorizontal: 6 }]} />
              <Animated.View style={[styles.dot, { opacity: dot3 }]} />
            </View>
          </Animated.View>
        )}

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={m => m.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        {/* Input */}
        <View style={styles.inputRow}>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Type your message..."
              placeholderTextColor="#9CA3AF"
              value={input}
              onChangeText={onInputChange}
              multiline
            />
            <TouchableOpacity style={[styles.sendBtn, (!input.trim() || isSending) && { opacity: 0.6 }]} disabled={!input.trim() || isSending} onPress={handleSend}>
              {isSending ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.sendArrow}>➜</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Check;

// ---------------------- Styles ----------------------
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  introWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  heroCircle: { width: 180, height: 180, borderRadius: 90, backgroundColor: COLORS.lightCircle, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12 },
  appTitle: { fontSize: 34, fontWeight: '700', color: COLORS.gradientEnd, marginTop: 24 },
  introText: { fontSize: 16, color: COLORS.textDark, textAlign: 'center', marginVertical: 12 },
  startBtn: { marginTop: 24, backgroundColor: COLORS.gradientEnd, borderRadius: 28, paddingVertical: 16, paddingHorizontal: 40, shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12 },
  startText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  backBtn: { marginTop: 16 },
  backText: { color: COLORS.textDark, fontSize: 14, textDecorationLine: 'underline' },

  chatHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backIcon: { fontSize: 22, color: COLORS.textDark },
  chatTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600', color: COLORS.textDark },

  preChatCard: { margin: 16, backgroundColor: '#FFF', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12 },
  preIconWrap: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.lightCircle, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  preTextWrap: { flex: 1 },
  preTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textDark },
  preSubtitle: { fontSize: 13, color: '#666', marginVertical: 6 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { backgroundColor: '#E0F4EF', borderRadius: 22, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8, marginBottom: 6 },
  chipText: { color: COLORS.gradientEnd, fontSize: 13 },
  dotsWrap: { width: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.gradientEnd, opacity: 0.2 },

  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, flexGrow: 1, justifyContent: 'flex-end' },
  messageRow: { flexDirection: 'row', marginBottom: 12 },
  bubble: { maxWidth: '80%', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 },
  userBubble: { backgroundColor: COLORS.userBubble, borderBottomRightRadius: 6 },
  botBubble: { backgroundColor: COLORS.botBubble, borderBottomLeftRadius: 6 },
  userText: { color: '#FFF', fontSize: 15 },
  botText: { color: COLORS.textDark, fontSize: 15 },

  inputRow: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.inputBg, borderRadius: 30, elevation: 3, shadowColor: '#000', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
  input: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: COLORS.textDark },
  sendBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.gradientEnd, justifyContent: 'center', alignItems: 'center', marginRight: 4 },
  sendArrow: { color: '#FFF', fontSize: 18, fontWeight: '600' },
});