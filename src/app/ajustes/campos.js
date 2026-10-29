import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { useDB, actions } from '../../lib/store';
import { useTheme } from '../../lib/theme';
import { uid } from '../../lib/utils';
import { Screen, Card, Field, Input, Btn, Row, Select, Sheet, ListItem, SwitchRow, Segmented, confirm, Hint, Label, StringList } from '../../components/ui';

const TIPOS = [
  { value: 'text', label: 'Texto curto' }, { value: 'textarea', label: 'Texto longo' }, { value: 'number', label: 'Número' },
  { value: 'select', label: 'Lista de opções' }, { value: 'checkbox', label: 'Sim / Não' },
];

export default function Campos() {
  const db = useDB();
  const c = useTheme();
  const [aba, setAba] = useState('orcamento');
  const [editId, setEditId] = useState(null);
  const campos = db.settings.camposPersonalizados;
  const lista = campos.filter((f) => f.aplicaEm === aba);
  const f = campos.find((x) => x.id === editId);
  const upd = (k, v) => actions.settings((s) => { s.camposPersonalizados.find((x) => x.id === editId)[k] = v; });
  const move = (d) => actions.settings((s) => {
    const a = s.camposPersonalizados; const i = a.findIndex((x) => x.id === editId);
    let j = i + d; while (j >= 0 && j < a.length && a[j].aplicaEm !== a[i].aplicaEm) j += d;
    if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]];
  });
  const tiposServ = db.settings.tiposServico;

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Campos personalizados' }} />
      <Segmented options={[{ value: 'orcamento', label: 'Orçamentos' }, { value: 'cliente', label: 'Clientes' }]} value={aba} onChange={setAba} />
      <Hint>{aba === 'orcamento' ? 'Especificações do instrumento (madeiras, verniz, voluta…). Podem aparecer só em certos tipos de serviço e ir para o PDF.' : 'Informações extras no cadastro do cliente.'}</Hint>
      <Card>
        {lista.map((x, i) => (
          <ListItem key={x.id} last={i === lista.length - 1} onPress={() => setEditId(x.id)} title={x.label}
            subtitle={`${TIPOS.find((t) => t.value === x.tipo)?.label}${aba === 'orcamento' ? ` · ${x.tiposServico?.length ? x.tiposServico.map((id) => tiposServ.find((t) => t.id === id)?.nome).filter(Boolean).join(', ') : 'todos os serviços'}` : ''}`} />
        ))}
        {!lista.length && <Hint>Nenhum campo.</Hint>}
      </Card>
      <Btn variant="primary" icon="add" title="Novo campo" onPress={() => {
        const id = uid();
        actions.settings((s) => { s.camposPersonalizados.push({ id, label: 'Novo campo', tipo: 'text', opcoes: [], aplicaEm: aba, tiposServico: [], imprimir: true }); });
        setEditId(id);
      }} />

      <Sheet visible={!!f} onClose={() => setEditId(null)} title={f?.label || ''} full>
        {f && (
          <View style={{ padding: 16, gap: 12 }}>
            <Field label="Nome do campo"><Input value={f.label} onChangeText={(v) => upd('label', v)} /></Field>
            <Field label="Tipo"><Select value={f.tipo} options={TIPOS} onChange={(v) => upd('tipo', v)} title="Tipo do campo" /></Field>
            {f.tipo === 'select' && <><Label>Opções</Label><StringList items={f.opcoes || []} onChange={(v) => upd('opcoes', v)} placeholder="Nova opção" /></>}
            {f.aplicaEm === 'orcamento' && <>
              <SwitchRow label="Mostrar no PDF" value={f.imprimir !== false} onChange={(v) => upd('imprimir', v)} />
              <Label>Aparece nos serviços</Label>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {tiposServ.map((t) => {
                  const on = !f.tiposServico?.length || f.tiposServico.includes(t.id);
                  return (
                    <Pressable key={t.id} onPress={() => {
                      const all = tiposServ.map((x) => x.id);
                      let cur = f.tiposServico?.length ? [...f.tiposServico] : [...all];
                      cur = on ? cur.filter((x) => x !== t.id) : [...cur, t.id];
                      upd('tiposServico', cur.length === all.length || !cur.length ? [] : cur);
                    }} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 99, borderWidth: 1, borderColor: on ? c.accent : c.line, backgroundColor: on ? c.accent + '22' : 'transparent' }}>
                      <Text style={{ color: on ? c.accent : c.muted, fontWeight: '600' }}>{t.nome}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </>}
            <Row>
              <Btn flex icon="arrow-up" title="Subir" onPress={() => move(-1)} />
              <Btn flex icon="arrow-down" title="Descer" onPress={() => move(1)} />
            </Row>
            <Btn variant="danger" icon="trash-outline" title="Remover campo" onPress={async () => {
              if (await confirm('Remover campo?', f.label, 'Remover', true)) { const id = f.id; setEditId(null); actions.settings((s) => { s.camposPersonalizados = s.camposPersonalizados.filter((x) => x.id !== id); }); }
            }} />
          </View>
        )}
      </Sheet>
    </Screen>
  );
}
