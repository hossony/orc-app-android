// Estado global + persistência offline em arquivo JSON no armazenamento do app
import { produce } from 'immer';
import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import { emptyDB, mergeSettings } from './defaults';
import { uid, today, num, addDays } from './utils';

let state = emptyDB();
let loaded = false;
const listeners = new Set();
let timer = null;

const DATA = 'hossony-orcamentos.json';
const BACKUP = 'hossony-orcamentos.backup.json';

function fileOf(name) { return new File(Paths.document, name); }

function readRaw() {
  if (Platform.OS === 'web') return globalThis.localStorage?.getItem(DATA) || null;
  const f = fileOf(DATA);
  return f.exists ? f.textSync() : null;
}

function writeRaw(text) {
  if (Platform.OS === 'web') { globalThis.localStorage?.setItem(DATA, text); return; }
  const tmp = fileOf(DATA + '.tmp');
  if (tmp.exists) tmp.delete();
  tmp.create();
  tmp.writeSync(text);
  const f = fileOf(DATA);
  if (f.exists) {
    // cópia de segurança diária
    try {
      const b = fileOf(BACKUP);
      const stamp = b.exists ? new Date(b.modificationTime || 0).toISOString().slice(0, 10) : '';
      if (stamp !== today()) { if (b.exists) b.delete(); f.copySync(b); }
    } catch {}
    f.delete();
  }
  tmp.moveSync(fileOf(DATA));
}

function migrate(data) {
  const base = emptyDB();
  const out = { ...base, ...(data || {}) };
  out.settings = mergeSettings(data?.settings);
  for (const k of ['clientes', 'orcamentos', 'contratos']) if (!Array.isArray(out[k])) out[k] = [];
  out.counters = out.counters || {};
  return out;
}

export async function initStore() {
  if (loaded) return;
  let raw = null;
  try { raw = readRaw(); } catch (e) { console.warn(e); }
  if (raw) {
    try { state = migrate(JSON.parse(raw)); }
    catch {
      // arquivo corrompido — tenta a cópia de segurança
      try { const b = fileOf(BACKUP); state = migrate(b.exists ? JSON.parse(b.textSync()) : null); } catch { state = emptyDB(); }
    }
  } else state = emptyDB();
  loaded = true;
  listeners.forEach((l) => l());
}

export function flush() {
  clearTimeout(timer);
  try { writeRaw(JSON.stringify(state)); } catch (e) { console.warn('Falha ao salvar', e); }
}

const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l); };
export const getState = () => state;
export const useDB = () => useSyncExternalStore(subscribe, getState, getState);

export function update(fn) {
  let ret;
  state = produce(state, (d) => { ret = fn(d); });
  listeners.forEach((l) => l());
  clearTimeout(timer);
  timer = setTimeout(flush, 250);
  return ret;
}

export function replaceAll(data) {
  state = migrate(data);
  listeners.forEach((l) => l());
  flush();
}

function nextNumber(d, key) {
  d.counters[key] = (d.counters[key] || 0) + 1;
  const cfg = d.settings.numeracao[key] || { prefixo: '', digitos: 4 };
  return (cfg.prefixo || '') + String(d.counters[key]).padStart(Number(cfg.digitos) || 1, '0');
}

function upsert(d, col, obj, numKey) {
  const i = d[col].findIndex((x) => x.id === obj.id);
  const now = new Date().toISOString();
  const prev = i >= 0 ? d[col][i] : null;
  const o = { ...obj, id: obj.id || uid(), atualizadoEm: now };
  if (prev) { o.numero = o.numero || prev.numero; o.criadoEm = prev.criadoEm; }
  if (numKey && !o.numero) o.numero = nextNumber(d, numKey);
  if (!prev) { o.criadoEm = now; d[col].unshift(o); } else d[col][i] = o;
  return o;
}

export const actions = {
  settings: (fn) => update((d) => { fn(d.settings); }),
  saveCliente: (c) => update((d) => upsert(d, 'clientes', c).id),
  deleteCliente: (id) => update((d) => { d.clientes = d.clientes.filter((x) => x.id !== id); }),
  saveOrcamento: (o) => update((d) => { const r = upsert(d, 'orcamentos', o, 'orcamento'); return { id: r.id, numero: r.numero }; }),
  deleteOrcamento: (id) => update((d) => { d.orcamentos = d.orcamentos.filter((x) => x.id !== id); }),
  saveContrato: (c) => update((d) => { const r = upsert(d, 'contratos', c, 'contrato'); return { id: r.id, numero: r.numero }; }),
  deleteContrato: (id) => update((d) => { d.contratos = d.contratos.filter((x) => x.id !== id); }),
  setCounter: (key, n) => update((d) => { d.counters[key] = num(n); }),
};

export function loadDemo() {
  const s = state.settings;
  const c1 = actions.saveCliente({ nome: 'Rafael Tonelli', tipo: 'PF', documento: '98765432100', whatsapp: '11991234567', email: 'rafael.cello@exemplo.com', logradouro: 'Rua Augusta', numero: '1500', bairro: 'Consolação', cidade: 'São Paulo', uf: 'SP', cep: '01305-100', campos: {} });
  const c2 = actions.saveCliente({ nome: 'Conservatório Vale Verde', tipo: 'PJ', documento: '11222333000181', whatsapp: '1433221100', cidade: 'Avaré', uf: 'SP', campos: {} });
  const o1 = actions.saveOrcamento({
    data: today(), status: 'aberto', clienteId: c1, tipoServicoId: 'encomenda', titulo: 'Violoncelo 4/4 modelo Stradivari',
    instrumento: { tipo: 'Violoncelo', modelo: 'Stradivari "Davidov"', marca: 'Hossony' },
    descricao: 'Construção de violoncelo profissional, voluta tradicional, verniz a óleo âmbar dourado.',
    especificacoes: { 'cp-modelo': 'Stradivari', 'cp-tamanho': '4/4', 'cp-tampo': 'Abeto alpino', 'cp-fundo': 'Bordo flamado', 'cp-verniz': 'Óleo', 'cp-cor': 'Âmbar dourado' },
    itens: [{ id: uid(), descricao: 'Construção de violoncelo 4/4 artesanal', qtd: 1, valor: 22000 }, { id: uid(), descricao: 'Encordoamento Larsen', qtd: 1, valor: 1190 }],
    desconto: '', descontoTipo: 'R$', validadeDias: s.textos.validadeOrcamentoDias, prazoDias: 180, sinalPercentual: 50,
    condicoesPagamento: s.textos.condicoesPagamento, observacoes: '',
  });
  actions.saveOrcamento({
    data: addDays(today(), -3), status: 'aprovado', clienteId: c2, tipoServicoId: 'manutencao', titulo: 'Revisão de 8 violinos',
    instrumento: { tipo: 'Violino' }, descricao: 'Ajuste de alma, cavalete, cravelhas e troca de cordas.', especificacoes: {},
    itens: [{ id: uid(), descricao: 'Revisão completa por instrumento', qtd: 8, valor: 260 }], desconto: 10, descontoTipo: '%', validadeDias: 15, prazoDias: 20, sinalPercentual: 0,
    condicoesPagamento: '30 dias após a entrega.',
  });
  return o1.id;
}
