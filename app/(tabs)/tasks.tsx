import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { SectionCard } from '@/components/SectionCard';
import { mockTasks } from '@/constants/mockData';
import { useAppTheme } from '@/theme';
import type { TaskStatus } from '@/types';

type FilterOption = 'all' | TaskStatus;

const FILTER_OPTIONS: { label: string; value: FilterOption }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
];

export default function TasksScreen() {
  const { colors } = useAppTheme();
  const [filter, setFilter] = useState<FilterOption>('all');

  const filteredTasks = useMemo(() => {
    if (filter === 'all') return mockTasks;
    return mockTasks.filter((task) => task.status === filter);
  }, [filter]);

  return (
    <Screen title="Tasks & Automations" subtitle="Assistant-curated focus list with progress tracking.">
      <SectionCard title="Filters" subtitle="Adjust slices of your task graph.">
        <View style={styles.segmentRow}>
          {FILTER_OPTIONS.map(({ label, value }) => {
            const active = value === filter;
            return (
              <Pressable
                key={value}
                onPress={() => setFilter(value)}
                style={[
                  styles.segmentPill,
                  {
                    backgroundColor: active ? colors.accent : 'transparent',
                    borderColor: active ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.segmentLabel,
                    { color: active ? colors.background : colors.textPrimary },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SectionCard>

      <SectionCard title="Priority lanes" subtitle="Derived from inbox triage, voice, and assistant heuristics.">
        <View style={styles.taskList}>
          {filteredTasks.map((task) => (
            <View key={task.id} style={[styles.taskCard, { borderColor: colors.border }]}>
              <View style={styles.taskHeader}>
                <Text style={[styles.taskTitle, { color: colors.textPrimary }]}>{task.title}</Text>
                <View
                  style={[
                    styles.priorityBadge,
                    { backgroundColor: colors.accentMuted, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.priorityText, { color: colors.background }]}>
                    {task.priority.toUpperCase()}
                  </Text>
                </View>
              </View>
              <View style={styles.metaRow}>
                <Text style={[styles.meta, { color: colors.textSecondary }]}>
                  Status: {task.status.replace('_', ' ')}
                </Text>
                <Text style={[styles.meta, { color: colors.textMuted }]}>{task.dueAt ?? 'Flexible'}</Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View
                  style={[styles.progressFill, { width: `${task.progress}%`, backgroundColor: colors.accent }]}
                />
              </View>
              <Text style={[styles.source, { color: colors.textMuted }]}>
                Source: {task.source ?? 'Assistant memory'}
              </Text>
            </View>
          ))}
        </View>
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  segmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  segmentPill: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  segmentLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  taskList: {
    gap: 14,
  },
  taskCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  priorityBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meta: {
    fontSize: 12,
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
  source: {
    fontSize: 12,
  },
});