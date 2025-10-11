import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { RefreshCw, Mail, Sparkles } from 'lucide-react-native';

import { Screen } from '@/components/Screen';
import { useApi } from '@/hooks/useApi';
import { apiClient } from '@/services/api';
import { useAppTheme } from '@/theme';
import type { InboxCategory, Email } from '@/types';
import { useInboxStore } from '@/store/inboxStore';
import { mockInbox } from '@/constants/mockData';

type InboxFilter = 'all' | InboxCategory;

const FILTERS: { label: string; value: InboxFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Important', value: 'important' },
  { label: 'Actionable', value: 'actionable' },
  { label: 'FYI', value: 'fyi' },
];

export default function InboxScreen() {
  const { colors } = useAppTheme();
  const { emails, setEmails, updateEmailStatus } = useInboxStore();
  const [filter, setFilter] = useState<InboxFilter>('all');
  const { data: apiEmails, loading, error, execute: refreshInbox } = useApi<Email[]>();
  const [autoTriaging, setAutoTriaging] = useState(false);

  const loadInbox = async (category?: InboxFilter) => {
    try {
      const queryParams = category && category !== 'all' ? { category } : {};
      const response = await apiClient.getInbox(queryParams);
      if (response.success && response.data) {
        setEmails(response.data);
      } else {
        // Fallback to mock data if API fails during development
        console.warn('API failed, using mock data');
        setEmails(mockInbox.filter(email => category === 'all' || email.category === category));
      }
    } catch (error: any) {
      console.warn('API call failed, using mock data:', error);
      // Fallback to mock data
      setEmails(mockInbox.filter(email => category === 'all' || email.category === category));
    }
  };

  useEffect(() => {
    loadInbox(filter);
  }, [filter]);

  const handleRefresh = () => {
    loadInbox(filter);
  };

  const handleTriage = async () => {
    setAutoTriaging(true);
    try {
      const response = await apiClient.triageInbox();
      if (response.success) {
        Alert.alert(
          'AI Triage Complete',
          `Successfully triaged ${response.data?.triaged || 0} emails.`,
          [{ text: 'Refresh', onPress: handleRefresh }]
        );
      } else {
        throw new Error('Triage API failed');
      }
    } catch (error: any) {
      Alert.alert('Triage Failed', 'Please check your connection and try again');
    } finally {
      setAutoTriaging(false);
    }
  };

  const handleEmailPress = (email: Email) => {
    // TODO: Navigate to detailed view
    Alert.alert(email.subject, email.preview.substring(0, 200) + '...');
  };

  const filteredEmails = useMemo(() => {
    let filtered = emails;
    if (filter !== 'all') {
      filtered = emails.filter((email) => email.category === filter);
    }
    return filtered;
  }, [emails, filter]);

  const getCategoryColor = (category: InboxCategory) => {
    switch (category) {
      case 'important': return '#FF6B6B';
      case 'actionable': return '#4ECDC4';
      case 'fyi': return '#95A5A6';
      default: return colors.accent;
    }
  };

  return (
    <Screen
      title="Inbox"
      subtitle="AI-powered email triage and management."
      headerSlot={
        <View style={styles.headerActions}>
          <Pressable
            onPress={handleTriage}
            style={[styles.iconButton, { backgroundColor: colors.surface, opacity: autoTriaging ? 0.6 : 1 }]}
            disabled={autoTriaging}
          >
            <Sparkles color={colors.accent} size={18} />
          </Pressable>
          <Pressable
            onPress={handleRefresh}
            style={[styles.iconButton, { backgroundColor: colors.surface, opacity: loading ? 0.6 : 1 }]}
            disabled={loading}
          >
            <RefreshCw color={colors.accent} size={18} />
          </Pressable>
        </View>
      }
    >
      <View style={[styles.filterBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {FILTERS.map(({ label, value }) => {
          const isActive = filter === value;
          return (
            <Pressable
              key={value}
              onPress={() => setFilter(value)}
              style={[
                styles.filterPill,
                {
                  backgroundColor: isActive ? colors.accent : 'transparent',
                  borderColor: isActive ? colors.accent : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterLabel,
                  { color: isActive ? colors.background : colors.textPrimary },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {autoTriaging && (
        <View style={[styles.triageNotice, { backgroundColor: colors.accentMuted, borderColor: colors.accent }]}>
          <Text style={[styles.triageText, { color: colors.accent }]}>
            🤖 AI is analyzing and categorizing your emails...
          </Text>
        </View>
      )}

      {(loading || error) && (
        <View style={[styles.status, { backgroundColor: error ? '#FFE5E5' : colors.surface }]}>
          <Text style={[styles.statusText, { color: error ? '#FF6B6B' : colors.textSecondary }]}>
            {loading ? 'Loading emails...' : `Error: ${error?.message}`}
          </Text>
        </View>
      )}

      <View style={styles.list}>
        {filteredEmails.map((email) => (
          <Pressable
            key={email.id}
            onPress={() => handleEmailPress(email)}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.sender, { color: colors.textPrimary }]}>{email.sender}</Text>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: getCategoryColor(email.category), borderColor: colors.surface },
                ]}
              >
                <Text style={[styles.categoryText, { color: colors.background }]}>
                  {email.category.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={[styles.subject, { color: colors.textPrimary }]}>{email.subject}</Text>
            <Text style={[styles.preview, { color: colors.textSecondary }]} numberOfLines={2}>
              {email.preview}
            </Text>
            <View style={styles.footerRow}>
              <Text style={[styles.meta, { color: colors.textMuted }]}>{email.receivedAt}</Text>
              <View style={styles.readIndicator}>
                {!email.isRead && <View style={[styles.unreadDot, { backgroundColor: colors.accent }]} />}
              </View>
            </View>
          </Pressable>
        ))}

        {filteredEmails.length === 0 && !loading && !error && (
          <View style={styles.emptyState}>
            <Mail color={colors.textMuted} size={48} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No emails found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {filter === 'all' ? 'Your inbox is empty.' : `No ${filter} emails in your inbox.`}
            </Text>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBar: {
    borderWidth: 1,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    gap: 8,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  triageNotice: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  triageText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  status: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    textAlign: 'center',
  },
  list: {
    gap: 14,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sender: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 2,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: 'white',
  },
  subject: {
    fontSize: 18,
    fontWeight: '600',
  },
  preview: {
    fontSize: 13,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  readIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  meta: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});
