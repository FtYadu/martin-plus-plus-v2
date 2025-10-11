import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { useAppStore, type PersonaStyle, type ThemePreference } from '@/store/useAppStore';
import { useAppTheme } from '@/theme';

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
];

const PERSONA_OPTIONS: { value: PersonaStyle; headline: string; description: string }[] = [
  { value: 'adaptive', headline: 'Adaptive strategist', description: 'Adjust tone dynamically and surface key decisions.' },
  { value: 'formal', headline: 'Formal executive', description: 'Precision. Compliance friendly drafts, enterprise ready.' },
  { value: 'casual', headline: 'Casual collaborator', description: 'Friendly, concise, invites quick action.' },
  { value: 'concise', headline: 'Concise operator', description: 'Cut to signal only, ideal for triage modes.' },
];

export default function SettingsScreen() {
  const { colors } = useAppTheme();
  const themePreference = useAppStore((state) => state.themePreference);
  const setThemePreference = useAppStore((state) => state.setThemePreference);
  const persona = useAppStore((state) => state.persona);
  const setPersona = useAppStore((state) => state.setPersona);
  const voiceEnabled = useAppStore((state) => state.voiceEnabled);
  const toggleVoice = useAppStore((state) => state.toggleVoice);

  return (
    <Screen
      title="Control Center"
      subtitle="Configure privacy, personas, and multimodal preferences."
      scrollable
    >
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Theme</Text>
        <View style={styles.row}>
          {THEME_OPTIONS.map((option) => {
            const active = option.value === themePreference;
            return (
              <Pressable
                key={option.value}
                onPress={() => setThemePreference(option.value)}
                style={[
                  styles.optionPill,
                  {
                    backgroundColor: active ? colors.accent : 'transparent',
                    borderColor: active ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.optionLabel,
                    { color: active ? colors.background : colors.textPrimary },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Persona style</Text>
          <Text style={[styles.cardSubtext, { color: colors.textMuted }]}>
            Tailor voice, cadence, and automation reasoning.
          </Text>
        </View>
        <View style={styles.personaGrid}>
          {PERSONA_OPTIONS.map((option) => {
            const active = option.value === persona;
            return (
              <Pressable
                key={option.value}
                onPress={() => setPersona(option.value)}
                style={[
                  styles.personaCard,
                  {
                    backgroundColor: active ? colors.surfaceElevated : colors.background,
                    borderColor: active ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text style={[styles.personaHeadline, { color: colors.textPrimary }]}>{option.headline}</Text>
                <Text style={[styles.personaDescription, { color: colors.textSecondary }]}>
                  {option.description}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.voiceRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Real-time Voice</Text>
            <Text style={[styles.cardSubtext, { color: colors.textMuted }]}>
              Toggle streaming ASR/TTS orchestration (Vapi or ElevenLabs).
            </Text>
          </View>
          <Pressable
            onPress={() => toggleVoice()}
            style={[
              styles.voiceToggle,
              {
                backgroundColor: voiceEnabled ? colors.accent : colors.surface,
                borderColor: colors.accent,
              },
            ]}
          >
            <Text
              style={[
                styles.optionLabel,
                { color: voiceEnabled ? colors.background : colors.accent },
              ]}
            >
              {voiceEnabled ? 'Enabled' : 'Disabled'}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>About Martin++</Text>
        <View style={styles.aboutRow}>
          <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Version</Text>
          <Text style={[styles.aboutValue, { color: colors.textPrimary }]}>1.0.0</Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Build</Text>
          <Text style={[styles.aboutValue, { color: colors.textPrimary }]}>MVP Phase 1</Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    gap: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardHeader: {
    gap: 6,
  },
  cardSubtext: {
    fontSize: 12,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  optionPill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  personaGrid: {
    gap: 12,
  },
  personaCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  personaHeadline: {
    fontSize: 15,
    fontWeight: '600',
  },
  personaDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  voiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  voiceToggle: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aboutLabel: {
    fontSize: 14,
  },
  aboutValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});