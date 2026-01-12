import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Alert,
  Dimensions,
  Animated,
  Easing,
  Pressable,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// I keep screen width here so layout and drawer width can adapt on any device
const { width } = Dimensions.get('window');


// My main app colors – try to keep all screens using this same palette
const THEME_COLOR = '#255E67';
const TEXT_COLOR = '#133D2E';
const ACCENT_COLOR = '#2FA678';
const LIGHT_GRAY = '#F2F7F5';
const SOFT_BG = '#FAFFFB';


// profile modes shared with NewBar
// backend: these map to 3 tabs in profile API – about info, editable fields, and password change
type NewBarMode = 'about' | 'edit' | 'password';


// type for family member item shown in Landing
// backend: this is exactly what I expect from family list endpoint
type FamilyMember = {
  id: string;       // unique id from backend for each relation
  name: string;     // full name of the family member
  relation: string; // e.g. Father, Mother, Brother, etc.
  emoji: string;    // small icon decided on frontend from relation
};


interface LandingProps {
  userName: string;                       // backend: logged-in user’s display name
  onLogout: () => void;                   // backend: clear token / session then go to login
  onOpenCheck: () => void;                // opens symptoms check flow
  onOpenProfile: (mode: NewBarMode) => void; // opens NewBar with correct tab (about/edit/password)
  onOpenAddFamily: () => void;            // navigate to AddFamily invitation screen
  onOpenNotification: () => void;         // bell → notification screen (incoming family requests)
  onOpenHistory: () => void;              // navigate to History.tsx (medical history)
  familyMembers: FamilyMember[];          // backend: current accepted family list for this user
  onOpenReminders: () => void;            // navigate to Reminder.tsx (medication & task reminders)
}


const Landing = ({
  userName,
  onLogout,
  onOpenCheck,
  onOpenProfile,
  onOpenAddFamily,
  onOpenNotification,
  onOpenHistory,
  familyMembers,
  onOpenReminders,
}: LandingProps) => {
  // local UI state for this home screen only – does not go to backend
  const [menuOpen, setMenuOpen] = useState(false);           // controls side drawer open/close
  const [typewriterText, setTypewriterText] = useState('');  // animated helper text from nurse bot
  const [typing, setTyping] = useState(false);               // prevent overlapping typewriter runs
  const [photoModalVisible, setPhotoModalVisible] = useState(false); // small modal to pick profile photo


  // friendly intro line from “Mero Care” nurse bot
  const fullMessage = 'Hi, I am Mero Care, caring for you everyday 😊';


  // nurse avatar click → typewriter effect
  const handleNurseClick = () => {
    // if already typing, ignore extra taps
    if (typing) return;
    setTypewriterText('');
    setTyping(true);


    let index = 0;
    const interval = setInterval(() => {
      if (index > fullMessage.length) {
        clearInterval(interval);
        setTyping(false);
        return;
      }
      setTypewriterText(fullMessage.substring(0, index));
      index++;
    }, 40); // speed of typewriter animation (ms per character)
  };


  // simple custom drawer animation (no React Navigation drawer)
  // backend: this is purely visual – no API call
  const menuAnim = useRef(new Animated.Value(0)).current;
  const menuWidth = Math.min(360, Math.round(width * 0.82)); // max drawer width


  useEffect(() => {
    // when menuOpen changes, animate drawer in or out
    Animated.timing(menuAnim, {
      toValue: menuOpen ? 1 : 0,
      duration: 280,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [menuOpen]);


  // confirm before logging the user out
  // backend: onLogout should handle token removal and navigation back to login screen
  const confirmLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel' },
      { text: 'Logout', style: 'destructive', onPress: onLogout },
    ]);
  };


  // animate side drawer sliding in from left
  const translateX = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-menuWidth - 10, 0],
  });


  // dim background when menu is open
  const overlayOpacity = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });


  // small helper for drawer menu items
  // backend: each item maps to a profile mode in NewBar (no API call here)
  const MenuItem = ({
    icon,
    label,
    onPress,
  }: {
    icon: string;
    label: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => {
        setMenuOpen(false); // close drawer before navigating
        onPress && onPress();
      }}
    >
      <View style={styles.menuItemIconWrap}>
        <Text style={styles.menuItemIcon}>{icon}</Text>
      </View>
      <Text style={styles.menuItemLabel}>{label}</Text>
    </TouchableOpacity>
  );


  return (
    <View style={styles.mainContainer}>
      {/* status bar theme to match soft background */}
      <StatusBar barStyle="dark-content" backgroundColor={SOFT_BG} />


      <SafeAreaView style={styles.safeArea}>
        {/* HEADER – greeting + quick actions (bell + logout) */}
        {/* backend: bell opens Notification screen where pending family invitations are fetched */}
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            {/* this is my custom hamburger – opens simple animated drawer */}
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setMenuOpen(!menuOpen)}
            >
              <View style={styles.hamburgerWrap}>
                <Text style={styles.menuIcon}>☰</Text>
                <Text
                  style={{
                    color: THEME_COLOR,
                    fontWeight: '800',
                    fontSize: 13,
                  }}
                >
                  Menu
                </Text>
              </View>
            </TouchableOpacity>


            {/* greeting the logged in user */}
            <View style={styles.headerText}>
              <Text style={styles.greetingText}>Hi {userName}!</Text>
              <Text style={styles.subText}>How are you feeling today?</Text>
            </View>
          </View>


          <View style={styles.headerRight}>
            {/* notification bell opens dedicated notification screen */}
            {/* backend: onOpenNotification should load incoming family requests for this user */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onOpenNotification}
            >
              <Text style={styles.iconText}>🔔</Text>
            </TouchableOpacity>
            {/* quick logout from top-right */}
            <TouchableOpacity style={styles.iconButton} onPress={confirmLogout}>
              <Text style={styles.iconText}>🚪</Text>
            </TouchableOpacity>
          </View>
        </View>


        {/* MAIN CONTENT – scrollable dashboard */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* SYMPTOM CHECK CARD – primary CTA of the app */}
          {/* backend: Start Check should open symptom checker flow and call triage APIs */}
          <View style={styles.symptomCard}>
            <View style={styles.symptomTopRow}>
              <View style={styles.emojiCircle}>
                <Text style={styles.emojiBig}>🩺</Text>
              </View>
              <View style={styles.symptomRightText}>
                <Text style={styles.symptomTitle}>Let's check the symptoms</Text>
                <Text style={styles.symptomSubtitle}>
                  Just Click To Enjoy Service
                </Text>
              </View>
            </View>


            <View style={styles.symptomBottomRow}>
              <TouchableOpacity
                style={styles.clickButtonPrimary}
                onPress={onOpenCheck}
              >
                <Text style={styles.clickButtonPrimaryText}>Start Check</Text>
              </TouchableOpacity>


              {/* nurse icon triggers typewriter helper message */}
              {/* backend: no API, just a friendly local animation */}
              <TouchableOpacity
                style={styles.smallEmojiWrap}
                onPress={handleNurseClick}
              >
                <Text style={styles.smallEmoji}>👩‍⚕️</Text>
              </TouchableOpacity>
            </View>


            {typewriterText.length > 0 && (
              <Text style={{ color: '#fff', marginTop: 12, fontWeight: '700' }}>
                {typewriterText}
              </Text>
            )}
          </View>


          {/* SERVICES – small grid of key features */}
          {/* backend: each tile opens a separate feature/screen */}
          <View style={styles.servicesSection}>
            <Text style={styles.sectionTitle}>Services</Text>


            <View style={styles.servicesGrid}>
              {[
                {
                  icon: '🧾',
                  title: 'Health History',
                  onPress: onOpenHistory, // navigate to History screen
                },
                {
                  icon: '👨‍👩‍👧',
                  title: 'Add Family',
                  onPress: onOpenAddFamily, // send family invitation (email-based)
                },
                {
                  icon: '⏰',
                  title: 'Reminders',
                  onPress: onOpenReminders, // navigate to Reminder screen
                },
              ].map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.serviceCard}
                  onPress={item.onPress}
                >
                  <View style={styles.serviceIconContainer}>
                    <Text style={styles.serviceIcon}>{item.icon}</Text>
                  </View>
                  <Text style={styles.serviceTitle}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>


          {/* FAMILY – shows message when empty, list after accept */}
          {/* backend: this section reflects familyMembers prop coming from API */}
          <View style={styles.familySection}>
            <View style={styles.familyHeader}>
              <Text style={styles.sectionTitle}>Family Members</Text>
              {/* optional “See all” – can later navigate to full family list */}
              <Text style={styles.seeAllText}>See all</Text>
            </View>


            {familyMembers.length === 0 ? (
              // empty state when user has not accepted any family request yet
              <View style={styles.familyMemberCard}>
                <View style={styles.familyAvatar}>
                  <Text style={styles.avatarEmoji}>👨‍👩‍👧</Text>
                </View>
                <View style={styles.familyInfo}>
                  <Text style={styles.familyName}>No family members yet</Text>
                  <Text style={styles.familyRelation}>
                    Accept a request from Notifications to add family here.
                  </Text>
                </View>
              </View>
            ) : (
              // once Notification Accept is pressed and backend adds relation,
              // parent passes updated familyMembers and each item appears here
              familyMembers.map(member => (
                <View key={member.id} style={styles.familyMemberCard}>
                  <View style={styles.familyAvatar}>
                    <Text style={styles.avatarEmoji}>{member.emoji}</Text>
                  </View>
                  <View style={styles.familyInfo}>
                    <Text style={styles.familyName}>{member.name}</Text>
                    <Text style={styles.familyRelation}>{member.relation}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>


        {/* OVERLAY – catches taps outside the drawer to close it */}
        {/* backend: this is just UI for dimming the main content when drawer is open */}
        <Animated.View
          pointerEvents={menuOpen ? 'auto' : 'none'}
          style={[styles.overlayContainer, { opacity: menuAnim }]}
        >
          <Pressable
            style={styles.fullOverlay}
            onPress={() => setMenuOpen(false)}
          >
            <Animated.View
              style={[styles.scrim, { opacity: overlayOpacity }]}
            />
          </Pressable>
        </Animated.View>


        {/* CUSTOM SIDE DRAWER – simple user panel */}
        {/* backend: this panel groups profile-related routes and logout */}
        <Animated.View
          style={[
            styles.drawer,
            { width: menuWidth, transform: [{ translateX }] },
          ]}
        >
          <View style={styles.drawerInner}>
            <ScrollView>
              {/* top profile section – initials as avatar, tap to add photo */}
              {/* backend: profile photo upload endpoint can be wired to this later */}
              <View style={styles.profileSection}>
                <TouchableOpacity
                  onPress={() => setPhotoModalVisible(true)}
                  style={styles.profileCircle}
                >
                  <Text style={styles.profileInitial}>
                    {userName[0].toUpperCase()}
                  </Text>
                </TouchableOpacity>
                <View>
                  <Text style={styles.profileName}>{userName}</Text>                  
                </View>
                {/* close icon to dismiss drawer */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setMenuOpen(false)}
                >
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
              </View>


              <View style={styles.divider} />


              {/* profile related routes controlled by NewBar */}
              {/* backend: each one can hit its own profile endpoint when NewBar opens */}
              <MenuItem
                icon="ℹ️"
                label="About me"
                onPress={() => onOpenProfile('about')}
              />
              <MenuItem
                icon="✏️"
                label="Edit details"
                onPress={() => onOpenProfile('edit')}
              />
              <MenuItem
                icon="🔒"
                label="Change password"
                onPress={() => onOpenProfile('password')}
              />
            </ScrollView>


            {/* bottom logout action inside drawer */}
            {/* backend: same onLogout handler as header icon */}
            <TouchableOpacity style={styles.logoutRow} onPress={confirmLogout}>
              <Text style={styles.logoutText}>Log out</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>


        {/* Profile Photo Modal – reserved spot for image picker integration */}
        {/* backend: when wired, this will upload and save profile picture for the user */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={photoModalVisible}
          onRequestClose={() => setPhotoModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Add Profile Photo</Text>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={() => {
                  // TO-DO: connect image picker (gallery) here
                  setPhotoModalVisible(false);
                }}
              >
                <Text style={styles.photoButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={() => {
                  // TO-DO: connect camera capture here
                  setPhotoModalVisible(false);
                }}
              >
                <Text style={styles.photoButtonText}>Take a Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => setPhotoModalVisible(false)}
              >
                <Text style={styles.closeModalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};


export default Landing;


// ================= STYLES – soft dashboard look to keep things calm =================


const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: SOFT_BG },
  safeArea: { flex: 1 },


  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: SOFT_BG,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_GRAY,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  menuButton: { marginRight: 12 },
  hamburgerWrap: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#EAF8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 3,
  },
  menuIcon: {
    fontSize: 18,
    color: THEME_COLOR,
    fontWeight: '900',
    marginRight: 8,
  },
  headerText: { flex: 1 },
  greetingText: { fontSize: 18, fontWeight: '900', color: TEXT_COLOR },
  subText: { fontSize: 13, color: ACCENT_COLOR, marginTop: 2 },
  headerRight: { flexDirection: 'row', gap: 12 },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: LIGHT_GRAY,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconText: { fontSize: 18 },


  scrollContent: { paddingHorizontal: 18, paddingTop: 18 },


  symptomCard: {
    backgroundColor: THEME_COLOR,
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    minHeight: 140,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 10,
  },
  symptomTopRow: { flexDirection: 'row', alignItems: 'center' },
  emojiCircle: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 6,
  },
  emojiBig: { fontSize: 36 },
  symptomRightText: { flex: 1 },
  symptomTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 6,
  },
  symptomSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.92)' },


  symptomBottomRow: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clickButtonPrimary: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 6,
  },
  clickButtonPrimaryText: {
    color: THEME_COLOR,
    fontWeight: '900',
    fontSize: 15,
  },
  smallEmojiWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.14)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallEmoji: { fontSize: 22 },


  servicesSection: { marginBottom: 22 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: TEXT_COLOR,
    marginBottom: 14,
  },
  servicesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '31%',
    aspectRatio: 0.95,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF7F2',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: SOFT_BG,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceIcon: { fontSize: 24 },
  serviceTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: TEXT_COLOR,
    textAlign: 'center',
    lineHeight: 16,
  },


  familySection: {
    marginBottom: 16,
  },
  familyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  seeAllText: { fontSize: 12, fontWeight: '700', color: ACCENT_COLOR },
  familyMemberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E3EFE8',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 4,
  },
  familyAvatar: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#EAF8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarEmoji: { fontSize: 26 },
  familyInfo: { flex: 1 },
  familyName: {
    fontSize: 15,
    fontWeight: '800',
    color: TEXT_COLOR,
    marginBottom: 3,
  },
  familyRelation: {
    fontSize: 12,
    color: ACCENT_COLOR,
    fontWeight: '700',
  },


  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  fullOverlay: { flex: 1 },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000' },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 11,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 22,
  },
  drawerInner: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    overflow: 'hidden',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
  },
  profileCircle: {
    width: 96,             // square, same width & height
  height: 96,
  borderRadius: 48,      // exactly half of width/height → perfect circle
  backgroundColor: '#EAF8F0',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 12,
  shadowColor: '#000',
  shadowOpacity: 0.04,
  shadowRadius: 8,
  elevation: 4,
  },
  profileInitial: { fontSize: 36, fontWeight: '900', color: THEME_COLOR },
  profileText: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '900', color: TEXT_COLOR },
  profilePhone: { fontSize: 12, color: '#8FBBA1', marginTop: 6 },
  closeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  closeIcon: { fontSize: 20, fontWeight: 'bold', color: TEXT_COLOR },
  divider: { height: 1, backgroundColor: '#E3EFE8', marginVertical: 18 },
  menuItems: { flex: 1 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 6,
  },
  menuItemIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: '#EAF8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 3,
  },
  menuItemIcon: { fontSize: 22 },
  menuItemLabel: { fontSize: 16, color: TEXT_COLOR, fontWeight: '800' },
  drawerBottom: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: LIGHT_GRAY,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT_COLOR,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 18,
    marginHorizontal: 6,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 10,
  },
  logoutText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '900',
    textAlign: 'center',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: TEXT_COLOR,
    marginBottom: 16,
  },
  photoButton: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: '#2FA678',
    borderRadius: 8,
    marginBottom: 12,
  },
  photoButtonText: {
    color: '#fff',
    fontWeight: '800',
    textAlign: 'center',
  },
  closeModalButton: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: '#ccc',
    borderRadius: 8,
  },
  closeModalButtonText: {
    color: '#333',
    fontWeight: '800',
    textAlign: 'center',
  },
});