import { ArrowUpRight, CalendarCheck, Mic, Zap } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { SectionCard } from '@/components/SectionCard';
import {
  mockAssistantFeed,
  mockEvents,
  mockInbox,
  mockTasks,
} from '@/constants/mockData';
import { useAppTheme } from '@/theme';

const quickActions = [
  { id: 'action-reply', label: 'Reply now', icon: ArrowUpRight },
  { id: 'action-schedule', label: 'Smart schedule', icon: CalendarCheck },
  { id: 'action-summary', label: 'Daily summary', icon: Zap },
  { id: 'action-voice', label: 'Voice capture', icon: Mic },
];

export default function HomeScreen() {
  const { colors } = useAppTheme();

  return (
    <Screen title="Martin++" subtitle="Inbox, calendar, and tasks orchestrated for you.">
      <View style={styles.quickActionsRow}>
        {quickActions.map(({ id, label, icon: Icon }) => (
          <Pressable
            key={id}
            style={[styles.quickAction, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Icon color={colors.accent} size={20} strokeWidth={2.4} />
            <Text style={[styles.quickActionLabel, { color: colors.textPrimary }]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <SectionCard title="Inbox Pulse" subtitle="Martin triaged the essentials.">
        {mockInbox.map((item) => (
          <View key={item.id} style={[styles.inboxItem, { borderColor: colors.border }]}>
            <View style={[styles.badge, { backgroundColor: colors.accentMuted }]}>
              <Text style={[styles.badgeText, { color: colors.background }]}>
                {item.category.toUpperCase()}
              </Text>
            </View>
            <View style={styles.inboxBody}>
              <Text style={[styles.inboxSubject, { color: colors.textPrimary }]}>{item.subject}</Text>
              <Text style={[styles.inboxMeta, { color: colors.textSecondary }]}>
                {item.sender} • {item.receivedAt}
              </Text>
              <Text numberOfLines={2} style={[styles.inboxPreview, { color: colors.textMuted }]}>
                {item.preview}
              </Text>
            </View>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="Upcoming schedule" subtitle="AI-resolved conflicts and optimal focus blocks.">
        {mockEvents.map((event) => (
          <View key={event.id} style={[styles.eventItem, { backgroundColor: colors.surfaceElevated }]}>
            <View style={styles.eventTimes}>
              <Text style={[styles.eventTime, { color: colors.textPrimary }]}>{event.start}</Text>
              <Text style={[styles.eventTimeEnd, { color: colors.textMuted }]}>{event.end}</Text>
            </View>
            <View style={styles.eventContent}>
              <Text style={[styles.eventTitle, { color: colors.textPrimary }]}>{event.title}</Text>
              {event.location ? (
                <Text style={[styles.eventMeta, { color: colors.textSecondary }]}>{event.location}</Text>
              ) : null}
              <Text style={[styles.eventMeta, { color: colors.textMuted }]}>
                {event.attendees.join(', ')}
              </Text>
            </View>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="Focus tasks" subtitle="High impact work surfaced by Martin.">
        {mockTasks.map((task) => (
          <View key={task.id} style={[styles.taskItem, { borderColor: colors.border }]}>
            <View style={styles.taskHeader}>
              <Text style={[styles.taskTitle, { color: colors.textPrimary }]}>{task.title}</Text>
              <Text style={[styles.taskStatus, { color: colors.accent }]}>
                {Math.round(task.progress)}%
              </Text>
            </View>
            <View style={styles.taskMetaRow}>
              <Text style={[styles.taskMeta, { color: colors.textSecondary }]}>
                Due: {task.dueAt ?? 'Flexible'}
              </Text>
              <Text style={[styles.taskMeta, { color: colors.textMuted }]}>{task.source}</Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${task.progress}%`, backgroundColor: colors.accent },
                ]}
              />
            </View>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="Latest automations" subtitle="Every action is explainable and reversible.">
        {mockAssistantFeed.map((action) => (
          <View key={action.id} style={styles.actionRow}>
            <View
              style={[
                styles.actionIndicator,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.actionConfidence, { color: colors.accent }]}>
                {Math.round(action.confidence * 100)}%
              </Text>
            </View>
            <View style={styles.actionBody}>
              <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>{action.label}</Text>
              <Text style={[styles.actionMeta, { color: colors.textMuted }]}>{action.timeLabel}</Text>
            </View>
          </View>
        ))}
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  quickActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  inboxItem: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  inboxBody: {
    gap: 4,
  },
  inboxSubject: {
    fontSize: 16,
    fontWeight: '600',
  },
  inboxMeta: {
    fontSize: 13,
  },
  inboxPreview: {
    fontSize: 13,
  },
  eventItem: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  eventTimes: {
    width: 64,
  },
  eventTime: {
    fontSize: 16,
    fontWeight: '600',
  },
  eventTimeEnd: {
    marginTop: 2,
    fontSize: 13,
  },
  eventContent: {
    flex: 1,
    gap: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  eventMeta: {
    fontSize: 13,
  },
  taskItem: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  taskStatus: {
    fontSize: 14,
    fontWeight: '700',
  },
  taskMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskMeta: {
    fontSize: 13,
  },
  progressBar: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    flex: 1,
    borderRadius: 999,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  actionIndicator: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionConfidence: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionBody: {
    flex: 1,
    gap: 4,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionMeta: {
    fontSize: 12,
  },
});