import React, { useState } from 'react';
import { Linking } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useDB, actions } from '../../lib/store';
import { money, totals, fmtDate } from '../../lib/utils';
import { ORC_STATUS } from '../../lib/status';
import { Screen, Card, Field, Input, Btn, Row, Segmented, ListItem, Badge, toast, confirm, Hint } from '../../components/ui';
import { CustomFields } from '../../components/biz';

export default function ClienteEditor() {
  const { id } = useLocalSearchParams();
  const db = useDB();
  const stored = id !== 'novo' && db.clientes.find((x) => x.id === id);
  const [c, setC] = useState(() => stored ? JSON.parse(JSON.stringify(stored)) : {
    nome: '', tipo: 'PF', documento: '', rg: '', whatsapp: '', telefone: '', email: '',
    cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', observacoes: '', campos: {},
  });
  const set = (k, v) => setC((p) => ({ ...p, [k]: v }));
  const campos = db.settings.camposPersonalizados.filter((f) => f.aplicaEm === 'cliente');
  const orcs = stored ? db.orcamentos.filter((o) => o.clienteId === stored.id) : [];
  const cts = stored ? db.contratos.filter((o) => o.clienteId === stored.id) : [];

  const salvar = () => {
    if (!c.nome.trim()) return toast('Informe o nome');
    actions.saveCliente({ ...c, nome: c.nome.trim() });
    toast('Cliente salvo');
    router.back();
  };

  const buscarCep = async () => {
    const cep = c.cep.replace(/\D/g, '');
    if (cep.length !== 8) return toast('CEP deve ter 8 dígitos');
    try {
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`).then((x) => x.json());
      if (r.erro) return toast('CEP não encontrado');
      setC((p) => ({ ...p, logradouro: r.logradouro || p.logradouro, bairro: r.bairro || p.bairro, cidade: r.localidade || p.cidade, uf: r.uf || p.uf }));
    } catch { toast('Sem internet para buscar o CEP'); }
  };

  const wa = String(c.whatsapp || c.telefone || '').replace(/\D/g, '');

  return (
    <Screen footer={<Btn flex variant="primary" icon="checkmark" title="Salvar cliente" onPress={salvar} />}>
      <Stack.Screen options={{ title: stored ? stored.nome : 'Novo cliente' }} />
      <Card title="Identificação">
        <Field label="Nome completo / razão social"><Input value={c.nome} onChangeText={(t) => set('nome', t)} autoFocus={!stored} /></Field>
        <Segmented options={[{ value: 'PF', label: 'Pessoa física' }, { value: 'PJ', label: 'Pessoa jurídica' }]} value={c.tipo} onChange={(v) => set('tipo', v)} />
        <Row>
          <Field label={c.tipo === 'PJ' ? 'CNPJ' : 'CPF'}><Input value={c.documento} keyboardType="numeric" onChangeText={(t) => set('documento', t)} /></Field>
          <Field label={c.tipo === 'PJ' ? 'Insc. estadual' : 'RG'}><Input value={c.rg} onChangeText={(t) => set('rg', t)} /></Field>
        </Row>
      </Card>
      <Card title="Contato">
        <Row>
          <Field label="WhatsApp"><Input value={c.whatsapp} keyboardType="phone-pad" placeholder="(14) 99999-9999" onChangeText={(t) => set('whatsapp', t)} /></Field>
          <Field label="Telefone"><Input value={c.telefone} keyboardType="phone-pad" onChangeText={(t) => set('telefone', t)} /></Field>
        </Row>
        <Field label="E-mail"><Input value={c.email} keyboardType="email-address" autoCapitalize="none" onChangeText={(t) => set('email', t)} /></Field>
        {wa ? <Btn variant="whatsapp" icon="logo-whatsapp" title="Abrir conversa" onPress={() => Linking.openURL(`https://wa.me/${wa.length <= 11 ? '55' + wa : wa}`)} /> : null}
      </Card>
      <Card title="Endereço">
        <Row style={{ alignItems: 'flex-end' }}>
          <Field label="CEP"><Input value={c.cep} keyboardType="numeric" onChangeText={(t) => set('cep', t)} /></Field>
          <Btn icon="search" title="Buscar" onPress={buscarCep} />
        </Row>
        <Row>
          <Field label="Rua" style={{ flex: 2.4 }}><Input value={c.logradouro} onChangeText={(t) => set('logradouro', t)} /></Field>
          <Field label="Nº"><Input value={c.numero} onChangeText={(t) => set('numero', t)} /></Field>
        </Row>
        <Row>
          <Field label="Complemento"><Input value={c.complemento} onChangeText={(t) => set('complemento', t)} /></Field>
          <Field label="Bairro"><Input value={c.bairro} onChangeText={(t) => set('bairro', t)} /></Field>
        </Row>
        <Row>
          <Field label="Cidade" style={{ flex: 2.4 }}><Input value={c.cidade} onChangeText={(t) => set('cidade', t)} /></Field>
          <Field label="UF"><Input value={c.uf} maxLength={2} autoCapitalize="characters" onChangeText={(t) => set('uf', t.toUpperCase())} /></Field>
        </Row>
        <Hint>A busca por CEP precisa de internet; o resto do app funciona offline.</Hint>
      </Card>
      {campos.length > 0 && <Card title="Informações adicionais"><CustomFields campos={campos} values={c.campos || {}} onChange={(v) => set('campos', v)} /></Card>}
      <Card title="Observações"><Input multiline value={c.observacoes} onChangeText={(t) => set('observacoes', t)} /></Card>

      {stored && (
        <Card title={`Orçamentos (${orcs.length})`} right={<Btn small icon="add" title="Novo" onPress={() => router.push({ pathname: '/orcamento/novo', params: { clienteId: stored.id } })} />}>
          {orcs.map((o, i) => (
            <ListItem key={o.id} last={i === orcs.length - 1} onPress={() => router.push(`/orcamento/${o.id}`)} title={`${o.numero} · ${money(totals(o).total)}`}
              subtitle={`${o.titulo || '—'} · ${fmtDate(o.data)}`} right={<Badge color={ORC_STATUS[o.status || 'aberto'].cor}>{ORC_STATUS[o.status || 'aberto'].nome}</Badge>} />
          ))}
          {cts.map((x) => <ListItem key={x.id} onPress={() => router.push(`/contrato/${x.id}`)} title={`${x.numero} · contrato`} subtitle={x.titulo} />)}
        </Card>
      )}
      {stored && (
        <Btn variant="danger" icon="trash-outline" title="Excluir cliente" onPress={async () => {
          if (orcs.length || cts.length) return toast('Cliente possui orçamentos ou contratos e não pode ser excluído');
          if (await confirm('Excluir cliente?', stored.nome, 'Excluir', true)) { actions.deleteCliente(stored.id); router.back(); }
        }} />
      )}
    </Screen>
  );
}
