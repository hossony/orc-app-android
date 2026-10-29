import React, { useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { useDB, actions } from '../../lib/store';
import { useTheme } from '../../lib/theme';
import { uid } from '../../lib/utils';
import { PLACEHOLDERS } from '../../lib/defaults';
import { defaultSettings } from '../../lib/defaults';
import { Screen, Card, Field, Input, Btn, Row, Sheet, ListItem, confirm, Hint, toast } from '../../components/ui';

export default function Modelos() {
  const db = useDB();
  const c = useTheme();
  const [editId, setEditId] = useState(null);
  const [vars, setVars] = useState(false);
  const [sel, setSel] = useState({ start: 0, end: 0 });
  const ms = db.settings.modelosContrato;
  const m = ms.find((x) => x.id === editId);
  const upd = (k, v) => actions.settings((s) => { s.modelosContrato.find((x) => x.id === editId)[k] = v; });

  if (m) {
    return (
      <Screen>
        <Stack.Screen options={{ title: m.nome || 'Modelo' }} />
        <Field label="Nome do modelo"><Input value={m.nome} onChangeText={(v) => upd('nome', v)} /></Field>
        <Row>
          <Btn flex icon="arrow-back" title="Voltar à lista" onPress={() => setEditId(null)} />
          <Btn flex icon="code-slash-outline" title="Inserir variável" onPress={() => setVars(true)} />
        </Row>
        <Input multiline value={m.corpo} onChangeText={(v) => upd('corpo', v)} onSelectionChange={(e) => setSel(e.nativeEvent.selection)} style={{ minHeight: 480, fontFamily: 'serif', fontSize: 14, lineHeight: 21 }} />
        <Hint>Variáveis como {'{{cliente.nome}}'} são trocadas pelos dados reais ao gerar o contrato. Revise os modelos com um advogado antes do uso comercial.</Hint>
        <Btn variant="danger" icon="trash-outline" title="Excluir modelo" onPress={async () => {
          if (ms.length <= 1) return toast('Mantenha ao menos um modelo');
          if (await confirm('Excluir modelo?', m.nome, 'Excluir', true)) { const id = m.id; setEditId(null); actions.settings((s) => { s.modelosContrato = s.modelosContrato.filter((x) => x.id !== id); }); }
        }} />
        <Sheet visible={vars} onClose={() => setVars(false)} title="Inserir variável" full>
          <FlatList data={PLACEHOLDERS} keyExtractor={(p) => p[0]} renderItem={({ item: [k, l] }) => (
            <Pressable onPress={() => {
              const tok = `{{${k}}}`; const a = Math.min(sel.start ?? m.corpo.length, m.corpo.length); const b = Math.min(sel.end ?? a, m.corpo.length);
              upd('corpo', m.corpo.slice(0, a) + tok + m.corpo.slice(b)); setVars(false);
            }} style={({ pressed }) => ({ paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 0.5, borderBottomColor: c.line, backgroundColor: pressed ? c.card2 : 'transparent' })}>
              <Text style={{ color: c.text, fontSize: 15 }}>{l}</Text>
              <Text style={{ color: c.muted, fontSize: 12 }}>{`{{${k}}}`}</Text>
            </Pressable>
          )} />
        </Sheet>
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Modelos de contrato' }} />
      <Card>
        {ms.map((x, i) => <ListItem key={x.id} last={i === ms.length - 1} onPress={() => setEditId(x.id)} title={x.nome} subtitle={x.corpo.split('\n')[0]} />)}
      </Card>
      <Btn variant="primary" icon="add" title="Novo modelo" onPress={() => {
        const id = uid();
        actions.settings((s) => { s.modelosContrato.push({ id, nome: 'Novo modelo', corpo: 'TÍTULO DO CONTRATO\n\nCONTRATADO: {{empresa.nome}}, {{empresa.documento}}, {{empresa.endereco}}.\nCONTRATANTE: {{cliente.nome}}, CPF/CNPJ {{cliente.documento}}, {{cliente.endereco}}.\n\nCLÁUSULA 1ª — DO OBJETO\n{{ordem.descricao}}\n\nCLÁUSULA 2ª — DO PREÇO\nValor total de {{ordem.total}} ({{ordem.totalExtenso}}).\n\n{{empresa.cidade}}, {{data.extenso}}.' }); });
        setEditId(id);
      }} />
      <Btn icon="refresh" title="Restaurar modelos originais" onPress={async () => {
        if (!(await confirm('Restaurar modelos?', 'Os modelos originais (construção, restauração, consignação) serão adicionados de volta. Seus modelos não são apagados.', 'Restaurar'))) return;
        const orig = defaultSettings().modelosContrato;
        actions.settings((s) => { orig.forEach((o) => { const i = s.modelosContrato.findIndex((x) => x.id === o.id); if (i >= 0) s.modelosContrato[i] = o; else s.modelosContrato.push(o); }); });
        toast('Modelos restaurados');
      }} />
    </Screen>
  );
}
