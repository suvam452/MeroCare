import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import api from './src/services/api';

type DiagnosisHistoryProps = {
  onBack: () => void;
};

type DiagnosisItem = {
  id: number;
  symptoms: string;
  diagnosis_result: string;
  treatment: string;
  urgency: string;
  visibility: 'private' | 'public';
  created_at: string;
};

const DiagnosisHistory = ({ onBack }: DiagnosisHistoryProps) => {
  const [history, setHistory] = useState<DiagnosisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'all' | 'private' | 'public'>('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get('/diagnosis/my');
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (id: number, currentVisibility: string) => {
    try {
      const newVisibility = currentVisibility === 'private' ? 'public' : 'private';
      
      await api.patch(`/diagnosis/update-visibility/${id}?visibility=${newVisibility}`);
      
      // Update local state
      setHistory(prevHistory =>
        prevHistory.map(item =>
          item.id === id ? { ...item, visibility: newVisibility as 'private' | 'public' } : item
        )
      );
    } catch (error) {
      console.error('Error updating visibility:', error);
      Alert.alert('Error', 'Failed to update visibility');
    }
  };

  // Filter history based on selected tab
  const filteredHistory = history.filter(item => {
    if (selectedTab === 'all') return true;
    return item.visibility === selectedTab;
  });

  const renderHistoryItem = ({ item }: { item: DiagnosisItem }) => (
    <View style={styles.historyCard}>
      {/* Header with date and visibility */}
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
        <TouchableOpacity
          style={[
            styles.visibilityBadge,
            item.visibility === 'private'
              ? styles.privateBadge
              : styles.publicBadge,
          ]}
          onPress={() => toggleVisibility(item.id, item.visibility)}
        >
          <Text style={styles.badgeText}>
            {item.visibility === 'private' ? '🔒 Private' : '👥 Shared'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Full Diagnosis Content */}
      <View style={styles.contentSection}>
        <Text style={styles.contentText}>{item.symptoms}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Diagnosis History</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
          onPress={() => setSelectedTab('all')}
        >
          <Text
            style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}
          >
            All ({history.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'private' && styles.activeTab]}
          onPress={() => setSelectedTab('private')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'private' && styles.activeTabText,
            ]}
          >
            Private ({history.filter(h => h.visibility === 'private').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'public' && styles.activeTab]}
          onPress={() => setSelectedTab('public')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'public' && styles.activeTabText,
            ]}
          >
            Shared ({history.filter(h => h.visibility === 'public').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#346e7a" />
          <Text style={styles.loadingText}>Loading your history...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredHistory}
          renderItem={renderHistoryItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No Records Found</Text>
              <Text style={styles.emptyText}>
                {selectedTab === 'all'
                  ? 'No diagnosis history found. Start checking symptoms!'
                  : `No ${selectedTab} records found.`}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF4',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  activeTab: {
    backgroundColor: '#346e7a',
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
  visibilityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  privateBadge: {
    backgroundColor: '#FFE5E5',
  },
  publicBadge: {
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

export default DiagnosisHistory;
