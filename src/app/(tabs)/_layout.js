import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme';

export default function TabsLayout() {
  const c = useTheme();
  const icon = (name) => ({ color, size }) => <Ionicons name={name} color={color} size={size} />;
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: c.card },
        headerTintColor: c.text,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: { backgroundColor: c.card, borderTopColor: c.line },
        sceneStyle: { backgroundColor: c.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Orçamentos', tabBarIcon: icon('document-text-outline') }} />
      <Tabs.Screen name="contratos" options={{ title: 'Contratos', tabBarIcon: icon('reader-outline') }} />
      <Tabs.Screen name="clientes" options={{ title: 'Clientes', tabBarIcon: icon('people-outline') }} />
      <Tabs.Screen name="ajustes" options={{ title: 'Ajustes', tabBarIcon: icon('settings-outline') }} />
    </Tabs>
  );
}
