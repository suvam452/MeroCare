// Check.tsx
import React, { useEffect, useRef, useState } from 'react';
import RNFS from 'react-native-fs';
import RNShare from 'react-native-share';
import {
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
  Linking,    
  PermissionsAndroid,
  Alert,  
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


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
async function sendMessageToBackend(userText: string, age?: number, gender?: string): Promise<any> {
  try {
     const response = await fetch(`${'http://192.168.1.70:8000/diagnosis'}/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
     body: JSON.stringify({
  symptoms: [userText], 
  age: age || 25,            
  gender: gender || "Not specified"        
}),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Backend API Error:', error);
    throw error;
  }
}
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };
  
  return date.toLocaleString('en-US', options);
};

// ---------------------- Check Component ----------------------
const Check = ({ onBackToLanding }: CheckProps) => {
  // ---------------------- State ----------------------
  const [step, setStep] = useState<'intro' | 'chat'>('intro');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showPreChat, setShowPreChat] = useState(true);
  const [userAge, setUserAge] = useState<string>('');
const [userGender, setUserGender] = useState<string>('');
const [showVisibilityModal, setShowVisibilityModal] = useState(false);
const [selectedDiagnosis, setSelectedDiagnosis] = useState<string>('');

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

  
  if (step !== 'intro') return;

  const floatAnimation = Animated.loop(
    Animated.sequence([
      Animated.timing(iconFloat, { toValue: -8, duration: ANIMATION.iconFloatDuration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(iconFloat, { toValue: 0, duration: ANIMATION.iconFloatDuration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])
  );
  floatAnimation.start();

  const dotAnimation = Animated.loop(
    Animated.sequence([
      Animated.timing(dot1, { toValue: 1, duration: ANIMATION.dotDuration, useNativeDriver: true }),
      Animated.timing(dot2, { toValue: 1, duration: ANIMATION.dotDuration, useNativeDriver: true }),
      Animated.timing(dot3, { toValue: 1, duration: ANIMATION.dotDuration, useNativeDriver: true }),
      Animated.timing(dot1, { toValue: 0.2, duration: ANIMATION.dotDuration, useNativeDriver: true }),
      Animated.timing(dot2, { toValue: 0.2, duration: ANIMATION.dotDuration, useNativeDriver: true }),
      Animated.timing(dot3, { toValue: 0.2, duration: ANIMATION.dotDuration, useNativeDriver: true }),
    ])
  );
  dotAnimation.start();

  
  return () => {
    floatAnimation.stop();
    dotAnimation.stop();
  };
}, [step]); // Add 'step' to dependency array

  // ---------------------- Auto-scroll ----------------------
  useEffect(() => {
    if (!flatListRef.current) return;
    const t = setTimeout(() => (flatListRef.current as any).scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(t);
  }, [messages]);

  // ---------------------- Handlers ----------------------
  const handleSend = async () => 
    {
    if (userAge && (parseInt(userAge) < 0 || parseInt(userAge) > 120)) {
    Alert.alert('Invalid Age', 'Please enter a valid age between 0-120');
    return;
    }
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    setShowPreChat(false);

    const userMessage: Message = { id: Date.now().toString(), sender: 'user', text: trimmed };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

   try {
  const diagnosis = await sendMessageToBackend(trimmed, userAge ? parseInt(userAge) : undefined,
  userGender || undefined);
  

const urgencyEmoji = 
  diagnosis.urgency === 'EMERGENCY' ? '🚨' :
  diagnosis.urgency === 'URGENT' ? '⚠️' : '✅';
let explanationText = '';
try {
  const parsedResponse = JSON.parse(diagnosis.full_response);
  explanationText = parsedResponse.full_response || '';
} catch (e) {
  console.log('Could not parse full_response');
}
const replyText = `Symptoms:${diagnosis.symptoms}\n\n ${urgencyEmoji} Predicted Disease: ${diagnosis.predicted_disease}\n\nTreatment: ${diagnosis.suggested_treatment}\n\nUrgency Level: ${diagnosis.urgency}${explanationText ? `\n\n📋 Additional Information:\n${diagnosis.fullresponse}${explanationText}` : ''}`;  
  const botMessage: Message = { 
    id: (Date.now() + 1).toString(), 
    sender: 'bot', 
    text: replyText 
  };
  setMessages(prev => [...prev, botMessage]);
} catch (error) {
 
  const errorMessage: Message = {
    id: (Date.now() + 1).toString(),
    sender: 'bot',
    text: '❌ Sorry, I encountered an error. Please check your connection and try again.'
  };
  setMessages(prev => [...prev, errorMessage]);
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
  
const handleEmail = (diagnosisText: string) => {
  const subject = 'My Mero-Care Diagnosis';
  const body = diagnosisText;
  const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  Linking.openURL(emailUrl).catch(err => {
    console.error('Failed to open email client:', err);
    Alert.alert('Error', 'Could not open email client');
  });
};

const handleAdd = async (diagnosisText: string) => {
  setSelectedDiagnosis(diagnosisText);
  setShowVisibilityModal(true);
};

const handleDownload = async (diagnosisText: string) => {
  try {
  
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `MeroCare_Diagnosis_${timestamp}.txt`;
    
    
    const path = `${RNFS.DownloadDirectoryPath}/${fileName}`;
    
    
    await RNFS.writeFile(path, diagnosisText, 'utf8');
    
    Alert.alert(
      'Success!', 
      `Diagnosis saved to Downloads folder as:\n${fileName}`,
      [
        { text: 'OK' },
        { 
          text: 'Share', 
          onPress: () => shareSavedFile(path)
        }
      ]
    );
  } catch (error) {
    console.error('Failed to download diagnosis:', error);
    Alert.alert('Error', 'Failed to save file to device');
  }
};
const handleQuickShare = async (diagnosisText: string) => {
  try {
    await RNShare.open({
      message: diagnosisText,
      title: 'My Mero-Care Diagnosis',
    });
  } catch (error) {
    console.log('Share cancelled or failed');
  }
};
const saveToHistory = async (visibility: 'public' | 'private') => {
  try {
    const response = await fetch('http://192.168.1.70:8000/diagnosis/save-history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_diagnosis: selectedDiagnosis,
        visibility: visibility,
        created_at: new Date().toISOString()
      }),
    });

    if (response.ok) {
      Alert.alert('Success!', 'Diagnosis saved to history');
      setShowVisibilityModal(false);
    } else {
      Alert.alert('Error', 'Failed to save diagnosis');
    }
  } catch (error) {
    Alert.alert('Error', 'Could not save to history');
  }
};


const shareSavedFile = async (filePath: string) => {
  try {
    await RNShare.open({
      url: `file://${filePath}`,
      title: 'Share Diagnosis',
      subject: 'Mero-Care Diagnosis'
    });
  } catch (error) {
    console.log('Share cancelled or failed:', error);
  }
};

const renderMessage = ({ item }: { item: Message }) => {
  const isUser = item.sender === 'user';
  const isDiagnosis = item.sender === 'bot' && item.text.includes('Predicted Disease');
  
  return (
    <Animated.View style={[styles.messageRow, { justifyContent: isUser ? 'flex-end' : 'flex-start', opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0,1], outputRange: [10,0] }) }] }]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
        <Text style={isUser ? styles.userText : styles.botText}>{item.text}</Text>
        
        {isDiagnosis && (
          <View style={styles.diagnosisActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleEmail(item.text)}>
              <Text style={{ fontSize: 14 }}>📧</Text>
              <Text style={styles.actionButtonText}>Email</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={() => handleAdd(item.text)}>
              <Text style={{ fontSize: 14 }}>➕</Text>
              <Text style={styles.actionButtonText}>Add History</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={() => handleDownload(item.text)}>
              <Text style={{ fontSize: 14 }}>⬇️</Text>
              <Text style={styles.actionButtonText}>Download</Text>
            </TouchableOpacity>
             <TouchableOpacity style={styles.actionButton} onPress={() => handleQuickShare(item.text)}>
              <Text style={{ fontSize: 14 }}>📤</Text>
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        )}
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
{/* Age and Gender Inputs */}
        {messages.length === 0 && (
          <View style={styles.userInfoRow}>
            <View style={styles.infoInputWrapper}>
              <Text style={styles.infoLabel}>Age</Text>
              <TextInput
                style={styles.infoInput}
                placeholder="25"
                placeholderTextColor="#9CA3AF"
                value={userAge}
                onChangeText={setUserAge}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
            <View style={styles.infoInputWrapper}>
              <Text style={styles.infoLabel}>Gender</Text>
              <TextInput
                style={styles.infoInput}
                placeholder="Male/Female"
                placeholderTextColor="#9CA3AF"
                value={userGender}
                onChangeText={setUserGender}
              />
            </View>
          </View>
        )}

        
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
{/* Visibility Modal */}
{showVisibilityModal && (
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Save to History</Text>
      <Text style={styles.modalSubtitle}>Choose visibility for this diagnosis</Text>
      
      <TouchableOpacity 
        style={[styles.modalButton, styles.privateButton]} 
        onPress={() => saveToHistory('private')}
      >
        <Text style={styles.modalButtonText}>🔒 Private</Text>
        <Text style={styles.modalButtonSubtext}>Only you can see this</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.modalButton, styles.publicButton]} 
        onPress={() => saveToHistory('public')}
      >
        <Text style={styles.modalButtonText}>🌐 Public</Text>
        <Text style={styles.modalButtonSubtext}>Visible to everyone</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.cancelButton} 
        onPress={() => {
          setShowVisibilityModal(false);
          setSelectedDiagnosis('');
        }}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </View>
)}
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
  userInfoRow: { 
    flexDirection: 'row', 
    paddingHorizontal: 16, 
    paddingBottom: 8, 
    gap: 12 
  },
  infoInputWrapper: { 
    flex: 1, 
    backgroundColor: COLORS.inputBg, 
    borderRadius: 12, 
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3
  },
  infoLabel: { 
    fontSize: 12, 
    color: '#666', 
    marginBottom: 4, 
    fontWeight: '500' 
  },
  infoInput: { 
    fontSize: 14, 
    color: COLORS.textDark, 
    padding: 0 
  },
  saveButton: {
  backgroundColor: COLORS.gradientEnd,
  borderRadius: 12,
  paddingVertical: 8,
  paddingHorizontal: 16,
  marginTop: 8,
  alignSelf: 'flex-start',
},
saveButtonText: {
  color: '#FFF',
  fontSize: 13,
  fontWeight: '600',
},
modalOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
},
modalContent: {
  backgroundColor: '#FFF',
  borderRadius: 20,
  padding: 24,
  width: '85%',
  maxWidth: 400,
  shadowColor: '#000',
  shadowOpacity: 0.25,
  shadowOffset: { width: 0, height: 4 },
  shadowRadius: 12,
  elevation: 5,
},
modalTitle: {
  fontSize: 20,
  fontWeight: '700',
  color: COLORS.textDark,
  marginBottom: 8,
  textAlign: 'center',
},
modalSubtitle: {
  fontSize: 14,
  color: '#666',
  marginBottom: 20,
  textAlign: 'center',
},
modalButton: {
  borderRadius: 12,
  paddingVertical: 16,
  paddingHorizontal: 20,
  marginBottom: 12,
},
privateButton: {
  backgroundColor: '#6B7280',
},
publicButton: {
  backgroundColor: COLORS.gradientEnd,
},
modalButtonText: {
  color: '#FFF',
  fontSize: 16,
  fontWeight: '600',
  marginBottom: 4,
  textAlign: 'center',
},
modalButtonSubtext: {
  color: '#FFF',
  fontSize: 12,
  opacity: 0.9,
  textAlign: 'center',
},
cancelButton: {
  marginTop: 8,
  paddingVertical: 12,
},
cancelButtonText: {
  color: '#666',
  fontSize: 14,
  textAlign: 'center',
},
diagnosisActions: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  marginTop: 12,
  paddingTop: 12,
  borderTopWidth: 1,
  borderTopColor: '#E5E7EB',
    flexWrap: 'wrap', 
  gap: 8, 
},
actionButton: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 8,
  backgroundColor: '#F3F4F6',
},
actionButtonText: {
  fontSize: 12,
  color: COLORS.textDark,
  marginLeft: 4,
  fontWeight: '500',
},

});