import React, { useState } from 'react';
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
} from 'react-native';

const { width } = Dimensions.get('window');

const THEME_COLOR = '#265E68';
const TEXT_COLOR = '#333';
const ACCENT_COLOR = '#2E8B9E';
const LIGHT_GRAY = '#EEEEEE';

interface LandingProps {
  userName: string;
  onLogout: () => void;
}

const Landing = ({ userName, onLogout }: LandingProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const familyMembers = [
    { id: 1, name: 'Father', relation: 'father', emoji: '👨' },
    { id: 2, name: 'Mother', relation: 'mother', emoji: '👩' },
  ];

  const services = [
    { id: 1, title: 'Current\ndisease', icon: '🏥' },
    { id: 2, title: 'Add\nmember', icon: '➕' },
    { id: 3, title: 'Health\nHistory', icon: '📋' },
    { id: 4, title: 'Old\ndisease', icon: '📚' },
  ];

  const confirmLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel' },
      { text: 'Logout', style: 'destructive', onPress: onLogout },
    ]);
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setMenuOpen(!menuOpen)}
            >
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.greetingText}>Hi {userName}!</Text>
              <Text style={styles.subText}>How are u feeling today?</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.iconText}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={confirmLogout}
            >
              <Text style={styles.iconText}>🚪</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.symptomCard}>
            <View style={styles.symptomTextContainer}>
              <Text style={styles.symptomTitle}>
                Lets check the{'\n'}symptoms
              </Text>
              <TouchableOpacity
                style={styles.clickButton}
                onPress={() => Alert.alert('Symptoms', 'Check symptoms')}
              >
                <Text style={styles.clickButtonText}>Click</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.symptomImageContainer}>
              <Text style={styles.symptomEmoji}>👨‍⚕️👩</Text>
            </View>
          </View>

          <View style={styles.servicesSection}>
            <Text style={styles.sectionTitle}>Services</Text>
            <View style={styles.servicesGrid}>
              {services.map(service => (
                <TouchableOpacity
                  key={service.id}
                  style={styles.serviceCard}
                  onPress={() => Alert.alert('Service', service.title)}
                >
                  <View style={styles.serviceIconContainer}>
                    <Text style={styles.serviceIcon}>{service.icon}</Text>
                  </View>
                  <Text style={styles.serviceTitle}>{service.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.familySection}>
            <View style={styles.familyHeader}>
              <Text style={styles.sectionTitle}>Family Member</Text>
              <TouchableOpacity onPress={() => Alert.alert('See all')}>
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
                  <Text style={styles.familyName}>({member.name})</Text>
                  <Text style={styles.familyRelation}>{member.relation}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#fff' },
  safeArea: { flex: 1 },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_GRAY,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  menuButton: { padding: 8, marginRight: 12 },
  menuIcon: { fontSize: 24, color: TEXT_COLOR, fontWeight: 'bold' },
  headerText: { flex: 1 },
  greetingText: { fontSize: 18, fontWeight: '700', color: TEXT_COLOR },
  subText: { fontSize: 13, color: ACCENT_COLOR, marginTop: 2 },
  headerRight: { flexDirection: 'row', gap: 12 },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D0D0D0',
  },
  iconText: { fontSize: 20 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  symptomCard: {
    backgroundColor: THEME_COLOR,
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    minHeight: 160,
  },
  symptomTextContainer: { flex: 1 },
  symptomTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    lineHeight: 28,
  },
  clickButton: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  clickButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLOR,
  },
  symptomImageContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  symptomEmoji: { fontSize: 48 },
  servicesSection: { marginBottom: 28 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_COLOR,
    marginBottom: 14,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceIcon: { fontSize: 24 },
  serviceTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: ACCENT_COLOR,
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
  seeAllText: { fontSize: 12, fontWeight: '600', color: ACCENT_COLOR },
  familyMemberCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: LIGHT_GRAY,
  },
  familyAvatar: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: THEME_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarEmoji: { fontSize: 36 },
  familyInfo: { flex: 1 },
  familyName: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_COLOR,
    marginBottom: 2,
  },
  familyRelation: {
    fontSize: 12,
    color: ACCENT_COLOR,
    fontWeight: '500',
  },
});

export default Landing;
