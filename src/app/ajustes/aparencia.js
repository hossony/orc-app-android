import React from 'react';
import { View, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { useDB, actions } from '../../lib/store';
import { useTheme } from '../../lib/theme';
import { Screen, Card, Field, Input, Segmented, Hint } from '../../components/ui';

const CORES = ['#c0773a', '#a0522d', '#8b6f47', '#b8860b', '#7a3e2e', '#4f9d8c', '#5b8bd0', '#7b5ea7', '#2f6f4f', '#9b2c2c', '#333333'];

export default function Aparencia() {
  const db = useDB();
  const c = useTheme();
  const a = db.settings.aparencia;
  const set = (k, v) => actions.settings((s) => { s.aparencia[k] = v; });
  return (
    <Screen>
      <Stack.Screen options={{ title: 'Aparência' }} />
      <Card title="Tema">
        <Segmented options={[{ value: 'sistema', label: 'Automático' }, { value: 'claro', label: 'Claro' }, { value: 'escuro', label: 'Escuro' }]} value={a.tema} onChange={(v) => set('tema', v)} />
      </Card>
      <Card title="Cor de destaque">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {CORES.map((k) => (
            <Pressable key={k} onPress={() => set('corDestaque', k)} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: k, borderWidth: 3, borderColor: a.corDestaque === k ? c.text : 'transparent' }} />
          ))}
        </View>
        <Field label="Cor personalizada (hex)"><Input value={a.corDestaque} autoCapitalize="none" onChangeText={(t) => /^#[0-9a-fA-F]{0,6}$/.test(t) && set('corDestaque', t)} /></Field>
        <Hint>A cor também é usada nos títulos dos PDFs.</Hint>
      </Card>
    </Screen>
  );
}
