import React, { useMemo, useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import { router } from 'expo-router';
import { useDB } from '../../lib/store';
import { useTheme } from '../../lib/theme';
import { CT_STATUS } from '../../lib/status';
import { fmtDate, matches } from '../../lib/utils';
import { SearchBar, ListItem, Badge, Empty, Fab, Btn, Chips } from '../../components/ui';

export default function Contratos() {
  const db = useDB();
  const c = useTheme();
  const [q, setQ] = useState('');
  const [st, setSt] = useState('');
  const cli = (id) => db.clientes.find((x) => x.id === id);
  const lista = useMemo(() => db.contratos.filter((x) => (!st || (x.status || 'rascunho') === st) && matches(q, x.numero, x.titulo, cli(x.clienteId)?.nome)), [db, q, st]);
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ padding: 14, paddingBottom: 8 }}><SearchBar value={q} onChange={setQ} placeholder="Buscar contrato…" /></View>
      <View style={{ paddingBottom: 8 }}>
        <Chips value={st} onChange={setSt} options={[{ value: '', label: `Todos (${db.contratos.length})` }, ...Object.entries(CT_STATUS).map(([k, v]) => ({ value: k, label: v.nome }))]} />
      </View>
      <FlatList
        data={lista}
        keyExtractor={(x) => x.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item: x, index }) => {
          const s = CT_STATUS[x.status || 'rascunho'];
          const orc = db.orcamentos.find((o) => o.id === x.orcamentoId);
          return (
            <View style={{ backgroundColor: c.card }}>
              <ListItem
                last={index === lista.length - 1}
                onPress={() => router.push(`/contrato/${x.id}`)}
                title={`${x.numero} · ${cli(x.clienteId)?.nome || x.nomeCliente || 'Sem cliente'}`}
                subtitle={
                  <View style={{ gap: 5 }}>
                    <Text style={{ color: c.muted, fontSize: 13 }} numberOfLines={1}>{x.titulo}{orc ? ` · ${orc.numero}` : ''} · {fmtDate(x.criadoEm)}</Text>
                    <Badge color={s.cor}>{s.nome}</Badge>
                  </View>
                }
              />
            </View>
          );
        }}
        ListEmptyComponent={<Empty icon="reader-outline" title={q || st ? 'Nada encontrado' : 'Nenhum contrato ainda'} text="Gere um contrato a partir de um orçamento ou crie um avulso." action={!q && !st ? <Btn variant="primary" icon="add" title="Novo contrato" onPress={() => router.push('/contrato/novo')} /> : null} />}
      />
      <Fab icon="add" label="Novo" onPress={() => router.push('/contrato/novo')} />
    </View>
  );
}
