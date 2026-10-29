import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, AppState } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initStore, flush } from '../lib/store';
import { useTheme } from '../lib/theme';

function Root() {
  const c = useTheme();
  return (
    <>
      <StatusBar style={c.dark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: c.card },
          headerTintColor: c.text,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: c.bg },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function Layout() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    initStore().finally(() => setReady(true));
    // grava imediatamente quando o app vai para segundo plano
    const sub = AppState.addEventListener('change', (s) => { if (s !== 'active') flush(); });
    return () => sub.remove();
  }, []);
  if (!ready) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#15110d' }}><ActivityIndicator color="#c0773a" size="large" /></View>;
  }
  return <SafeAreaProvider><Root /></SafeAreaProvider>;
}
