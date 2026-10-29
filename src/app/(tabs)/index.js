import React, { useMemo, useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import { router } from 'expo-router';
import { useDB } from '../../lib/store';
import { useTheme } from '../../lib/theme';
import { ORC_STATUS } from '../../lib/status';
import { money, totals, fmtDate, matches } from '../../lib/utils';
import { instrumentoTexto } from '../../lib/pdf';
import { SearchBar, ListItem, Badge, Empty, Fab, Btn, Chips } from '../../components/ui';

export default function Orcamentos() {
  const db = useDB();
  const c = useTheme();
  const [q, setQ] = useState('');
  const [st, setSt] = useState('');
  const cli = (id) => db.clientes.find((x) => x.id === id);
  const lista = useMemo(() => db.orcamentos.filter((o) =>
    (!st || (o.status || 'aberto') === st) &&
    matches(q, o.numero, o.titulo, cli(o.clienteId)?.nome, instrumentoTexto(o.instrumento), o.descricao),
  ), [db, q, st]);
  const totalAprovado = db.orcamentos.filter((o) => o.status === 'aprovado').reduce((s, o) => s + totals(o).total, 0);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ padding: 14, paddingBottom: 8 }}><SearchBar value={q} onChange={setQ} placeholder="Buscar orçamento, cliente, instrumento…" /></View>
      <View style={{ paddingBottom: 8 }}>
        <Chips value={st} onChange={setSt} options={[{ value: '', label: `Todos (${db.orcamentos.length})` }, ...Object.entries(ORC_STATUS).map(([k, v]) => ({ value: k, label: v.nome }))]} />
      </View>
      <FlatList
        data={lista}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={totalAprovado > 0 && !st && !q ? <Text style={{ color: c.muted, paddingHorizontal: 16, paddingBottom: 6, fontSize: 12.5 }}>Total aprovado: <Text style={{ color: c.ok, fontWeight: '700' }}>{money(totalAprovado)}</Text></Text> : null}
        renderItem={({ item: o, index }) => {
          const s = ORC_STATUS[o.status || 'aberto'];
          return (
            <View style={{ backgroundColor: c.card }}>
              <ListItem
                last={index === lista.length - 1}
                onPress={() => router.push(`/orcamento/${o.id}`)}
                title={`${o.numero} · ${cli(o.clienteId)?.nome || 'Sem cliente'}`}
                subtitle={
                  <View style={{ gap: 5 }}>
                    <Text style={{ color: c.muted, fontSize: 13 }} numberOfLines={1}>{o.titulo || instrumentoTexto(o.instrumento) || '—'} · {fmtDate(o.data)}</Text>
                    <Badge color={s.cor}>{s.nome}</Badge>
                  </View>
                }
                right={<Text style={{ color: c.text, fontWeight: '700' }}>{money(totals(o).total)}</Text>}
              />
            </View>
          );
        }}
        ListEmptyComponent={<Empty title={q || st ? 'Nada encontrado' : 'Nenhum orçamento ainda'} text={q || st ? '' : 'Crie o primeiro orçamento tocando no botão abaixo.'} action={!q && !st ? <Btn variant="primary" icon="add" title="Novo orçamento" onPress={() => router.push('/orcamento/novo')} /> : null} />}
      />
      <Fab icon="add" label="Novo" onPress={() => router.push('/orcamento/novo')} />
    </View>
  );
}
