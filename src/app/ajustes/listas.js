import React from 'react';
import { Stack } from 'expo-router';
import { useDB, actions } from '../../lib/store';
import { Screen, Card, Hint, StringList } from '../../components/ui';

export default function Listas() {
  const db = useDB();
  return (
    <Screen>
      <Stack.Screen options={{ title: 'Tipos de instrumento' }} />
      <Card title="Tipos de instrumento">
        <StringList items={db.settings.tiposInstrumento} onChange={(v) => actions.settings((s) => { s.tiposInstrumento = v; })} placeholder="Ex.: Viola d'amore" />
      </Card>
      <Hint>A lista aparece no campo “Instrumento” dos orçamentos.</Hint>
    </Screen>
  );
}
