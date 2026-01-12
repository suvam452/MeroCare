// Reminder.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const THEME_COLOR = '#255E67';
const TEXT_COLOR = '#133D2E';
const ACCENT_COLOR = '#2FA678';
const SOFT_BG = '#FAFFFB';
const CARD_BG = '#FFFFFF';
const LIGHT_BORDER = '#E3EFE8';
const MUTED_TEXT = '#7C9086';

type Reminder = {
  id: string;
  title: string;    // medicine / task name
  note: string;     // small description
  timeText: string; // e.g. "08:30 AM"
  active: boolean;  // backend: active=true means notification should fire
};

interface ReminderProps {
  onBack: () => void;
}

// for simple scroll wheels
const HOUR_HEIGHT = 34;
const MIN_HEIGHT = 34;
const MERID_HEIGHT = 34;

const Reminder = ({ onBack }: ReminderProps) => {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');

  // time wheels state – front-end only, can be converted to HH:mm + meridiem for backend
  const [selectedHourIndex, setSelectedHourIndex] = useState(7); // 8
  const [selectedMinuteIndex, setSelectedMinuteIndex] = useState(0); // 00
  const [selectedMeridiemIndex, setSelectedMeridiemIndex] = useState(0); // AM

  const hours = useMemo(
    () => Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')),
    [],
  );
  const minutes = useMemo(
    () => Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0')),
    [],
  );
  const meridiems = ['AM', 'PM'];

  // backend: replace this local state with data loaded from /reminders GET
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: '1',
      title: 'Morning BP Medicine',
      note: 'Take after breakfast with water',
      timeText: '08:00 AM',
      active: true,
    },
  ]);

  const buildTimeText = () => {
    const hour = hours[selectedHourIndex] ?? '08';
    const minute = minutes[selectedMinuteIndex] ?? '00';
    const mer = meridiems[selectedMeridiemIndex] ?? 'AM';
    return `${hour}:${minute} ${mer}`;
  };

  const handleAddReminder = async () => {
    if (!title.trim()) {
      Alert.alert('Missing name', 'Please enter a reminder name.');
      return;
    }

    const newReminder: Reminder = {
      id: Date.now().toString(), // backend: this should come from API response
      title: title.trim(),
      note: note.trim(),
      timeText: buildTimeText(),
      active: true,
    };

    // backend: POST /reminders with { title, note, timeText, active }
    // const saved = await api.post('/reminders', newReminderPayload);

    setReminders(prev => [newReminder, ...prev]);
    setTitle('');
    setNote('');
  };

  const toggleActive = async (id: string) => {
    // backend: PATCH /reminders/{id} { active: !current }
    setReminders(prev =>
      prev.map(r => (r.id === id ? { ...r, active: !r.active } : r)),
    );
  };

  const deleteReminder = async (id: string) => {
    // backend: DELETE /reminders/{id}
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const renderWheel = (
    data: string[],
    selectedIndex: number,
    setIndex: (idx: number) => void,
    itemHeight: number,
  ) => (
    <ScrollView
      style={styles.wheel}
      showsVerticalScrollIndicator={false}
      snapToInterval={itemHeight}
      decelerationRate="fast"
      onScroll={event => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const idx = Math.round(offsetY / itemHeight);
        if (idx >= 0 && idx < data.length && idx !== selectedIndex) {
          setIndex(idx);
        }
      }}
      scrollEventThrottle={16}
    >
      <View style={{ height: itemHeight }} />
      {data.map((val, index) => (
        <View
          key={`${val}-${index}`}
          style={[
            styles.wheelItem,
            { height: itemHeight },
            index === selectedIndex && styles.wheelItemSelected,
          ]}
        >
          <Text
            style={[
              styles.wheelText,
              index === selectedIndex && styles.wheelTextSelected,
            ]}
          >
            {val}
          </Text>
        </View>
      ))}
      <View style={{ height: itemHeight }} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={SOFT_BG} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextBox}>
          <Text style={styles.headerTitle}>Reminders</Text>
          <Text style={styles.headerSubtitle}>
            Create personal reminders for your health
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ADD REMINDER – backend: POST /reminders */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add new reminder</Text>
          <Text style={styles.cardSubtitle}>
            Set a name and time. Mero Care can later use this to send notifications.
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Reminder name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Night insulin"
              placeholderTextColor="#9DB3A6"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Note (optional)</Text>
            <TextInput
              style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
              placeholder="e.g. Take after dinner, drink one glass of water"
              placeholderTextColor="#9DB3A6"
              multiline
              value={note}
              onChangeText={setNote}
            />
          </View>

          <Text style={[styles.label, { marginBottom: 6 }]}>Time</Text>
          {/* backend: store this as structured hour, minute, meridiem if needed */}
          <View style={styles.timePickerRow}>
            {renderWheel(hours, selectedHourIndex, setSelectedHourIndex, HOUR_HEIGHT)}
            <Text style={styles.timeColon}>:</Text>
            {renderWheel(minutes, selectedMinuteIndex, setSelectedMinuteIndex, MIN_HEIGHT)}
            {renderWheel(
              meridiems,
              selectedMeridiemIndex,
              setSelectedMeridiemIndex,
              MERID_HEIGHT,
            )}
          </View>
          <Text style={styles.previewTimeText}>
            Selected time: {buildTimeText()}
          </Text>

          <TouchableOpacity
            style={[
              styles.saveButton,
              !title.trim() && { opacity: 0.5 },
            ]}
            onPress={handleAddReminder}
            disabled={!title.trim()}
          >
            <Text style={styles.saveButtonText}>Save reminder</Text>
          </TouchableOpacity>
        </View>

        {/* LIST – backend: data from /reminders, toggle+delete call PATCH/DELETE */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.sectionTitle}>Your reminders</Text>
          <View style={styles.countPill}>
            <Text style={styles.countText}>{reminders.length}</Text>
          </View>
        </View>

        {reminders.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No reminders yet</Text>
            <Text style={styles.emptySubtitle}>
              Add your first reminder above. Later these can appear as alerts on your phone.
            </Text>
          </View>
        ) : (
          reminders.map(item => (
            <View key={item.id} style={styles.reminderCard}>
              <View style={styles.reminderLeft}>
                <Text style={styles.reminderTitle}>{item.title}</Text>
                {item.note ? (
                  <Text style={styles.reminderNote}>{item.note}</Text>
                ) : null}
                <View style={styles.timeChip}>
                  <Text style={styles.timeChipText}>{item.timeText}</Text>
                </View>
              </View>

              <View style={styles.reminderRight}>
                <View style={styles.switchRow}>
                  <Text style={styles.toggleLabel}>
                    {item.active ? 'On' : 'Off'}
                  </Text>
                  <Switch
                    value={item.active}
                    onValueChange={() => toggleActive(item.id)}
                    thumbColor="#FFFFFF"
                    trackColor={{ false: '#E0E7E3', true: ACCENT_COLOR }}
                  />
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteReminder(item.id)}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Reminder;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SOFT_BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: CARD_BG,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_BORDER,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: SOFT_BG,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  backIcon: {
    fontSize: 18,
    color: TEXT_COLOR,
    fontWeight: '800',
  },
  headerTextBox: { flex: 1 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: TEXT_COLOR,
  },
  headerSubtitle: {
    fontSize: 12,
    color: ACCENT_COLOR,
    marginTop: 2,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 24,
  },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: LIGHT_BORDER,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: TEXT_COLOR,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: MUTED_TEXT,
    marginBottom: 14,
  },

  formGroup: {
    marginBottom: 12,
  },
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

  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  wheel: {
    width: 60,
    height: HOUR_HEIGHT * 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4E4DC',
    backgroundColor: '#FAFFFD',
    marginRight: 6,
    overflow: 'hidden',
  },
  wheelItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelItemSelected: {
    backgroundColor: '#EAF8F0',
  },
  wheelText: {
    fontSize: 14,
    color: MUTED_TEXT,
  },
  wheelTextSelected: {
    color: ACCENT_COLOR,
    fontWeight: '800',
  },
  timeColon: {
    fontSize: 18,
    fontWeight: '900',
    color: TEXT_COLOR,
    marginHorizontal: 4,
  },
  previewTimeText: {
    fontSize: 12,
    color: MUTED_TEXT,
    marginBottom: 8,
  },

  saveButton: {
    marginTop: 4,
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
  countPill: {
    minWidth: 30,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: LIGHT_BORDER,
    alignItems: 'center',
  },
  countText: {
    fontSize: 13,
    fontWeight: '800',
    color: ACCENT_COLOR,
  },

  reminderCard: {
    flexDirection: 'row',
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: LIGHT_BORDER,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 3,
  },
  reminderLeft: {
    flex: 1,
    marginRight: 10,
  },
  reminderTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: TEXT_COLOR,
  },
  reminderNote: {
    fontSize: 12,
    color: MUTED_TEXT,
    marginTop: 2,
  },
  timeChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#EAF8F0',
    marginTop: 8,
  },
  timeChipText: {
    fontSize: 11,
    color: ACCENT_COLOR,
    fontWeight: '700',
  },

  reminderRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  toggleLabel: {
    fontSize: 11,
    color: MUTED_TEXT,
    marginRight: 6,
    fontWeight: '700',
  },
  deleteButton: {
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#F25D5D',
    backgroundColor: '#FFF5F5',
  },
  deleteText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F25D5D',
  },

  emptyBox: {
    marginTop: 10,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: LIGHT_BORDER,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: TEXT_COLOR,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: MUTED_TEXT,
  },
});