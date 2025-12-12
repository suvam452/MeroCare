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
} from 'react-native';

const { width } = Dimensions.get('window');

// Green-themed palette (uplifted, accessible contrast)
const THEME_COLOR = '#255E67';
const TEXT_COLOR = '#133D2E';
const ACCENT_COLOR = '#2FA678';
const LIGHT_GRAY = '#F2F7F5';
const SOFT_BG = '#FAFFFB';

interface LandingProps {
  userName: string;
  onLogout: () => void;
  onOpenCheck: () => void;
}

const Landing = ({ userName, onLogout, onOpenCheck }: LandingProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  // -------------------------- FIXED TYPEWRITER LOGIC --------------------------
  const [typewriterText, setTypewriterText] = useState('');
  const [typing, setTyping] = useState(false);

  const fullMessage = 'Hi, I am Mero Care, caring for you everyday 😊';

  const handleNurseClick = () => {
    if (typing) return;

    setTypewriterText('');
    setTyping(true);

    // SIMPLE SOLUTION: Use string slicing instead of array operations
    let index = 0;
    
    const interval = setInterval(() => {
      // When we reach the end of the string
      if (index > fullMessage.length) {
        clearInterval(interval);
        setTyping(false);
        return;
      }

      // Take a substring from 0 to index
      setTypewriterText(fullMessage.substring(0, index));
      index++;
      
    }, 40); // 40ms per character
  };
  // ----------------------------------------------------------------------

  // Animated value for drawer (0 closed, 1 open)
  const menuAnim = useRef(new Animated.Value(0)).current;
  const menuWidth = Math.min(360, Math.round(width * 0.82));

  useEffect(() => {
    Animated.timing(menuAnim, {
      toValue: menuOpen ? 1 : 0,
      duration: 280,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [menuOpen, menuAnim]);

  const familyMembers = [
    { id: 1, name: 'Father', relation: 'Father', emoji: '👨' },
    { id: 2, name: 'Mother', relation: 'Mother', emoji: '👩' },
  ];

  const services = [
    { id: 'history', title: 'Health\nHistory', icon: '📋' },
    { id: 'add_family', title: 'Add\nFamily', icon: '➕' },
    { id: 'reminder', title: 'Reminder', icon: '⏰' },
  ];

  const confirmLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel' },
      { text: 'Logout', style: 'destructive', onPress: onLogout },
    ]);
  };

  const translateX = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-menuWidth - 10, 0],
  });

  const overlayOpacity = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  const handleServicePress = (serviceId: string) => {
    // BACKEND: Attach API logic here (history, add family, reminders, nurse write)
    switch (serviceId) {
      case 'history':
        Alert.alert('Health History', 'Open health history — hook backend here (history API)');
        break;
      case 'add_family':
        Alert.alert('Add Family', 'Open add family form or modal (add family API)');
        break;
      case 'reminder':
        Alert.alert('Reminder', 'Open reminders (create/view) (reminders API)');
        break;
      default:
        Alert.alert('Service', 'Unknown service');
    }
  };

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
      activeOpacity={0.75}
    >
      <View style={styles.menuItemIconWrap}>
        <Text style={styles.menuItemIcon}>{icon}</Text>
      </View>
      <Text style={styles.menuItemLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const onChangePhoto = () => {
    Alert.alert('Change Photo', 'Use camera or gallery (integrate later)', [
      { text: 'Take photo', onPress: () => Alert.alert('Take photo') },
      { text: 'Pick from gallery', onPress: () => Alert.alert('Pick from gallery') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };
  
  // BACKEND: Endpoint integration for Symptom Check via onOpenCheck prop
  // REMOVED the Alert.alert and directly calls onOpenCheck
  const handleOpenCheck = () => {
    // Directly navigate to the symptom check page
    onOpenCheck();
  };


  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={SOFT_BG} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setMenuOpen(!menuOpen)}
              accessibilityLabel="Open menu"
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
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.iconText}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={confirmLogout}>
              <Text style={styles.iconText}>🚪</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Symptom card */}
          <View style={styles.symptomCard}>
            <View style={styles.symptomTopRow}>
              <View style={styles.emojiCircle}>
                <Text style={styles.emojiBig}>🩺</Text>
              </View>

              <View style={styles.symptomRightText}>
                <Text style={styles.symptomTitle}>Let's check the symptoms</Text>
                <Text style={styles.symptomSubtitle}>Just Click To Enjoy Service</Text>
              </View>
            </View>

            <View style={styles.symptomBottomRow}>
              <TouchableOpacity
                style={styles.clickButtonPrimary}
                onPress={handleOpenCheck}
                activeOpacity={0.9}
              >
                <Text style={styles.clickButtonPrimaryText}>Start Check</Text>
              </TouchableOpacity>

              {/* Nurse emoji with typewriter click */}
              <TouchableOpacity
                style={styles.smallEmojiWrap}
                onPress={handleNurseClick}
              >
                <Text style={styles.smallEmoji}>👩‍⚕️</Text>
              </TouchableOpacity>
            </View>

            {/* Typewriter message UI */}
            {typewriterText.length > 0 && (
              <View
                style={{
                  marginTop: 14,
                  padding: 12,
                  backgroundColor: '#EAF8F0',
                  borderRadius: 12,
                }}
              >
                <Text
                  style={{
                    color: THEME_COLOR,
                    fontWeight: '700',
                    fontSize: 14,
                    lineHeight: 20,
                  }}
                >
                  {typewriterText}
                </Text>
              </View>
            )}
          </View>

          {/* Services */}
          <View style={styles.servicesSection}>
            <Text style={styles.sectionTitle}>Services</Text>
            <View style={styles.servicesGrid}>
              {services.map(service => (
                <TouchableOpacity
                  key={service.id}
                  style={styles.serviceCard}
                  onPress={() => handleServicePress(service.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.serviceIconContainer}>
                    <Text style={styles.serviceIcon}>{service.icon}</Text>
                  </View>
                  <Text style={styles.serviceTitle}>{service.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Family List */}
          <View style={styles.familySection}>
            <View style={styles.familyHeader}>
              <Text style={styles.sectionTitle}>Family Member</Text>
              <TouchableOpacity onPress={() => Alert.alert('See all family')}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            {familyMembers.map(member => (
              <TouchableOpacity
                key={member.id}
                style={styles.familyMemberCard}
                onPress={() => Alert.alert(member.name)}
              >
                <View style={styles.familyAvatar}>
                  <Text style={styles.avatarEmoji}>{member.emoji}</Text>
                </View>
                <View style={styles.familyInfo}>
                  <Text style={styles.familyName}>{member.name}</Text>
                  <Text style={styles.familyRelation}>{member.relation}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>

        {/* Drawer overlay */}
        <Animated.View
          pointerEvents={menuOpen ? 'auto' : 'none'}
          style={[styles.overlayContainer, { opacity: menuAnim }]}
        >
          <Pressable style={styles.fullOverlay} onPress={() => setMenuOpen(false)}>
            <Animated.View style={[styles.scrim, { opacity: overlayOpacity }]} />
          </Pressable>
        </Animated.View>

        {/* Drawer */}
        <Animated.View
          style={[
            styles.drawer,
            {
              width: menuWidth,
              transform: [{ translateX }],
            },
          ]}
        >
          <View style={styles.drawerInner}>
            <View style={styles.drawerTopRow}>
              <TouchableOpacity
                style={styles.innerMenuBtn}
                onPress={() => setMenuOpen(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.innerMenuBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.drawerScroll}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.profileSection}>
                <TouchableOpacity onPress={onChangePhoto} style={styles.profileCircle}>
                  <Text style={styles.profileInitial}>{userName ? userName[0].toUpperCase() : 'U'}</Text>
                </TouchableOpacity>

                <View style={styles.profileText}>
                  <Text style={styles.profileName}>{userName}</Text>
                  <Text style={styles.profilePhone}>9840000000</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.menuItems}>
                <MenuItem icon="ℹ️" label="About me" onPress={() => Alert.alert('About me')} />
                <MenuItem icon="✏️" label="Edit details" onPress={() => Alert.alert('Edit details')} />
                <MenuItem icon="🔒" label="Change password" onPress={() => Alert.alert('Change password')} />
                <MenuItem icon="👨‍👩‍👦" label="Add people" onPress={() => Alert.alert('Add people')} />
                <MenuItem icon="📷" label="Change photo" onPress={onChangePhoto} />
              </View>

              <View style={{ height: 36 }} />
            </ScrollView>

            <View style={styles.drawerBottom}>
              <TouchableOpacity
                style={styles.logoutRow}
                onPress={() => {
                  setMenuOpen(false);
                  confirmLogout();
                }}
                activeOpacity={0.85}
              >
                <View style={styles.logoutIconWrap}>
                  <Text style={styles.logoutIcon}>⤴️</Text>
                </View>
                <Text style={styles.logoutText}>Log out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: SOFT_BG },
  safeArea: { flex: 1 },

  /* ALL YOUR STYLES REMAIN UNCHANGED BELOW */
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
  drawerTopRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 6,
    paddingBottom: 6,
  },
  innerMenuBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: SOFT_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerMenuBtnText: { fontSize: 20, color: TEXT_COLOR },
  drawerScroll: { paddingBottom: 10 },
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
  divider: { height: 1, backgroundColor: LIGHT_GRAY, marginVertical: 16 },
  menuItems: { flex: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 6 },
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
  logoutRow: { flexDirection: 'row', alignItems: 'center' },
  logoutIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E6E6E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoutIcon: { fontSize: 18 },
  logoutText: { fontSize: 15, color: TEXT_COLOR, fontWeight: '900' },
});

export default Landing;