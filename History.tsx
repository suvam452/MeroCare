// History.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const THEME_COLOR = '#255E67';
const TEXT_COLOR = '#133D2E';
const ACCENT_COLOR = '#2FA678';
const LIGHT_GRAY = '#F2F7F5';
const SOFT_BG = '#FAFFFB';

type HistoryRecord = {
  id: string;
  hospital: string;
  disease: string;
  date: string; // YYYY-MM-DD
  documentTitle: string;
  fileName?: string;
  fileUri?: string;
  mimeType?: string;
};

interface HistoryProps {
  onBack: () => void;
}

// helper: validate YYYY-MM-DD and real date
const isValidDateString = (value: string): boolean => {
  const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/; // YYYY-MM-DD
  if (!regex.test(value)) {
    return false;
  }

  const [yearStr, monthStr, dayStr] = value.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

const History = ({ onBack }: HistoryProps) => {
  const [hospital, setHospital] = useState('');
  const [disease, setDisease] = useState('');
  const [date, setDate] = useState(''); // manual string input YYYY-MM-DD
  const [documentTitle, setDocumentTitle] = useState('');
  const [fileName, setFileName] = useState<string | undefined>(undefined);
  const [fileUri, setFileUri] = useState<string | undefined>(undefined);
  const [fileMime, setFileMime] = useState<string | undefined>(undefined);

  const [records, setRecords] = useState<HistoryRecord[]>([
    {
      id: '1',
      hospital: 'Bir Hospital, Kathmandu',
      disease: 'Typhoid Fever',
      date: '2025-02-15',
      documentTitle: 'Discharge Summary',
      fileName: 'typhoid_report.pdf',
      fileUri: 'https://example.com/typhoid_report.pdf',
      mimeType: 'application/pdf',
    },
    {
      id: '2',
      hospital: 'Grande International Hospital',
      disease: 'Migraine',
      date: '2025-01-03',
      documentTitle: 'Neurology Visit',
      fileName: 'neuro_notes.docx',
      fileUri: 'https://example.com/neuro_notes.docx',
      mimeType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    },
  ]);

  const handleAddHistory = () => {
    if (!hospital || !disease || !date || !documentTitle) {
      Alert.alert('Missing fields', 'Please fill all required fields.');
      return;
    }

    if (!isValidDateString(date)) {
      Alert.alert(
        'Invalid date',
        'Please enter a valid date in YYYY-MM-DD format (e.g. 2025-02-15).',
      );
      return;
    }

    const newRecord: HistoryRecord = {
      id: Date.now().toString(),
      hospital,
      disease,
      date, // already YYYY-MM-DD
      documentTitle,
      fileName,
      fileUri,
      mimeType: fileMime,
    };

    setRecords(prev => [newRecord, ...prev]);

    setHospital('');
    setDisease('');
    setDate('');
    setDocumentTitle('');
    setFileName(undefined);
    setFileUri(undefined);
    setFileMime(undefined);
  };

  // temporary placeholder: no expo-document-picker
  const handlePickFile = async () => {
    Alert.alert(
      'Coming soon',
      'File upload will be available in the next version.',
    );
  };

  const renderRecord = ({ item }: { item: HistoryRecord }) => (
    <View style={styles.recordCard}>
      <View style={styles.recordHeaderRow}>
        <View style={styles.recordChip}>
          <Text style={styles.recordChipText}>{item.date}</Text>
        </View>
        <View style={styles.recordBadge}>
          <Text style={styles.recordBadgeText}>History</Text>
        </View>
      </View>

      <Text style={styles.recordHospital}>{item.hospital}</Text>
      <Text style={styles.recordDisease}>{item.disease}</Text>

      <View style={styles.recordMetaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Document</Text>
          <Text style={styles.metaValue}>{item.documentTitle}</Text>
        </View>
      </View>

      {item.fileName && (
        <View style={styles.fileChipRow}>
          <View style={styles.fileChip}>
            <Text style={styles.fileChipIcon}>
              {item.mimeType?.includes('pdf') ? '📄' : '📎'}
            </Text>
            <Text style={styles.fileChipText} numberOfLines={1}>
              {item.fileName}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.viewFileButton}
            onPress={() => {
              if (!item.fileUri) {
                Alert.alert('No file', 'No file attached for this record.');
                return;
              }
              Alert.alert(
                'Open file',
                `Here you can open:\n${item.fileName}\n\nURI: ${item.fileUri.substring(
                  0,
                  60,
                )}...`,
              );
            }}
          >
            <Text style={styles.viewFileText}>View</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={SOFT_BG} />
      <SafeAreaView style={styles.safeArea}>
        {/* HEADER */}
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Medical History</Text>
              <Text style={styles.headerSubtitle}>
                Track your visits & documents
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* PART 1: ADD HISTORY */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardIconCircle}>
                <Text style={styles.cardIcon}>📚</Text>
              </View>
              <View style={styles.cardTitleBox}>
                <Text style={styles.cardTitle}>Add New History</Text>
                <Text style={styles.cardSubtitle}>
                  Save important hospital visits here
                </Text>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Hospital / Clinic</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Bir Hospital, Kathmandu"
                placeholderTextColor="#9DB3A6"
                value={hospital}
                onChangeText={setHospital}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Disease / Reason</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Typhoid Fever"
                placeholderTextColor="#9DB3A6"
                value={disease}
                onChangeText={setDisease}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Visit Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2025-02-15"
                  placeholderTextColor="#9DB3A6"
                  value={date}
                  onChangeText={setDate}
                  keyboardType="numbers-and-punctuation"
                  maxLength={10}
                />
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Document Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Discharge Summary"
                  placeholderTextColor="#9DB3A6"
                  value={documentTitle}
                  onChangeText={setDocumentTitle}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Attach File (PDF / Docs)</Text>
              <TouchableOpacity style={styles.filePicker} onPress={handlePickFile}>
                <Text style={styles.filePickerIcon}>📎</Text>
                <Text
                  style={
                    fileName ? styles.filePickerText : styles.filePickerPlaceholder
                  }
                  numberOfLines={1}
                >
                  {fileName || 'Upload report, prescription, scan...'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.saveButton,
                !(hospital && disease && date && documentTitle) && {
                  opacity: 0.5,
                },
              ]}
              onPress={handleAddHistory}
              disabled={!(hospital && disease && date && documentTitle)}
            >
              <Text style={styles.saveButtonText}>Save History</Text>
            </TouchableOpacity>
          </View>

          {/* PART 2: HISTORY LIST */}
          <View style={styles.listHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Previous Records</Text>
              <Text style={styles.sectionSubtitle}>
                All your saved history in one place
              </Text>
            </View>
            <View style={styles.recordsCountPill}>

              <Text style={styles.recordsCountText}>{records.length}</Text>
            </View>
          </View>

          <FlatList
            data={records}
            keyExtractor={item => item.id}
            renderItem={renderRecord}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default History;

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: SOFT_BG },
  safeArea: { flex: 1 },
  headerContainer: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_GRAY,
    backgroundColor: SOFT_BG,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  backIcon: { fontSize: 20, color: TEXT_COLOR },
  headerTitle: { fontSize: 18, fontWeight: '900', color: TEXT_COLOR },
  headerSubtitle: { fontSize: 12, color: ACCENT_COLOR, marginTop: 2 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#E6F2EC',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 6,
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  cardIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#EAF8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardIcon: { fontSize: 26 },
  cardTitleBox: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '900', color: TEXT_COLOR },
  cardSubtitle: { fontSize: 12, color: '#7AA896', marginTop: 2 },
  formGroup: { marginBottom: 12 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#719586',
    marginBottom: 4,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4E4DC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: TEXT_COLOR,
    backgroundColor: '#FAFFFD',
  },
  formRow: { flexDirection: 'row', marginBottom: 4 },
  filePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4E4DC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FAFFFD',
  },
  filePickerIcon: { fontSize: 18, marginRight: 8 },
  filePickerText: { fontSize: 13, color: TEXT_COLOR, flex: 1 },
  filePickerPlaceholder: { fontSize: 13, color: '#9DB3A6', flex: 1 },
  saveButton: {
    marginTop: 8,
    borderRadius: 24,
    backgroundColor: ACCENT_COLOR,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: TEXT_COLOR,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#7AA896',
    marginTop: 2,
  },
  recordsCountPill: {
    minWidth: 30,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#EAF8F0',
    alignItems: 'center',
  },
  recordsCountText: { color: ACCENT_COLOR, fontWeight: '800', fontSize: 13 },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEF4F1',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 3,
  },
  recordHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  recordChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#EAF8F0',
  },
  recordChipText: {
    fontSize: 11,
    color: ACCENT_COLOR,
    fontWeight: '700',
  },
  recordBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FFF3E3',
  },
  recordBadgeText: {
    fontSize: 11,
    color: '#FF9900',
    fontWeight: '700',
  },
  recordHospital: {
    fontSize: 15,
    fontWeight: '900',
    color: TEXT_COLOR,
    marginBottom: 4,
  },
  recordDisease: {
    fontSize: 13,
    color: '#7AA896',
    marginBottom: 8,
    fontWeight: '700',
  },
  recordMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaItem: { flex: 1 },
  metaLabel: {
    fontSize: 11,
    color: '#9DB3A6',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  metaValue: { fontSize: 13, color: TEXT_COLOR, fontWeight: '700' },
  fileChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  fileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5FBF7',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flex: 1,
    marginRight: 8,
  },
  fileChipIcon: { fontSize: 16, marginRight: 6 },
  fileChipText: {
    fontSize: 12,
    color: TEXT_COLOR,
    fontWeight: '600',
    flex: 1,
  },
  viewFileButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: ACCENT_COLOR,
  },
  viewFileText: {
    fontSize: 12,
    color: ACCENT_COLOR,
    fontWeight: '800',
  },
});