import React, { useMemo, useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import { router } from 'expo-router';
import { useDB } from '../../lib/store';
import { useTheme } from '../../lib/theme';
import { matches, maskPhone } from '../../lib/utils';
import { SearchBar, ListItem, Empty, Fab, Btn, Icon } from '../../components/ui';

export default function Clientes() {
  const db = useDB();
  const c = useTheme();
  const [q, setQ] = useState('');
  const lista = useMemo(() => [...db.clientes].sort((a, b) => a.nome.localeCompare(b.nome))
    .filter((x) => matches(q, x.nome, x.documento, x.whatsapp, x.telefone, x.email, x.cidade)), [db.clientes, q]);
  const count = (id) => db.orcamentos.filter((o) => o.clienteId === id).length;
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ padding: 14, paddingBottom: 8 }}><SearchBar value={q} onChange={setQ} placeholder="Buscar cliente…" /></View>
      <FlatList
        data={lista}
        keyExtractor={(x) => x.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item: x, index }) => (
          <View style={{ backgroundColor: c.card }}>
            <ListItem
              last={index === lista.length - 1}
              onPress={() => router.push(`/cliente/${x.id}`)}
              left={<View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.accent + '30', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: c.accent, fontWeight: '800', fontSize: 16 }}>{x.nome.slice(0, 1).toUpperCase()}</Text></View>}
              title={x.nome}
              subtitle={[maskPhone(x.whatsapp || x.telefone), [x.cidade, x.uf].filter(Boolean).join('/')].filter(Boolean).join(' · ') || ' '}
              right={count(x.id) ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}><Icon name="document-text-outline" size={14} color={c.muted} /><Text style={{ color: c.muted }}>{count(x.id)}</Text></View> : null}
            />
          </View>
        )}
        ListEmptyComponent={<Empty icon="people-outline" title={q ? 'Nada encontrado' : 'Nenhum cliente'} action={!q ? <Btn variant="primary" icon="person-add-outline" title="Cadastrar cliente" onPress={() => router.push('/cliente/novo')} /> : null} />}
      />
      <Fab icon="person-add" onPress={() => router.push('/cliente/novo')} />
    </View>
  );
}
