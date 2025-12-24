import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

const THEME_COLOR = '#255E67';
const ACCENT_COLOR = '#2FA678';
const TEXT_COLOR = '#133D2E';
const LIGHT_BG = '#FAFFFB';
const BORDER_COLOR = '#E3EFEA';

// fixed list of relations – keeping it simple and clear for the first version
const RELATIONS = [
  'Father',
  'Mother',
  'Spouse',
  'Brother',
  'Sister',
  'Son',
  'Daughter',
  'Guardian',
];

interface AddFamilyProps {
  onBack: () => void;
}

const AddFamily = ({ onBack }: AddFamilyProps) => {
  // small, focused local state – one screen, one responsibility
  const [contact, setContact] = useState('');
  const [relation, setRelation] = useState('');
  const [loading, setLoading] = useState(false);

  // EMAIL ONLY – keeping first release strict and safe
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmail = emailRegex.test(contact.trim());

  // button only active when form is actually valid
  const canSubmit = isEmail && relation.length > 0;

  const handleSendInvite = async () => {
    if (!canSubmit) {
      Alert.alert('Invalid Input', 'Please enter a valid email and select relation');
      return;
    }

    setLoading(true);

    /**
     * ============================================
     * BACKEND INTEGRATION POINT (IMPORTANT)
     * ============================================
     * API: POST /family/invite
     *
     * Payload format (DO NOT CHANGE):
     * {
     *   contact: string,        // email only
     *   relation: string,       // selected relation
     *   invitedBy: userId,      // logged-in user id
     * }
     *
     * Expected Response:
     * {
     *   success: boolean,
     *   status: "pending"
     * }
     *
     * After success:
     * - Show "Invitation Sent"
     * - Backend will handle accept/reject
     * - Once accepted → show on Landing Page
     *
     * This screen is ready for plug-and-play with backend when my friend connects it.
     */

    // fake delay for now – will be replaced by real API call later
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Invitation Sent',
        'Your family member will appear after they accept the request.',
      );
      onBack();
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* CUSTOM HEADER WITH BACK – keeping navigation consistent with rest of app */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Family Member</Text>
        <View style={{ width: 32 }} />{/* spacer to balance header */}
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* SUBTITLE – short guidance so user knows exactly what to do */}
        <Text style={styles.subtitle}>
          Invite your family using their Gmail account
        </Text>

        {/* CONTACT INPUT – single email field, no extra noise */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Family member email</Text>
          <TextInput
            placeholder="example@gmail.com"
            value={contact}
            onChangeText={setContact}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
          <Text style={styles.helper}>
            Invitation will be sent securely to this email.
          </Text>
        </View>

        {/* RELATION SELECT – chip-based picker for quick, thumb-friendly input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Relation</Text>
          <View style={styles.relationGrid}>
            {RELATIONS.map(item => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.relationChip,
                  relation === item && styles.relationChipActive,
                ]}
                onPress={() => setRelation(item)}
              >
                <Text
                  style={[
                    styles.relationText,
                    relation === item && styles.relationTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* SUBMIT – main action for this screen */}
        <TouchableOpacity
          style={[styles.submitButton, !canSubmit && { opacity: 0.5 }]}
          disabled={!canSubmit || loading}
          onPress={handleSendInvite}
        >
          <Text style={styles.submitText}>
            {loading ? 'Sending...' : 'Send Invitation'}
          </Text>
        </TouchableOpacity>

        {/* INFO – small reassurance about privacy and flow */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            🔒 Family members must accept the email invitation before appearing
            on your dashboard.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddFamily;

/* ================= STYLES – soft, calm palette to match healthcare vibe ================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: LIGHT_BG,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  backIcon: {
    fontSize: 18,
    color: TEXT_COLOR,
    fontWeight: '800',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
    color: TEXT_COLOR,
    textAlign: 'center',
  },
  container: {
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    color: ACCENT_COLOR,
    marginBottom: 20,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    color: TEXT_COLOR,
    marginBottom: 6,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    fontSize: 15,
  },
  helper: {
    fontSize: 11,
    color: '#7FAFA1',
    marginTop: 6,
    fontWeight: '600',
  },
  relationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  relationChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    backgroundColor: '#fff',
  },
  relationChipActive: {
    backgroundColor: THEME_COLOR,
    borderColor: THEME_COLOR,
  },
  relationText: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_COLOR,
  },
  relationTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: THEME_COLOR,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  infoBox: {
    marginTop: 20,
    backgroundColor: '#EAF8F0',
    padding: 14,
    borderRadius: 12,
  },
  infoText: {
    fontSize: 12,
    color: TEXT_COLOR,
    fontWeight: '700',
    lineHeight: 18,
  },
});
