import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { useDB, actions } from '../../lib/store';
import { useTheme } from '../../lib/theme';
import { uid, num } from '../../lib/utils';
import { Screen, Card, Field, Input, NumInput, Btn, Row, IconBtn, Hint } from '../../components/ui';

export default function Catalogo() {
  const db = useDB();
  const c = useTheme();
  const lista = db.settings.servicosCatalogo || [];
  const upd = (id, k, v) => actions.settings((s) => { s.servicosCatalogo.find((x) => x.id === id)[k] = v; });
  const move = (i, d) => actions.settings((s) => { const a = s.servicosCatalogo; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; });
  return (
    <Screen>
      <Stack.Screen options={{ title: 'Tabela de preços' }} />
      <Hint>Estes serviços aparecem em “Adicionar da tabela de preços” nos orçamentos. O valor pode ser ajustado em cada orçamento.</Hint>
      {lista.map((x, i) => (
        <View key={x.id} style={{ backgroundColor: c.card, borderColor: c.line, borderWidth: 1, borderRadius: 12, padding: 10, gap: 8 }}>
          <Field label="Serviço"><Input value={x.nome} onChangeText={(t) => upd(x.id, 'nome', t)} /></Field>
          <Row style={{ alignItems: 'flex-end' }}>
            <Field label="Valor (R$)"><NumInput value={x.valor} onChange={(v) => upd(x.id, 'valor', v)} onBlur={() => upd(x.id, 'valor', num(x.valor))} /></Field>
            <IconBtn icon="arrow-up" onPress={() => move(i, -1)} />
            <IconBtn icon="arrow-down" onPress={() => move(i, 1)} />
            <IconBtn icon="trash-outline" color={c.danger} onPress={() => actions.settings((s) => { s.servicosCatalogo = s.servicosCatalogo.filter((k) => k.id !== x.id); })} />
          </Row>
        </View>
      ))}
      <Btn variant="primary" icon="add" title="Adicionar serviço" onPress={() => actions.settings((s) => { (s.servicosCatalogo ||= []).push({ id: uid(), nome: '', valor: '' }); })} />
    </Screen>
  );
}
