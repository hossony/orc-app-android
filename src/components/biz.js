import React, { useMemo, useRef, useState } from 'react';
import { View, Text, Image, Pressable, Platform, Modal, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDB, actions } from '../lib/store';
import { useTheme } from '../lib/theme';
import { money, num, uid, totals, maskPhone } from '../lib/utils';
import { Card, Field, Input, NumInput, Btn, IconBtn, Select, Row, Sheet, Segmented, Icon, Hint, toast, Label } from './ui';

let SignatureCanvas = null;
if (Platform.OS !== 'web') {
  try { SignatureCanvas = require('react-native-signature-canvas').default; } catch {}
}

// ---------- Cliente ----------
export function ClienteSelect({ value, onChange }) {
  const db = useDB();
  const [novo, setNovo] = useState(null);
  const options = useMemo(() => [...db.clientes].sort((a, b) => a.nome.localeCompare(b.nome))
    .map((c) => ({ value: c.id, label: c.nome, sub: [maskPhone(c.whatsapp || c.telefone), c.cidade].filter(Boolean).join(' · ') })), [db.clientes]);
  return (
    <>
      <Select value={value} options={options} onChange={onChange} placeholder="Selecione o cliente" title="Cliente" onCreate={(q) => setNovo({ nome: q, whatsapp: '' })} createLabel="Novo cliente" />
      <Sheet visible={!!novo} onClose={() => setNovo(null)} title="Novo cliente">
        {novo && (
          <View style={{ padding: 16, gap: 12 }}>
            <Field label="Nome"><Input value={novo.nome} onChangeText={(t) => setNovo({ ...novo, nome: t })} autoFocus /></Field>
            <Field label="WhatsApp (com DDD)"><Input value={novo.whatsapp} keyboardType="phone-pad" onChangeText={(t) => setNovo({ ...novo, whatsapp: t })} /></Field>
            <Hint>Os demais dados (CPF, endereço) podem ser completados depois na aba Clientes.</Hint>
            <Btn variant="primary" icon="checkmark" title="Salvar cliente" onPress={() => {
              if (!novo.nome.trim()) return toast('Informe o nome');
              const id = actions.saveCliente({ tipo: 'PF', campos: {}, ...novo, nome: novo.nome.trim() });
              onChange(id); setNovo(null);
            }} />
          </View>
        )}
      </Sheet>
    </>
  );
}

// ---------- Itens ----------
export function ItemsEditor({ itens = [], onChange }) {
  const db = useDB();
  const c = useTheme();
  const set = (id, k, v) => onChange(itens.map((i) => (i.id === id ? { ...i, [k]: v } : i)));
  const add = (it) => onChange([...itens, { id: uid(), descricao: '', qtd: 1, valor: '', ...it }]);
  const move = (idx, d) => { const a = [...itens]; const j = idx + d; if (j < 0 || j >= a.length) return; [a[idx], a[j]] = [a[j], a[idx]]; onChange(a); };
  const catalogo = (db.settings.servicosCatalogo || []).map((s) => ({ value: s.id, label: s.nome, sub: money(s.valor) }));
  return (
    <View style={{ gap: 10 }}>
      {itens.map((i, idx) => (
        <View key={i.id} style={[st.item, { borderColor: c.line, backgroundColor: c.card2 }]}>
          <Row gap={6} style={{ alignItems: 'center' }}>
            <Text style={{ color: c.muted, fontWeight: '700', width: 22 }}>{idx + 1}.</Text>
            <Input style={{ flex: 1 }} value={i.descricao} placeholder="Descrição do item" multiline={false} onChangeText={(t) => set(i.id, 'descricao', t)} />
          </Row>
          <Row gap={8} style={{ alignItems: 'flex-end' }}>
            <Field label="Qtd" style={{ flex: 0.6 }}><NumInput value={i.qtd} onChange={(v) => set(i.id, 'qtd', v)} /></Field>
            <Field label="Valor unit. (R$)"><NumInput value={i.valor} onChange={(v) => set(i.id, 'valor', v)} placeholder="0,00" /></Field>
            <View style={{ paddingBottom: 12, minWidth: 90, alignItems: 'flex-end' }}>
              <Text style={{ color: c.text, fontWeight: '700' }}>{money(num(i.qtd) * num(i.valor))}</Text>
            </View>
          </Row>
          <Row gap={2} style={{ justifyContent: 'flex-end' }}>
            <IconBtn icon="arrow-up" onPress={() => move(idx, -1)} />
            <IconBtn icon="arrow-down" onPress={() => move(idx, 1)} />
            <IconBtn icon="copy-outline" onPress={() => onChange([...itens.slice(0, idx + 1), { ...i, id: uid() }, ...itens.slice(idx + 1)])} />
            <IconBtn icon="trash-outline" color={c.danger} onPress={() => onChange(itens.filter((x) => x.id !== i.id))} />
          </Row>
        </View>
      ))}
      {!itens.length && <Hint>Nenhum item. Adicione um serviço da tabela de preços ou um item avulso.</Hint>}
      <Select value="" options={catalogo} placeholder="➕ Adicionar da tabela de preços" title="Tabela de preços" onChange={(v) => {
        const s = db.settings.servicosCatalogo.find((x) => x.id === v); if (s) add({ descricao: s.nome, valor: s.valor });
      }} />
      <Btn icon="add" title="Item avulso" onPress={() => add({})} />
    </View>
  );
}

export function DescontoFields({ doc, onChange }) {
  return (
    <Row>
      <Field label="Desconto"><NumInput value={doc.desconto} onChange={(v) => onChange({ desconto: v })} placeholder="0" /></Field>
      <Field label="Tipo" style={{ flex: 0.8 }}>
        <Segmented options={[{ value: 'R$', label: 'R$' }, { value: '%', label: '%' }]} value={doc.descontoTipo || 'R$'} onChange={(v) => onChange({ descontoTipo: v })} />
      </Field>
      <Field label="Acréscimo (R$)"><NumInput value={doc.acrescimo} onChange={(v) => onChange({ acrescimo: v })} placeholder="0" /></Field>
    </Row>
  );
}

export function TotalsView({ doc }) {
  const c = useTheme();
  const t = totals(doc);
  const line = (l, v, strong, color) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ color: strong ? c.text : c.muted, fontSize: strong ? 18 : 14, fontWeight: strong ? '800' : '400' }}>{l}</Text>
      <Text style={{ color: color || c.text, fontSize: strong ? 20 : 14, fontWeight: strong ? '800' : '600' }}>{v}</Text>
    </View>
  );
  const pct = num(doc.sinalPercentual);
  return (
    <View style={[st.totals, { backgroundColor: c.card2, borderColor: c.line }]}>
      {line('Subtotal', money(t.subtotal))}
      {t.desconto > 0 && line('Desconto', '− ' + money(t.desconto), false, c.danger)}
      {t.acrescimo > 0 && line('Acréscimo', '+ ' + money(t.acrescimo))}
      <View style={{ height: 1, backgroundColor: c.line, marginVertical: 4 }} />
      {line('Total', money(t.total), true, c.accent)}
      {pct > 0 && line(`Sinal (${pct}%)`, money((t.total * pct) / 100))}
    </View>
  );
}

// ---------- Campos personalizados ----------
export function CustomFields({ campos, values = {}, onChange }) {
  if (!campos.length) return <Hint>Nenhum campo configurado. Crie em Ajustes → Campos personalizados.</Hint>;
  const set = (id, v) => onChange({ ...values, [id]: v });
  return (
    <View style={{ gap: 12 }}>
      {campos.map((f) => (
        <Field key={f.id} label={f.label}>
          {f.tipo === 'select' ? (
            <Select value={values[f.id] || ''} allowClear options={[...(f.opcoes || []), ...(values[f.id] && !(f.opcoes || []).includes(values[f.id]) ? [values[f.id]] : [])].map((o) => ({ value: o, label: o }))} onChange={(v) => set(f.id, v)} title={f.label} />
          ) : f.tipo === 'checkbox' ? (
            <Segmented options={[{ value: true, label: 'Sim' }, { value: false, label: 'Não' }]} value={!!values[f.id]} onChange={(v) => set(f.id, v)} />
          ) : (
            <Input value={values[f.id] ? String(values[f.id]) : ''} multiline={f.tipo === 'textarea'} keyboardType={f.tipo === 'number' ? 'decimal-pad' : 'default'} onChangeText={(t) => set(f.id, t)} />
          )}
        </Field>
      ))}
    </View>
  );
}

// ---------- Assinatura ----------
export function SignatureField({ label, value, onChange, signer }) {
  const c = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <View style={{ gap: 6, flex: 1 }}>
      {label ? <Label>{label}</Label> : null}
      <Pressable onPress={() => setOpen(true)} style={[st.sigBox, { borderColor: value ? c.accent : c.line }]}>
        {value ? <Image source={{ uri: value }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
          : <View style={{ alignItems: 'center', gap: 4 }}><Icon name="create-outline" size={22} color="#888" /><Text style={{ color: '#888' }}>Toque para assinar</Text></View>}
      </Pressable>
      {value ? <Btn small variant="ghost" icon="close-circle-outline" title="Remover assinatura" onPress={() => onChange('')} /> : null}
      <SignatureModal visible={open} onClose={() => setOpen(false)} title={signer ? `Assinatura — ${signer}` : label} onSave={(img) => { onChange(img); setOpen(false); }} />
    </View>
  );
}

export function SignatureModal({ visible, onClose, onSave, title, children }) {
  const c = useTheme();
  const ref = useRef();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }}>
        <Row style={{ alignItems: 'center', paddingHorizontal: 14, paddingBottom: 8 }}>
          <Text style={{ color: c.text, fontSize: 17, fontWeight: '700', flex: 1 }} numberOfLines={1}>{title || 'Assinatura'}</Text>
          <IconBtn icon="close" onPress={onClose} />
        </Row>
        {children}
        <View style={{ flex: 1, marginHorizontal: 12, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: c.line, backgroundColor: '#fff', minHeight: 220 }}>
          {SignatureCanvas ? (
            <SignatureCanvas
              ref={ref}
              onOK={(img) => onSave(img)}
              onEmpty={() => toast('Assine antes de salvar')}
              descriptionText=""
              backgroundColor="#ffffff"
              penColor="#111111"
              imageType="image/png"
              trimWhitespace
              webStyle={'.m-signature-pad{box-shadow:none;border:none;margin:0;width:100%;height:100%} .m-signature-pad--body{border:none} .m-signature-pad--footer{display:none} body,html{height:100%;margin:0}'}
            />
          ) : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text>Assinatura disponível no celular</Text></View>}
        </View>
        <Text style={{ color: c.muted, textAlign: 'center', marginVertical: 6, fontSize: 12.5 }}>Assine com o dedo ou caneta dentro do quadro branco</Text>
        <Row style={{ paddingHorizontal: 12 }}>
          <Btn flex icon="refresh" title="Limpar" onPress={() => ref.current?.clearSignature()} />
          <Btn flex variant="primary" icon="checkmark" title="Salvar assinatura" onPress={() => ref.current?.readSignature()} />
        </Row>
      </View>
    </Modal>
  );
}

// ---------- Ações de documento ----------
export function DocActions({ onPreview, onPdf, onWhatsApp, busy }) {
  const pad = { paddingHorizontal: 8 };
  return (
    <>
      <Btn flex style={pad} icon="eye-outline" title="Ver" onPress={onPreview} disabled={busy} />
      <Btn flex style={pad} icon="share-social-outline" title="PDF" onPress={onPdf} disabled={busy} />
      <Btn style={[pad, { flex: 1.5 }]} variant="whatsapp" icon="logo-whatsapp" title="WhatsApp" onPress={onWhatsApp} disabled={busy} />
    </>
  );
}

const st = StyleSheet.create({
  item: { borderWidth: 1, borderRadius: 12, padding: 10, gap: 8 },
  totals: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 5 },
  sigBox: { height: 120, borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
