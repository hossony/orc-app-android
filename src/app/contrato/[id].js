import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, FlatList } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useDB, actions, getState } from '../../lib/store';
import { useTheme } from '../../lib/theme';
import { CT_STATUS } from '../../lib/status';
import { fillTemplate, fmtDateTime } from '../../lib/utils';
import { PLACEHOLDERS } from '../../lib/defaults';
import { buildContext, exportPdf, sharePdf, sendWhatsApp } from '../../lib/pdf';
import { Screen, Card, Field, Input, Btn, Select, Row, Sheet, toast, confirm, Hint, Label } from '../../components/ui';
import { ClienteSelect, SignatureField, SignatureModal, DocActions } from '../../components/biz';

const NUM = '[[NUMERO]]';

function gerarCorpo(db, modeloId, orcamentoId, clienteId, numero) {
  const modelo = db.settings.modelosContrato.find((m) => m.id === modeloId);
  if (!modelo) return '';
  const orcamento = db.orcamentos.find((x) => x.id === orcamentoId);
  const cliente = db.clientes.find((x) => x.id === (clienteId || orcamento?.clienteId));
  return fillTemplate(modelo.corpo, { ...buildContext(db, { orcamento, cliente }), contrato: { numero: numero || NUM } });
}

export default function ContratoEditor() {
  const params = useLocalSearchParams();
  const db = useDB();
  const c = useTheme();
  const isNew = params.id === 'novo';
  const stored = !isNew && db.contratos.find((x) => x.id === params.id);
  const [x, setX] = useState(() => {
    if (stored) return JSON.parse(JSON.stringify(stored));
    const orc = params.orcamentoId && db.orcamentos.find((o) => o.id === params.orcamentoId);
    const tipo = orc && db.settings.tiposServico.find((t) => t.id === orc.tipoServicoId);
    const modelo = db.settings.modelosContrato.find((m) => m.id === tipo?.contratoModeloId) || db.settings.modelosContrato[0];
    const cli = orc && db.clientes.find((k) => k.id === orc.clienteId);
    const e = db.settings.empresa;
    return {
      orcamentoId: orc?.id || '', clienteId: orc?.clienteId || '', modeloId: modelo?.id || '', status: 'rascunho',
      titulo: modelo?.nome || 'Contrato', corpo: gerarCorpo(db, modelo?.id, orc?.id, orc?.clienteId),
      nomeCliente: cli?.nome || '', docCliente: cli?.documento || '', nomeLuthier: e.responsavel || e.nome,
      testemunha1: '', testemunha2: '', assinaturaCliente: '', assinaturaLuthier: e.assinatura || '', assinaturaTest1: '', assinaturaTest2: '',
    };
  });
  const savedId = useRef(stored ? stored.id : null);
  const [numero, setNumero] = useState(stored?.numero || '');
  const [busy, setBusy] = useState(false);
  const [inserir, setInserir] = useState(false);
  const [leitura, setLeitura] = useState(false);
  const sel = useRef({ start: 0, end: 0 });
  const dirty = useRef(false);
  const timer = useRef(null);
  const xRef = useRef(x); xRef.current = x;

  const save = (doc) => {
    if (!doc.clienteId) return null;
    let data = { ...doc, id: savedId.current || undefined };
    if (data.assinaturaCliente && data.assinaturaLuthier && !data.dataAssinatura) data = { ...data, dataAssinatura: new Date().toISOString(), status: 'assinado' };
    let r = actions.saveContrato(data);
    if (String(data.corpo).includes(NUM)) {
      const fixed = data.corpo.split(NUM).join(r.numero);
      r = actions.saveContrato({ ...getState().contratos.find((k) => k.id === r.id), corpo: fixed });
      setX((p) => ({ ...p, corpo: p.corpo.split(NUM).join(r.numero) }));
    }
    if (data.dataAssinatura && !doc.dataAssinatura) setX((p) => ({ ...p, dataAssinatura: data.dataAssinatura, status: 'assinado' }));
    savedId.current = r.id; setNumero(r.numero); dirty.current = false;
    return r.id;
  };

  useEffect(() => {
    if (!dirty.current) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => save(x), 600);
    return () => clearTimeout(timer.current);
  }, [x]);
  useEffect(() => () => { if (dirty.current) save(xRef.current); }, []);
  // contrato novo vindo de um orçamento já tem cliente: salva para gerar o número
  useEffect(() => { if (isNew && x.clienteId) { dirty.current = true; save(x); } }, []);

  const patch = (p) => { dirty.current = true; setX((prev) => ({ ...prev, ...p })); };
  const set = (k, v) => patch({ [k]: v });

  const ensure = () => {
    if (!x.clienteId) { toast('Selecione o cliente primeiro'); return null; }
    const id = save(xRef.current);
    return getState().contratos.find((k) => k.id === id);
  };
  const run = async (fn) => {
    const doc = ensure(); if (!doc) return;
    setBusy(true);
    try { await fn(doc); } catch (e) { toast('Erro: ' + (e?.message || e)); } finally { setBusy(false); }
  };

  const orcOpts = useMemo(() => db.orcamentos.map((o) => ({ value: o.id, label: `${o.numero} — ${db.clientes.find((k) => k.id === o.clienteId)?.nome || ''}`, sub: o.titulo })), [db]);
  const modeloOpts = db.settings.modelosContrato.map((m) => ({ value: m.id, label: m.nome }));
  const s = CT_STATUS[x.status || 'rascunho'];

  const preencher = async () => {
    if (x.corpo && !(await confirm('Substituir o texto?', 'O texto atual será trocado pelo modelo preenchido com os dados do orçamento e do cliente.', 'Substituir'))) return;
    patch({ corpo: gerarCorpo(db, x.modeloId, x.orcamentoId, x.clienteId, numero), titulo: db.settings.modelosContrato.find((m) => m.id === x.modeloId)?.nome || x.titulo });
  };

  const inserirDado = (key) => {
    const orcamento = db.orcamentos.find((o) => o.id === x.orcamentoId);
    const cliente = db.clientes.find((k) => k.id === x.clienteId);
    const val = fillTemplate(`{{${key}}}`, { ...buildContext(db, { orcamento, cliente }), contrato: { numero: numero || NUM } });
    const { start, end } = sel.current;
    const a = Math.min(start ?? x.corpo.length, x.corpo.length); const b = Math.min(end ?? a, x.corpo.length);
    set('corpo', x.corpo.slice(0, a) + val + x.corpo.slice(b));
    setInserir(false);
  };

  const textoLeitura = String(x.corpo || '').split(NUM).join(numero || '(número gerado ao salvar)');

  return (
    <Screen footer={
      <DocActions busy={busy}
        onPreview={() => { const d = ensure(); if (d) router.push({ pathname: '/preview', params: { kind: 'contrato', id: d.id } }); }}
        onPdf={() => run(async (d) => sharePdf(await exportPdf(getState(), 'contrato', d)))}
        onWhatsApp={() => run(async (d) => {
          await sendWhatsApp(getState(), 'contrato', d);
          if ((d.status || 'rascunho') === 'rascunho') { actions.saveContrato({ ...d, status: 'aguardando' }); setX((p) => ({ ...p, status: 'aguardando' })); }
        })}
      />
    }>
      <Stack.Screen options={{ title: numero || 'Novo contrato' }} />

      <Card title="Dados">
        <Field label="Orçamento vinculado">
          <Select value={x.orcamentoId} options={orcOpts} allowClear placeholder="Nenhum (contrato avulso)" title="Orçamento" onChange={(v) => {
            const o = db.orcamentos.find((k) => k.id === v); const cli = o && db.clientes.find((k) => k.id === o.clienteId);
            patch({ orcamentoId: v, ...(cli ? { clienteId: cli.id, nomeCliente: cli.nome, docCliente: cli.documento || '' } : {}) });
          }} />
        </Field>
        <Field label="Cliente">
          <ClienteSelect value={x.clienteId} onChange={(v) => { const cli = db.clientes.find((k) => k.id === v); patch({ clienteId: v, nomeCliente: cli?.nome || '', docCliente: cli?.documento || '' }); }} />
        </Field>
        <Row>
          <Field label="Modelo"><Select value={x.modeloId} options={modeloOpts} title="Modelo de contrato" onChange={(v) => set('modeloId', v)} /></Field>
          <Field label="Situação"><Select value={x.status} options={Object.entries(CT_STATUS).map(([k, v]) => ({ value: k, label: v.nome }))} title="Situação" onChange={(v) => set('status', v)} /></Field>
        </Row>
        <Field label="Título"><Input value={x.titulo} onChangeText={(t) => set('titulo', t)} /></Field>
        <Btn icon="color-wand-outline" title="Preencher com o modelo" onPress={preencher} />
      </Card>

      <Card title="Texto do contrato" right={<Btn small icon="code-slash-outline" title="Inserir dado" onPress={() => setInserir(true)} />}>
        <Input multiline value={x.corpo} onChangeText={(t) => set('corpo', t)} onSelectionChange={(e) => { sel.current = e.nativeEvent.selection; }}
          style={{ minHeight: 360, fontFamily: 'serif', fontSize: 14, lineHeight: 21 }} />
        <Hint>A primeira linha vira o título do PDF. Linhas iniciadas com “CLÁUSULA” ficam em negrito.</Hint>
      </Card>

      <Card title="Assinaturas">
        <Row>
          <Field label="Nome do cliente"><Input value={x.nomeCliente} onChangeText={(t) => set('nomeCliente', t)} /></Field>
          <Field label="CPF/CNPJ"><Input value={x.docCliente} keyboardType="numeric" onChangeText={(t) => set('docCliente', t)} /></Field>
        </Row>
        <Btn variant="primary" icon="create-outline" title="Ler e assinar (cliente)" onPress={() => setLeitura(true)} />
        <Row>
          <SignatureField label="Cliente" value={x.assinaturaCliente} signer={x.nomeCliente} onChange={(v) => set('assinaturaCliente', v)} />
          <SignatureField label="Luthier" value={x.assinaturaLuthier} signer={x.nomeLuthier} onChange={(v) => set('assinaturaLuthier', v)} />
        </Row>
        <Field label="Luthier / responsável"><Input value={x.nomeLuthier} onChangeText={(t) => set('nomeLuthier', t)} /></Field>
        {x.dataAssinatura ? <Text style={{ color: c.ok, fontWeight: '600' }}>✓ Assinado em {fmtDateTime(x.dataAssinatura)}</Text> : null}
        {db.settings.pdf.testemunhas && <>
          <Label>Testemunhas</Label>
          <Row>
            <Field><Input value={x.testemunha1} placeholder="Testemunha 1" onChangeText={(t) => set('testemunha1', t)} /></Field>
            <Field><Input value={x.testemunha2} placeholder="Testemunha 2" onChangeText={(t) => set('testemunha2', t)} /></Field>
          </Row>
          <Row>
            <SignatureField value={x.assinaturaTest1} signer={x.testemunha1 || 'Testemunha 1'} onChange={(v) => set('assinaturaTest1', v)} />
            <SignatureField value={x.assinaturaTest2} signer={x.testemunha2 || 'Testemunha 2'} onChange={(v) => set('assinaturaTest2', v)} />
          </Row>
        </>}
      </Card>

      <Card>
        {x.orcamentoId ? <Btn icon="document-text-outline" title="Abrir orçamento vinculado" onPress={() => router.push(`/orcamento/${x.orcamentoId}`)} /> : null}
        <Btn variant="danger" icon="trash-outline" title="Excluir contrato" onPress={async () => {
          if (!savedId.current) return router.back();
          if (await confirm('Excluir contrato?', 'Essa ação não pode ser desfeita.', 'Excluir', true)) {
            dirty.current = false; clearTimeout(timer.current); actions.deleteContrato(savedId.current); router.back();
          }
        }} />
      </Card>

      <Sheet visible={inserir} onClose={() => setInserir(false)} title="Inserir dado no texto" full>
        <FlatList data={PLACEHOLDERS} keyExtractor={(p) => p[0]} renderItem={({ item: [k, l] }) => (
          <Pressable onPress={() => inserirDado(k)} style={({ pressed }) => ({ paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 0.5, borderBottomColor: c.line, backgroundColor: pressed ? c.card2 : 'transparent' })}>
            <Text style={{ color: c.text, fontSize: 15 }}>{l}</Text>
            <Text style={{ color: c.muted, fontSize: 12 }}>{`{{${k}}}`}</Text>
          </Pressable>
        )} />
      </Sheet>

      <SignatureModal visible={leitura} onClose={() => setLeitura(false)} title={`Assinatura — ${x.nomeCliente || 'cliente'}`}
        onSave={(img) => { set('assinaturaCliente', img); setLeitura(false); toast('Assinatura registrada'); }}>
        <ScrollView style={{ maxHeight: '45%', marginHorizontal: 12, marginBottom: 8, backgroundColor: '#fffdf8', borderRadius: 10 }} contentContainerStyle={{ padding: 14 }}>
          <Text style={{ color: '#222', fontFamily: 'serif', fontSize: 14, lineHeight: 21 }}>{textoLeitura}</Text>
          <Text style={{ color: '#555', marginTop: 10, fontStyle: 'italic' }}>Declaro que li e concordo com os termos acima.</Text>
        </ScrollView>
      </SignatureModal>
    </Screen>
  );
}
