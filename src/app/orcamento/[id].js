import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useDB, actions, getState } from '../../lib/store';
import { useTheme } from '../../lib/theme';
import { ORC_STATUS } from '../../lib/status';
import { today, addDays, fmtDate } from '../../lib/utils';
import { exportPdf, sharePdf, sendWhatsApp } from '../../lib/pdf';
import { Screen, Card, Field, Input, NumInput, Btn, Select, Row, DateField, toast, confirm, Hint, Segmented } from '../../components/ui';
import { ClienteSelect, ItemsEditor, DescontoFields, TotalsView, CustomFields, SignatureField, DocActions } from '../../components/biz';

function novoOrcamento(db, preset = {}) {
  const tipo = db.settings.tiposServico[0];
  return {
    data: today(), status: 'aberto', clienteId: '', tipoServicoId: tipo?.id || '', titulo: '',
    instrumento: { tipo: '', modelo: '', marca: '', numeroSerie: '' }, descricao: '', especificacoes: {},
    itens: [], desconto: '', descontoTipo: 'R$', acrescimo: '',
    validadeDias: db.settings.textos.validadeOrcamentoDias, prazoDias: tipo?.prazoPadraoDias || '', sinalPercentual: tipo?.sinalPercentual || '',
    condicoesPagamento: db.settings.textos.condicoesPagamento, observacoes: '', assinaturaCliente: '',
    ...preset,
  };
}

export default function OrcamentoEditor() {
  const params = useLocalSearchParams();
  const db = useDB();
  const c = useTheme();
  const isNew = params.id === 'novo';
  const stored = !isNew && db.orcamentos.find((x) => x.id === params.id);
  const [o, setO] = useState(() => {
    if (stored) return JSON.parse(JSON.stringify(stored));
    let preset = {};
    if (params.copiar) {
      const src = db.orcamentos.find((x) => x.id === params.copiar);
      if (src) preset = { ...JSON.parse(JSON.stringify(src)), id: undefined, numero: undefined, status: 'aberto', data: today(), assinaturaCliente: '', dataAprovacao: '', criadoEm: undefined };
    }
    if (params.clienteId) preset.clienteId = params.clienteId;
    return novoOrcamento(db, preset);
  });
  const savedId = useRef(stored ? stored.id : null);
  const [numero, setNumero] = useState(stored?.numero || '');
  const [busy, setBusy] = useState(false);
  const dirty = useRef(false);
  const timer = useRef(null);

  const save = (doc = o) => {
    if (!doc.clienteId) return null;
    const r = actions.saveOrcamento({ ...doc, id: savedId.current || undefined });
    savedId.current = r.id; setNumero(r.numero); dirty.current = false;
    return r.id;
  };

  // salvamento automático
  useEffect(() => {
    if (!dirty.current) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => save(o), 500);
    return () => clearTimeout(timer.current);
  }, [o]);
  const oRef = useRef(o); oRef.current = o;
  useEffect(() => () => { if (dirty.current) save(oRef.current); }, []);

  const patch = (p) => { dirty.current = true; setO((prev) => ({ ...prev, ...(typeof p === 'function' ? p(prev) : p) })); };
  const set = (k, v) => patch({ [k]: v });
  const setIns = (k, v) => patch((p) => ({ instrumento: { ...p.instrumento, [k]: v } }));

  const ensure = () => {
    if (!o.clienteId) { toast('Selecione o cliente primeiro'); return null; }
    const id = save(o);
    return getState().orcamentos.find((x) => x.id === id);
  };

  const run = async (fn) => {
    const doc = ensure(); if (!doc) return;
    setBusy(true);
    try { await fn(doc); } catch (e) { toast('Erro: ' + (e?.message || e)); } finally { setBusy(false); }
  };

  const tipo = db.settings.tiposServico.find((t) => t.id === o.tipoServicoId);
  const campos = db.settings.camposPersonalizados.filter((f) => f.aplicaEm === 'orcamento' && (!f.tiposServico?.length || f.tiposServico.includes(o.tipoServicoId)));
  const contratos = db.contratos.filter((x) => savedId.current && x.orcamentoId === savedId.current);
  const tipoOpts = useMemo(() => db.settings.tiposServico.map((t) => ({ value: t.id, label: t.nome })), [db.settings.tiposServico]);
  const insOpts = useMemo(() => db.settings.tiposInstrumento.map((t) => ({ value: t, label: t })), [db.settings.tiposInstrumento]);

  return (
    <Screen footer={
      <DocActions busy={busy}
        onPreview={() => { const d = ensure(); if (d) router.push({ pathname: '/preview', params: { kind: 'orcamento', id: d.id } }); }}
        onPdf={() => run(async (d) => sharePdf(await exportPdf(getState(), 'orcamento', d)))}
        onWhatsApp={() => run(async (d) => {
          await sendWhatsApp(getState(), 'orcamento', d);
          if ((d.status || 'aberto') === 'aberto') { actions.saveOrcamento({ ...d, status: 'enviado' }); setO((p) => ({ ...p, status: 'enviado' })); }
        })}
      />
    }>
      <Stack.Screen options={{ title: numero || 'Novo orçamento' }} />

      <Card title="Cliente">
        <ClienteSelect value={o.clienteId} onChange={(v) => set('clienteId', v)} />
        <Row>
          <Field label="Data"><DateField value={o.data} onChange={(v) => set('data', v)} /></Field>
          <Field label="Situação">
            <Select value={o.status || 'aberto'} options={Object.entries(ORC_STATUS).map(([k, v]) => ({ value: k, label: v.nome }))} onChange={(v) => patch({ status: v, dataAprovacao: v === 'aprovado' ? (o.dataAprovacao || today()) : o.dataAprovacao })} title="Situação" />
          </Field>
        </Row>
        {!o.clienteId && <Hint>O orçamento é salvo automaticamente assim que o cliente for escolhido.</Hint>}
      </Card>

      <Card title="Serviço e instrumento">
        <Field label="Tipo de serviço">
          <Select value={o.tipoServicoId} options={tipoOpts} title="Tipo de serviço" onChange={(v) => {
            const t = db.settings.tiposServico.find((x) => x.id === v);
            patch({ tipoServicoId: v, prazoDias: t?.prazoPadraoDias || o.prazoDias, sinalPercentual: t?.sinalPercentual ?? o.sinalPercentual });
          }} />
        </Field>
        <Row>
          <Field label="Instrumento"><Select value={o.instrumento.tipo} options={insOpts} allowClear title="Instrumento" onChange={(v) => setIns('tipo', v)} /></Field>
          <Field label="Modelo"><Input value={o.instrumento.modelo} onChangeText={(t) => setIns('modelo', t)} /></Field>
        </Row>
        <Row>
          <Field label="Marca / origem"><Input value={o.instrumento.marca} onChangeText={(t) => setIns('marca', t)} /></Field>
          <Field label="Nº de série"><Input value={o.instrumento.numeroSerie} onChangeText={(t) => setIns('numeroSerie', t)} /></Field>
        </Row>
        <Field label="Título"><Input value={o.titulo} placeholder={tipo?.id === 'encomenda' ? 'Ex.: Violino 4/4 modelo Stradivari' : 'Ex.: Ajuste de alma e cavalete'} onChangeText={(t) => set('titulo', t)} /></Field>
        <Field label="Descrição do trabalho"><Input multiline value={o.descricao} onChangeText={(t) => set('descricao', t)} /></Field>
      </Card>

      {campos.length > 0 && (
        <Card title="Especificações">
          <CustomFields campos={campos} values={o.especificacoes} onChange={(v) => set('especificacoes', v)} />
        </Card>
      )}

      <Card title="Itens e valores">
        <ItemsEditor itens={o.itens} onChange={(v) => set('itens', v)} />
        <DescontoFields doc={o} onChange={patch} />
        <TotalsView doc={o} />
      </Card>

      <Card title="Condições">
        <Row>
          <Field label="Validade (dias)" hint={o.validadeDias ? `até ${fmtDate(addDays(o.data, o.validadeDias))}` : ''}><NumInput value={o.validadeDias} onChange={(v) => set('validadeDias', v)} /></Field>
          <Field label="Prazo (dias)"><NumInput value={o.prazoDias} onChange={(v) => set('prazoDias', v)} /></Field>
          <Field label="Sinal (%)"><NumInput value={o.sinalPercentual} onChange={(v) => set('sinalPercentual', v)} /></Field>
        </Row>
        <Field label="Condições de pagamento"><Input multiline value={o.condicoesPagamento} onChangeText={(t) => set('condicoesPagamento', t)} /></Field>
        <Field label="Observações"><Input multiline value={o.observacoes} placeholder={db.settings.textos.observacaoOrcamento} onChangeText={(t) => set('observacoes', t)} /></Field>
      </Card>

      <Card title="Aceite do cliente">
        <SignatureField value={o.assinaturaCliente} signer={db.clientes.find((x) => x.id === o.clienteId)?.nome}
          onChange={(v) => patch({ assinaturaCliente: v, ...(v ? { status: 'aprovado', dataAprovacao: o.dataAprovacao || today() } : {}) })} />
        <Hint>Ao assinar, o orçamento é marcado como aprovado e a assinatura aparece no PDF.</Hint>
      </Card>

      <Card title="Mais ações">
        <Btn icon="reader-outline" title={contratos.length ? `Gerar novo contrato (${contratos.length} existente${contratos.length > 1 ? 's' : ''})` : 'Gerar contrato deste orçamento'} onPress={() => {
          const d = ensure(); if (d) router.push({ pathname: '/contrato/novo', params: { orcamentoId: d.id } });
        }} />
        {contratos.map((x) => <Btn key={x.id} variant="ghost" icon="document-outline" title={`Abrir ${x.numero}`} onPress={() => router.push(`/contrato/${x.id}`)} />)}
        <Btn icon="copy-outline" title="Duplicar orçamento" onPress={() => { const d = ensure(); if (d) router.push({ pathname: '/orcamento/novo', params: { copiar: d.id } }); }} />
        <Btn variant="danger" icon="trash-outline" title="Excluir orçamento" onPress={async () => {
          if (!savedId.current) return router.back();
          if (await confirm('Excluir orçamento?', 'Essa ação não pode ser desfeita.', 'Excluir', true)) {
            dirty.current = false; clearTimeout(timer.current); actions.deleteOrcamento(savedId.current); router.back();
          }
        }} />
      </Card>
      <Text style={{ color: c.muted, textAlign: 'center', fontSize: 12 }}>{savedId.current ? 'Salvo automaticamente' : 'Ainda não salvo'}</Text>
    </Screen>
  );
}
