import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const THEME_COLOR = '#255E67';
const ACCENT_COLOR = '#2FA678';
const TEXT_COLOR = '#133D2E';
const LIGHT_BG = '#FAFFFB';
const BORDER_COLOR = '#E3EFEA';
const PENDING_COLOR = '#FFB020';
const REJECT_COLOR = '#F25D5D';
const ACCEPT_COLOR = '#2FA678';


type RequestStatus = 'pending' | 'accepted' | 'rejected';

type ReminderNotification = {
  id: string;
  title: string;      // e.g. "Morning BP Medicine"
  timeText: string;   // e.g. "Today • 08:00 AM"
  statusLabel: string; // e.g. "Upcoming", "Missed"
};


interface IncomingRequest {
  id: string;
  name: string;
  email: string;
  relation: string;
  requestedBy: string;
  timeAgo: string;
}


interface SentRequest {
  id: string;
  name: string;
  email: string;
  relation: string;
  status: RequestStatus;
  timeAgo: string;
}


interface NotificationProps {
  onBack: () => void;
  // callback to tell parent to update Landing's family list
  onAcceptFamily: (payload: { id: string; name: string; relation: string }) => void;
}


// Notification center for family connection requests
const Notification = ({ onBack, onAcceptFamily }: NotificationProps) => {
  // dummy reminder alerts – backend: replace with GET /reminders/notifications
  const [reminderAlerts] = useState<ReminderNotification[]>([
    {
      id: 'r1',
      title: 'Morning BP Medicine',
      timeText: 'Today • 08:00 AM',
      statusLabel: 'Upcoming',
    },
    {
      id: 'r2',
      title: 'Vitamin D Capsule',
      timeText: 'Tomorrow • 09:00 AM',
      statusLabel: 'Scheduled',
    },
  ]);

  // dummy incoming data – will be replaced with API response later
  const [incomingRequests, setIncomingRequests] = useState<IncomingRequest[]>([
    {
      id: '1',
      name: 'Suman Sharma',
      email: 'suman.sharma@gmail.com',
      relation: 'Father',
      requestedBy: 'You have been added as family',
      timeAgo: '5 min ago',
    },
    {
      id: '2',
      name: 'Rita Karki',
      email: 'rita.karki@example.com',
      relation: 'Mother',
      requestedBy: 'You have been added as family',
      timeAgo: '1 hr ago',
    },
    // you can add more here: Spouse, Brother, Sister, Son, Daughter, Guardian, ...
  ]);


  // dummy sent data – one place to later show what user has invited
  const [sentRequests, setSentRequests] = useState<SentRequest[]>([
    {
      id: '11',
      name: 'Bikash Rana',
      email: 'bikash.rana@example.com',
      relation: 'Brother',
      status: 'pending',
      timeAgo: 'Just now',
    },
    {
      id: '12',
      name: 'Anita Thapa',
      email: 'anita.thapa@example.com',
      relation: 'Spouse',
      status: 'accepted',
      timeAgo: 'Yesterday',
    },
    {
      id: '13',
      name: 'Prabin KC',
      email: 'prabin.kc@example.com',
      relation: 'Guardian',
      status: 'rejected',
      timeAgo: '2 days ago',
    },
  ]);


  // Accept handler – backend will mark request as accepted and link family
  const handleAccept = (id: string) => {
    /**
     * BACKEND INTEGRATION POINT
     * API: POST /family/requests/{id}/accept
     *
     * After success:
     * - remove from incomingRequests
     * - refresh family list on Landing (or global state)
     */


    const req = incomingRequests.find(r => r.id === id);
    if (!req) {
      return;
    }


    // notify parent so it adds this member to Landing's family list
    onAcceptFamily({
      id: req.id,
      name: req.name,
      relation: req.relation,
    });


    setIncomingRequests(prev => prev.filter(item => item.id !== id));
    Alert.alert(
      'Request Accepted',
      'This family member will be added to your account.',
    );
  };


  // Reject handler – backend only updates request status
  const handleReject = (id: string) => {
    /**
     * BACKEND INTEGRATION POINT
     * API: POST /family/requests/{id}/reject
     *
     * After success:
     * - remove from incomingRequests
     */
    setIncomingRequests(prev => prev.filter(item => item.id !== id));
    Alert.alert('Request Rejected', 'This request has been removed.');
  };


  // small helper for visual badge of sent request status
  const renderStatusBadge = (status: RequestStatus) => {
    let bg = PENDING_COLOR;
    let label = 'Pending';


    if (status === 'accepted') {
      bg = ACCEPT_COLOR;
      label = 'Accepted';
    } else if (status === 'rejected') {
      bg = REJECT_COLOR;
      label = 'Rejected';
    }


    return (
      <View style={[styles.statusBadge, { backgroundColor: bg }]}>
        <Text style={styles.statusText}>{label}</Text>
      </View>
    );
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER – simple back + title, no extra actions */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 32 }} />
      </View>


      <ScrollView contentContainerStyle={styles.container}>
        {/* SECTION: Reminder alerts – backend: GET /reminders/notifications */}
        <Text style={styles.sectionTitle}>Reminder alerts</Text>
        {reminderAlerts.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No reminder alerts</Text>
            <Text style={styles.emptySubtitle}>
              When a reminder time is near or missed, it will appear here.
            </Text>
          </View>
        ) : (
          reminderAlerts.map(item => (
            <View key={item.id} style={styles.reminderCard}>
              <View style={styles.reminderLeft}>
                <Text style={styles.reminderTitle}>{item.title}</Text>
                <Text style={styles.reminderTime}>{item.timeText}</Text>
              </View>
              <View style={styles.reminderRight}>
                <Text style={styles.reminderStatus}>{item.statusLabel}</Text>
              </View>
            </View>
          ))
        )}


        {/* SECTION: Incoming Requests – invitations where current user is receiver */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
          Incoming Requests
        </Text>
        {incomingRequests.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No new requests</Text>
            <Text style={styles.emptySubtitle}>
              When someone adds you as their family, it will appear here.
            </Text>
          </View>
        ) : (
          incomingRequests.map(req => (
            <View key={req.id} style={styles.card}>
              <View style={styles.cardLeft}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {req.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              </View>


              <View style={styles.cardRight}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardName}>{req.name}</Text>
                  <Text style={styles.cardTime}>{req.timeAgo}</Text>
                </View>
                <Text style={styles.cardEmail}>{req.email}</Text>
                <Text style={styles.cardRelation}>
                  Relation:{' '}
                  <Text style={{ fontWeight: '900' }}>{req.relation}</Text>
                </Text>
                <Text style={styles.cardInfo}>{req.requestedBy}</Text>


                {/* actions for this incoming request */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleReject(req.id)}
                  >
                    <Text style={styles.rejectText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => handleAccept(req.id)}
                  >
                    <Text style={styles.acceptText}>Accept</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}


        {/* SECTION: Sent Invitations – requests initiated from Add Family screen */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
          Sent Invitations
        </Text>


        {sentRequests.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No invitations sent</Text>
            <Text style={styles.emptySubtitle}>
              Invite your family from the Add Family screen to see them here.
            </Text>
          </View>
        ) : (
          sentRequests.map(invite => (
            <View key={invite.id} style={styles.sentCard}>
              <View style={styles.sentRowTop}>
                <View style={styles.sentLeft}>
                  <Text style={styles.sentName}>{invite.name}</Text>
                  <Text style={styles.sentEmail}>{invite.email}</Text>
                  <Text style={styles.sentRelation}>
                    Relation: {invite.relation}
                  </Text>
                </View>
                {renderStatusBadge(invite.status)}
              </View>
              <View style={styles.sentRowBottom}>
                <Text style={styles.sentTime}>{invite.timeAgo}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};


export default Notification;


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
    padding: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: TEXT_COLOR,
    marginBottom: 10,
  },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: TEXT_COLOR,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#7C9086',
    lineHeight: 18,
  },

  // Reminder alert cards
  reminderCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  reminderLeft: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: TEXT_COLOR,
  },
  reminderTime: {
    fontSize: 12,
    color: '#7C9086',
    marginTop: 2,
  },
  reminderRight: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  reminderStatus: {
    fontSize: 11,
    fontWeight: '800',
    color: ACCENT_COLOR,
  },

  // Incoming cards
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLeft: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: THEME_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cardRight: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardName: {
    fontSize: 15,
    fontWeight: '900',
    color: TEXT_COLOR,
  },
  cardTime: {
    fontSize: 11,
    color: '#7C9086',
  },
  cardEmail: {
    marginTop: 2,
    fontSize: 12,
    color: '#51655E',
  },
  cardRelation: {
    marginTop: 4,
    fontSize: 12,
    color: ACCENT_COLOR,
    fontWeight: '700',
  },
  cardInfo: {
    marginTop: 4,
    fontSize: 11,
    color: '#7C9086',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
  rejectButton: {
    borderColor: REJECT_COLOR,
    marginRight: 8,
    backgroundColor: '#FFF5F5',
  },
  acceptButton: {
    borderColor: ACCEPT_COLOR,
    backgroundColor: '#E9F8F1',
  },
  rejectText: {
    fontSize: 12,
    fontWeight: '800',
    color: REJECT_COLOR,
  },
  acceptText: {
    fontSize: 12,
    fontWeight: '800',
    color: ACCEPT_COLOR,
  },

  // Sent cards
  sentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  sentRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sentLeft: {
    flex: 1,
    marginRight: 8,
  },
  sentName: {
    fontSize: 14,
    fontWeight: '900',
    color: TEXT_COLOR,
  },
  sentEmail: {
    fontSize: 12,
    color: '#51655E',
    marginTop: 2,
  },
  sentRelation: {
    fontSize: 12,
    color: ACCENT_COLOR,
    marginTop: 4,
    fontWeight: '700',
  },
  sentRowBottom: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  sentTime: {
    fontSize: 11,
    color: '#7C9086',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
