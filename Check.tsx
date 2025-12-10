  // Check.tsx // puskarrrr
import React, { useState } from 'react';
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
} from 'react-native';

// ---- THEME ----
const PRIMARY = '#00796B';
const LIGHT_BG = '#FFFFFF';
const LIGHT_CIRCLE = '#E0F5F1';
const USER_BUBBLE = PRIMARY;
const BOT_BUBBLE = '#E5E5E5';
const TEXT_DARK = '#333333';

type Sender = 'user' | 'bot';

interface Message {
  id: string;
  sender: Sender;
  text: string;
}

// this prop lets App.tsx control navigation
interface CheckProps {
  onBackToLanding: () => void;
}

// ---- BACKEND PLACEHOLDER ----
async function sendMessageToBackend(userText: string): Promise<string> {
  return (
    "Thanks for sharing your symptoms. This is a dummy reply.\n" +
    'Later this will come from your real Mero‑Care backend.'
  );
}

// ---- MAIN SCREEN (intro + chat) ----
const Check = ({ onBackToLanding }: CheckProps) => {
  const [step, setStep] = useState<'intro' | 'chat'>('intro');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text:
        'The tooth pain and black spot may be signs of a developing cavity. ' +
        'It is better to avoid very hard or sweet foods and visit a dentist soon.',
    },
    {
      id: '2',
      sender: 'bot',
      text:
        'Here are three possible causes:\n' +
        '1. Dental cavity (tooth decay)\n' +
        '2. Tooth stain\n' +
        '3. Cracked tooth',
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: trimmed,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      const replyText = await sendMessageToBackend(trimmed);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: replyText,
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        sender: 'bot',
        text:
          'Sorry, there was a problem talking to the server. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
      <View
        style={[
          styles.messageRow,
          { justifyContent: isUser ? 'flex-end' : 'flex-start' },
        ]}
      >
        <View
          style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.botBubble,
          ]}
        >
          <Text style={isUser ? styles.userText : styles.botText}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  // ---------- INTRO UI ----------
  if (step === 'intro') {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.introWrapper}>
          <Text style={styles.appTitle}>Mero‑Care</Text>
          <Text style={styles.introText}>
            Using this app you can ask possible health related disease from your
            symptoms.
          </Text>

          <View style={styles.illustrationCircle}>
            <Text style={{ fontSize: 40 }}>🩺</Text>
          </View>

          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => setStep('chat')}
          >
            <Text style={styles.continueText}>Continue</Text>
            <Text style={styles.continueArrow}>➜</Text>
          </TouchableOpacity>

          {/* Optional: button to go back to Landing from intro */}
          <TouchableOpacity
            style={{ marginTop: 12, alignSelf: 'center' }}
            onPress={onBackToLanding}
          >
            <Text style={{ color: TEXT_DARK, fontSize: 13 }}>Back to home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ---------- CHAT UI ----------
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.chatHeader}>
        {/* Back to Landing (home) */}
        <TouchableOpacity onPress={onBackToLanding}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.chatTitle}>Mero care</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* First user question bubble (fixed example like design) */}
      <View style={styles.topQuestionRow}>
        <View style={[styles.bubble, styles.userBubble]}>
          <Text style={styles.userText}>
            I have had tooth pain for two days and noticed a black spot?
          </Text>
        </View>
      </View>

      {/* Messages from backend / mock */}
      <FlatList
        data={messages}
        keyExtractor={m => m.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Input bar */}
      <View style={styles.inputRow}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Write your message"
            placeholderTextColor="#A0A0A0"
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!input.trim() || isSending) && { opacity: 0.6 },
            ]}
            disabled={!input.trim() || isSending}
            onPress={handleSend}
          >
            {isSending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.sendArrow}>➜</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Check;

// ---- STYLES ----
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },

  // Intro
  introWrapper: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'space-between',
  },
  appTitle: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: PRIMARY,
  },
  introText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#555',
    fontSize: 14,
  },
  illustrationCircle: {
    alignSelf: 'center',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: LIGHT_CIRCLE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueBtn: {
    marginBottom: 16,
    backgroundColor: PRIMARY,
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  continueArrow: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 18,
  },

  // Chat
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backIcon: {
    fontSize: 22,
    color: TEXT_DARK,
  },
  chatTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: TEXT_DARK,
  },
  topQuestionRow: {
    paddingHorizontal: 16,
    marginTop: 8,
    alignItems: 'flex-end',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: USER_BUBBLE,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: BOT_BUBBLE,
    borderBottomLeftRadius: 4,
  },
  userText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  botText: {
    color: TEXT_DARK,
    fontSize: 14,
  },

  inputRow: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: TEXT_DARK,
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  sendArrow: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});