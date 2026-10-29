import React from 'react';
import { Text } from 'react-native';
import { Stack } from 'expo-router';
import { useDB, actions } from '../../lib/store';
import { useTheme } from '../../lib/theme';
import { num } from '../../lib/utils';
import { Screen, Card, Field, Input, NumInput, Row, Hint } from '../../components/ui';

export default function Textos() {
  const db = useDB();
  const c = useTheme();
  const t = db.settings.textos;
  const setT = (k, v) => actions.settings((s) => { s.textos[k] = v; });
  const T = (k, label, multiline = true) => <Field key={k} label={label}><Input multiline={multiline} value={String(t[k] ?? '')} onChangeText={(v) => setT(k, v)} /></Field>;
  return (
    <Screen>
      <Stack.Screen options={{ title: 'Textos e numeração' }} />
      <Card title="Textos padrão">
        {T('condicoesPagamento', 'Condições de pagamento')}
        {T('observacaoOrcamento', 'Observação do orçamento')}
        {T('garantia', 'Texto de garantia')}
        {T('rodape', 'Rodapé do PDF', false)}
        <Field label="Validade padrão do orçamento (dias)"><NumInput value={t.validadeOrcamentoDias} onChange={(v) => setT('validadeOrcamentoDias', num(v))} /></Field>
      </Card>
      {[['orcamento', 'Orçamentos'], ['contrato', 'Contratos']].map(([k, label]) => {
        const n = db.settings.numeracao[k];
        const atual = db.counters[k] || 0;
        return (
          <Card key={k} title={`Numeração — ${label}`}>
            <Row>
              <Field label="Prefixo"><Input value={n.prefixo} autoCapitalize="characters" onChangeText={(v) => actions.settings((s) => { s.numeracao[k].prefixo = v; })} /></Field>
              <Field label="Dígitos"><NumInput value={n.digitos} onChange={(v) => actions.settings((s) => { s.numeracao[k].digitos = Math.min(10, Math.max(1, num(v) || 1)); })} /></Field>
              <Field label="Último usado"><NumInput value={atual} onChange={(v) => actions.setCounter(k, v)} /></Field>
            </Row>
            <Text style={{ color: c.muted }}>Próximo: <Text style={{ color: c.text, fontWeight: '700' }}>{n.prefixo}{String(atual + 1).padStart(num(n.digitos) || 1, '0')}</Text></Text>
          </Card>
        );
      })}
      <Hint>Para continuar a numeração de um talão de papel, informe o último número usado.</Hint>
    </Screen>
  );
}
