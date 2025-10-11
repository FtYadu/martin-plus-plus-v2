import { useEffect, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar as CalendarIcon, Plus, RefreshCw } from 'lucide-react-native';

import { Screen } from '@/components/Screen';
import { SectionCard } from '@/components/SectionCard';
import { mockEvents } from '@/constants/mockData';
import { useAppTheme } from '@/theme';
import { useApi } from '@/hooks/useApi';
import { apiClient } from '@/services/api';
import type { CalendarEvent } from '@/types';

export default function CalendarScreen() {
  const { colors } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Load events from API
  useEffect(() => {
    loadCalendarEvents();
  }, []);

  const loadCalendarEvents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getEvents({
        start: new Date().toISOString(),
        end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Next 24 hours
      });
      if (response.success && response.data) {
        setCalendarEvents(response.data);
      } else {
        // Fallback to mock data if API fails
        console.warn('Calendar API failed, using mock data');
        setCalendarEvents(mockEvents);
      }
    } catch (error: any) {
      console.warn('Calendar load failed, using mock data:', error);
      setCalendarEvents(mockEvents);
    } finally {
      setLoading(false);
    }
  };

  const formattedEvents = calendarEvents.map(event => ({
    id: event.id,
    title: event.title,
    description: event.description,
    start: event.start,
    end: event.end,
    location: event.location,
    attendees: event.attendees,
    status: event.status,
  }));

  const handleCreateEvent = () => {
    Alert.alert('Create Event', 'Event creation coming soon with Google Calendar integration!');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // TODO: Refresh from Google Calendar API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Screen
      title="Calendar"
      subtitle="Smart scheduling across time zones with conflict resolution."
      scrollable={false}
    >
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={[styles.calendarHeader, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <CalendarIcon color={colors.accent} size={24} />
          <View style={styles.headerContent}>
            <Text style={[styles.dateText, { color: colors.textPrimary }]}>
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
            <Text style={[styles.subText, { color: colors.textSecondary }]}>
              Today, {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric' })}
            </Text>
          </View>
          <Pressable onPress={handleCreateEvent} style={[styles.addButton, { backgroundColor: colors.accent }]}>
            <Plus color={colors.background} size={20} />
          </Pressable>
        </View>

        <SectionCard title="Today's Schedule" subtitle="AI-optimized for focus and collaboration.">
          {formattedEvents.map((event) => (
            <Pressable
              key={event.id}
              style={[styles.eventCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
              onPress={() => Alert.alert(event.title, event.description || 'No description')}
            >
              <View style={styles.eventTimeBlock}>
                <Text style={[styles.eventTime, { color: colors.textPrimary }]}>{event.start}</Text>
                <View style={[styles.timeDivider, { backgroundColor: colors.accent }]} />
                <Text style={[styles.eventTime, { color: colors.textMuted }]}>{event.end}</Text>
              </View>
              <View style={styles.eventDetails}>
                <Text style={[styles.eventTitle, { color: colors.textPrimary }]}>{event.title}</Text>
                {event.location && (
                  <Text style={[styles.eventLocation, { color: colors.textSecondary }]}>{event.location}</Text>
                )}
                <View style={styles.attendeesRow}>
                  {event.attendees.slice(0, 3).map((attendee, index) => (
                    <View
                      key={index}
                      style={[styles.attendeeAvatar, { backgroundColor: colors.accent, borderColor: colors.surfaceElevated }]}
                    >
                      <Text style={[styles.attendeeInitial, { color: colors.background }]}>
                        {attendee.charAt(0)}
                      </Text>
                    </View>
                  ))}
                  {event.attendees.length > 3 && (
                    <Text style={[styles.moreAttendees, { color: colors.textMuted }]}>
                      +{event.attendees.length - 3}
                    </Text>
                  )}
                </View>
              </View>
            </Pressable>
          ))}
        </SectionCard>

        <View style={[styles.placeholder, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <CalendarIcon color={colors.textMuted} size={48} strokeWidth={1.5} />
          <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
            Full calendar view coming soon
          </Text>
          <Text style={[styles.placeholderSubtext, { color: colors.textMuted }]}>
            Monthly/weekly layouts with smart scheduling
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
  },
  headerContent: {
    flex: 1,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
  },
  subText: {
    fontSize: 14,
    marginTop: 2,
  },
  eventCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  eventTimeBlock: {
    alignItems: 'center',
    gap: 8,
  },
  eventTime: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeDivider: {
    width: 2,
    height: 20,
    borderRadius: 1,
  },
  eventDetails: {
    flex: 1,
    gap: 6,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  eventLocation: {
    fontSize: 13,
  },
  attendeesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  attendeeAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  attendeeInitial: {
    fontSize: 12,
    fontWeight: '700',
  },
  moreAttendees: {
    fontSize: 12,
    fontWeight: '600',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderSubtext: {
    fontSize: 13,
    textAlign: 'center',
  },
});
