import { Tabs } from 'expo-router';
import type { LucideIcon } from 'lucide-react-native';
import {
  Calendar,
  CheckSquare,
  Inbox,
  MessageCircle,
  Settings,
  Sparkles,
} from 'lucide-react-native';
import { View } from 'react-native';

import { useAppTheme } from '@/theme';

type TabConfig = {
  name: string;
  title: string;
  icon: LucideIcon;
};

const TAB_CONFIG: TabConfig[] = [
  { name: 'index', title: 'Home', icon: Sparkles },
  { name: 'inbox', title: 'Inbox', icon: Inbox },
  { name: 'tasks', title: 'Tasks', icon: CheckSquare },
  { name: 'calendar', title: 'Calendar', icon: Calendar },
  { name: 'chat', title: 'Chat', icon: MessageCircle },
  { name: 'settings', title: 'Settings', icon: Settings },
];

export default function TabsLayout() {
  const { colors } = useAppTheme();

  return (
    <Tabs
      screenOptions={({ route }) => {
        const config = TAB_CONFIG.find((item) => item.name === route.name);
        return {
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            height: 72,
            paddingBottom: 14,
            paddingTop: 10,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          tabBarIcon: ({ focused, color, size }) => {
            if (!config) return null;
            const Icon = config.icon;
            return (
              <View
                style={{
                  borderRadius: 16,
                  padding: 8,
                  backgroundColor: focused ? colors.surfaceElevated : 'transparent',
                }}
              >
                <Icon color={color} size={size} strokeWidth={focused ? 2.6 : 2} />
              </View>
            );
          },
        };
      }}
    >
      {TAB_CONFIG.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.title }} />
      ))}
    </Tabs>
  );
}