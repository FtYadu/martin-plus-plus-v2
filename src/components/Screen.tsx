import type { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/theme';

type ScreenProps = {
  title: string;
  subtitle?: string;
  headerSlot?: ReactNode;
  children?: ReactNode;
  scrollable?: boolean;
};

export const Screen = ({ title, subtitle, headerSlot, children, scrollable = true }: ScreenProps) => {
  const { colors, scheme } = useAppTheme();

  const Container = scrollable ? ScrollView : View;

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <View style={[styles.header, { borderColor: colors.border }]}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text> : null}
        </View>
        {headerSlot}
      </View>
      <Container
        contentContainerStyle={scrollable ? [styles.contentContainer, { paddingBottom: 32 }] : undefined}
        style={scrollable ? undefined : [styles.content, { backgroundColor: colors.background }]}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    opacity: 0.8,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 18,
    gap: 18,
  },
  content: {
    flex: 1,
  },
});