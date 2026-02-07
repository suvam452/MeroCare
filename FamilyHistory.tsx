import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import api from './src/services/api';

type FamilyHistoryProps = {
  onBack: () => void;
};

type FamilyMember = {
  id: number;
  full_name: string;
  role: string;
  email: string;
};

type DiagnosisItem = {
  id: number;
  user_diagnosis: string;
  created_at: string;
  visibility: string;
};

const FamilyHistory = ({ onBack }: FamilyHistoryProps) => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [history, setHistory] = useState<DiagnosisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Fetch family members on mount
  useEffect(() => {
    fetchFamilyMembers();
  }, []);

  // Fetch history when a member is selected
  useEffect(() => {
    if (selectedMember && currentUserId) {
      fetchMemberHistory(selectedMember.id);
    }
  }, [selectedMember, currentUserId]);

  const fetchFamilyMembers = async () => {
    setLoading(true);
    try {
      // Get current user info
      const userRes = await api.get('/users/me');
      const userId = userRes.data.id;
      setCurrentUserId(userId);

      // Get family members list
      const response = await api.get(`/family/list/${userId}`);
      
      // Filter out "Self" - only show other family members
      const otherMembers = response.data.filter(
        (member: FamilyMember) => member.role !== 'Self'
      );

      setFamilyMembers(otherMembers);

      // Auto-select first member if available
      if (otherMembers.length > 0) {
        setSelectedMember(otherMembers[0]);
      }
    } catch (error) {
      console.error('Error fetching family members:', error);
      Alert.alert('Error', 'Failed to load family members');
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberHistory = async (targetUserId: number) => {
  setHistoryLoading(true);
  try {
    console.log('🔍 Fetching history for user:', targetUserId);
    console.log('🔍 Requester ID:', currentUserId);
    
    const response = await api.get(
      `/family/member-history/${targetUserId}?requester_id=${currentUserId}`
    );
    
    console.log('✅ Response received:', response.data);
    console.log('📋 History array:', response.data.history);
    console.log('📊 History length:', response.data.history?.length || 0);
    
    setHistory(response.data.history || []);
  } catch (error: any) {
    console.error('❌ Error fetching member history:', error);
    console.error('❌ Error response:', error.response?.data);
    
    if (error.response?.status === 403) {
      Alert.alert('Unauthorized', 'You do not have permission to view this member\'s history');
    } else {
      Alert.alert('Error', 'Failed to load history');
    }
    setHistory([]);
  } finally {
    setHistoryLoading(false);
  }
};

  const renderHistoryItem = ({ item }: { item: DiagnosisItem }) => (
    <View style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <Text style={styles.dateText}>
          {new Date(item.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
        <View style={styles.publicBadge}>
          <Text style={styles.badgeText}>👥 Shared</Text>
        </View>
      </View>

      <View style={styles.contentSection}>
        <Text style={styles.contentText}>{item.user_diagnosis}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Family History</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#346e7a" />
          <Text style={styles.loadingText}>Loading family members...</Text>
        </View>
      </View>
    );
  }

  // No family members
  if (familyMembers.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Family History</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>👨‍👩‍👧‍👦</Text>
          <Text style={styles.emptyTitle}>No Family Members Yet</Text>
          <Text style={styles.emptyText}>
            Add family members to view their shared medical history
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Family History</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Family Member Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScrollContainer}
        contentContainerStyle={styles.tabContainer}
      >
        {familyMembers.map((member) => (
          <TouchableOpacity
            key={member.id}
            style={[
              styles.tab,
              selectedMember?.id === member.id && styles.activeTab,
            ]}
            onPress={() => setSelectedMember(member)}
          >
            <Text
              style={[
                styles.tabText,
                selectedMember?.id === member.id && styles.activeTabText,
              ]}
            >
              {member.full_name} - {member.role}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* History Content */}
      {historyLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#346e7a" />
          <Text style={styles.loadingText}>
            Loading {selectedMember?.full_name}'s history...
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No Shared Records</Text>
              <Text style={styles.emptyText}>
                {selectedMember?.full_name} hasn't shared any diagnosis records yet
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#346e7a',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  tabScrollContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF4',
  },
  tabContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  tab: {
    paddingVertical:10,
    paddingHorizontal: 15,
    marginRight: 10,
    borderRadius:10,
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E8ECF4',
  },
  activeTab: {
    backgroundColor: '#346e7a',
    borderColor: '#346e7a',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A6B82',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F8',
  },
  dateText: {
    fontSize: 13,
    color: '#8E9AAF',
    fontWeight: '500',
  },
  publicBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#E5F5FF',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1f2a44',
  },
  contentSection: {
    marginTop: 12,
  },
  contentText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8E9AAF',
  },
  emptyContainer: {
    marginTop: 80,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2a44',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#8E9AAF',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default FamilyHistory;