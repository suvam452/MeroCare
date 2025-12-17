import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
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

const { width } = Dimensions.get('window');

const THEME_COLOR = '#255E67';
const TEXT_COLOR = '#133D2E';
const ACCENT_COLOR = '#2FA678';
const LIGHT_GRAY = '#F2F7F5';
const SOFT_BG = '#FAFFFB';

// profile modes shared with NewBar
type NewBarMode = 'about' | 'edit' | 'password';

interface LandingProps {
  userName: string;
  onLogout: () => void;
  onOpenCheck: () => void;
  onOpenProfile: (mode: NewBarMode) => void;
  onOpenAddFamily: () => void;
  onOpenNotification: () => void; // bell → notification screen
}

const Landing = ({
  userName,
  onLogout,
  onOpenCheck,
  onOpenProfile,
  onOpenAddFamily,
  onOpenNotification,
}: LandingProps) => {
  // local UI state for this home screen only
  const [menuOpen, setMenuOpen] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  const [typing, setTyping] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);

  // friendly intro line from “Mero Care” nurse bot
  const fullMessage = 'Hi, I am Mero Care, caring for you everyday 😊';

  // nurse avatar click → typewriter effect
  const handleNurseClick = () => {
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
    }, 40);
  };

  // simple custom drawer animation (no React Navigation drawer)
  const menuAnim = useRef(new Animated.Value(0)).current;
  const menuWidth = Math.min(360, Math.round(width * 0.82));

  useEffect(() => {
    Animated.timing(menuAnim, {
      toValue: menuOpen ? 1 : 0,
      duration: 280,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [menuOpen]);

  // confirm before logging the user out
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
        setMenuOpen(false);
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
      <StatusBar barStyle="dark-content" backgroundColor={SOFT_BG} />

      <SafeAreaView style={styles.safeArea}>
        {/* HEADER – greeting + quick actions (bell + logout) */}
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setMenuOpen(!menuOpen)}
            >
              <View style={styles.hamburgerWrap}>
                <Text style={styles.menuIcon}>☰</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.headerText}>
              <Text style={styles.greetingText}>Hi {userName}!</Text>
              <Text style={styles.subText}>How are you feeling today?</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            {/* notification bell opens dedicated notification screen */}
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

        {/* MAIN CONTENT */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* SYMPTOM CHECK CARD – primary CTA of the app */}
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
          <View style={styles.servicesSection}>
            <Text style={styles.sectionTitle}>Services</Text>

            <View style={styles.servicesGrid}>
              {[
                { icon: '🧾', title: 'Health History' },
                {
                  icon: '👨‍👩‍👧',
                  title: 'Add Family',
                  onPress: onOpenAddFamily,
                },
                { icon: '⏰', title: 'Reminders' }, // future feature slot
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

          {/* FAMILY – will later be filled from backend list */}
          <View style={styles.familySection}>
            <View style={styles.familyHeader}>
              <Text style={styles.sectionTitle}>Family Members</Text>
              <Text style={styles.seeAllText}>See all</Text>
            </View>

            {[
              { name: 'Father name', relation: 'Father', emoji: '👨' },
              { name: 'Mother naame', relation: 'Mother', emoji: '👩' },
            ].map((member, index) => (
              <View key={index} style={styles.familyMemberCard}>
                <View style={styles.familyAvatar}>
                  <Text style={styles.avatarEmoji}>{member.emoji}</Text>
                </View>
                <View style={styles.familyInfo}>
                  <Text style={styles.familyName}>{member.name}</Text>
                  <Text style={styles.familyRelation}>{member.relation}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* OVERLAY – catches taps outside the drawer to close it */}
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
        <Animated.View
          style={[
            styles.drawer,
            { width: menuWidth, transform: [{ translateX }] },
          ]}
        >
          <View style={styles.drawerInner}>
            <ScrollView>
              {/* top profile section – initials as avatar, tap to add photo */}
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
                  <Text style={styles.profilePhone}>9840000000</Text>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setMenuOpen(false)}
                >
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              {/* profile related routes controlled by NewBar */}
              <MenuItem icon="ℹ️" label="About me" onPress={() => onOpenProfile('about')} />
              <MenuItem icon="✏️" label="Edit details" onPress={() => onOpenProfile('edit')} />
              <MenuItem icon="🔒" label="Change password" onPress={() => onOpenProfile('password')} />
            </ScrollView>

            {/* bottom logout action inside drawer */}
            <TouchableOpacity style={styles.logoutRow} onPress={confirmLogout}>
              <Text style={styles.logoutText}>Log out</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Profile Photo Modal – reserved spot for image picker integration */}
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
  menuButton: { padding: 6, marginRight: 12 },
  hamburgerWrap: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  menuIcon: { fontSize: 20, color: TEXT_COLOR, fontWeight: '700' },
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

  familySection: { marginBottom: 16 },
  familyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  seeAllText: { fontSize: 12, fontWeight: '700', color: ACCENT_COLOR },
  familyMemberCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: LIGHT_GRAY,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  familyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: THEME_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarEmoji: { fontSize: 26, color: '#fff' },
  familyInfo: { flex: 1 },
  familyName: {
    fontSize: 15,
    fontWeight: '800',
    color: TEXT_COLOR,
    marginBottom: 2,
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
  profileSection: { flexDirection: 'row', alignItems: 'center', paddingBottom: 8 },
  profileCircle: {
    width: 92,
    height: 92,
    borderRadius: 22,
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
  divider: { height: 1, backgroundColor: LIGHT_GRAY, marginVertical: 16 },
  menuItems: { flex: 1 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
  },
  menuItemIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#E8FBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  menuItemIcon: { fontSize: 18 },
  menuItemLabel: { fontSize: 15, color: TEXT_COLOR, fontWeight: '800' },
  drawerBottom: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: LIGHT_GRAY },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2FA678',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginHorizontal: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  logoutText: {
    fontSize: 15,
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
