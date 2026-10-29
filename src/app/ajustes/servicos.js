import React, { useState } from 'react';
import { View, Pressable, Text } from 'react-native';
import { Stack } from 'expo-router';
import { useDB, actions } from '../../lib/store';
import { useTheme } from '../../lib/theme';
import { uid } from '../../lib/utils';
import { Screen, Card, Field, Input, NumInput, Btn, Row, Select, Sheet, ListItem, toast, confirm, Hint } from '../../components/ui';

const CORES = ['#c0773a', '#4f9d8c', '#5b8bd0', '#a46ac4', '#d0a83b', '#8a8a8a', '#c4566a', '#3c7a4b'];

export default function Servicos() {
  const db = useDB();
  const c = useTheme();
  const [editId, setEditId] = useState(null);
  const tipos = db.settings.tiposServico;
  const t = tipos.find((x) => x.id === editId);
  const upd = (k, v) => actions.settings((s) => { s.tiposServico.find((x) => x.id === editId)[k] = v; });
  const move = (i, d) => actions.settings((s) => { const a = s.tiposServico; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; });

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Tipos de serviço' }} />
      <Card>
        {tipos.map((x, i) => (
          <ListItem key={x.id} last={i === tipos.length - 1} onPress={() => setEditId(x.id)} title={x.nome}
            subtitle={`Prazo ${x.prazoPadraoDias || 0}d · sinal ${x.sinalPercentual || 0}% · garantia ${x.garantiaDias || 0}d`}
            left={<View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: x.cor }} />} />
        ))}
      </Card>
      <Btn variant="primary" icon="add" title="Novo tipo de serviço" onPress={() => {
        const id = uid();
        actions.settings((s) => { s.tiposServico.push({ id, nome: 'Novo serviço', cor: '#888888', garantiaDias: 30, prazoPadraoDias: 7, sinalPercentual: 0, contratoModeloId: '' }); });
        setEditId(id);
      }} />

      <Sheet visible={!!t} onClose={() => setEditId(null)} title={t?.nome || ''} full>
        {t && (
          <View style={{ padding: 16, gap: 12 }}>
            <Field label="Nome"><Input value={t.nome} onChangeText={(v) => upd('nome', v)} /></Field>
            <Row>
              <Field label="Prazo padrão (dias)"><NumInput value={t.prazoPadraoDias} onChange={(v) => upd('prazoPadraoDias', v)} /></Field>
              <Field label="Sinal (%)"><NumInput value={t.sinalPercentual} onChange={(v) => upd('sinalPercentual', v)} /></Field>
              <Field label="Garantia (dias)"><NumInput value={t.garantiaDias} onChange={(v) => upd('garantiaDias', v)} /></Field>
            </Row>
            <Field label="Modelo de contrato padrão">
              <Select value={t.contratoModeloId} allowClear options={db.settings.modelosContrato.map((m) => ({ value: m.id, label: m.nome }))} onChange={(v) => upd('contratoModeloId', v)} title="Modelo de contrato" />
            </Field>
            <Field label="Cor">
              <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                {CORES.map((k) => <Pressable key={k} onPress={() => upd('cor', k)} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: k, borderWidth: 3, borderColor: t.cor === k ? c.text : 'transparent' }} />)}
              </View>
            </Field>
            <Row>
              <Btn flex icon="arrow-up" title="Subir" onPress={() => move(tipos.indexOf(t), -1)} />
              <Btn flex icon="arrow-down" title="Descer" onPress={() => move(tipos.indexOf(t), 1)} />
            </Row>
            <Btn variant="danger" icon="trash-outline" title="Remover tipo" onPress={async () => {
              if (db.orcamentos.some((o) => o.tipoServicoId === t.id)) return toast('Há orçamentos usando este tipo');
              if (tipos.length <= 1) return toast('Mantenha ao menos um tipo');
              if (await confirm('Remover tipo?', t.nome, 'Remover', true)) { const id = t.id; setEditId(null); actions.settings((s) => { s.tiposServico = s.tiposServico.filter((x) => x.id !== id); }); }
            }} />
            <Hint>As alterações são salvas automaticamente.</Hint>
          </View>
        )}
      </Sheet>
    </Screen>
  );
}
