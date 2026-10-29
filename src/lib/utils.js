// Utilidades gerais do Hossony Pro

export const uid = () =>
  Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-5);

export const num = (v) => {
  if (typeof v === 'number') return isFinite(v) ? v : 0;
  const s = String(v ?? '').trim();
  if (!s) return 0;
  // aceita "1.234,56" e "1234.56"
  const norm = s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s;
  const n = parseFloat(norm);
  return isNaN(n) ? 0 : n;
};

export const money = (v) =>
  (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const today = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

export const nowLocalInput = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const parseD = (d) => (typeof d === 'string' && d.length === 10 ? new Date(d + 'T12:00:00') : new Date(d));

export const fmtDate = (d) => (d ? parseD(d).toLocaleDateString('pt-BR') : '—');
export const fmtDateLong = (d) =>
  d ? parseD(d).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
export const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—';

export const addDays = (dateStr, days) => {
  const d = parseD(dateStr || today());
  d.setDate(d.getDate() + Number(days || 0));
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

export const daysBetween = (a, b) => {
  if (!a) return 0;
  const A = parseD(a); const B = b ? parseD(b) : new Date();
  A.setHours(0, 0, 0, 0); B.setHours(0, 0, 0, 0);
  return Math.round((B - A) / 86400000);
};

export const fmtDuration = (ms, withSeconds = false) => {
  ms = Math.max(0, ms || 0);
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (withSeconds) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${h}h ${String(m).padStart(2, '0')}min`;
};

export const hoursOf = (ms) => (ms || 0) / 3600000;

// ---------- Cálculos ----------
export const itemsSubtotal = (itens = []) =>
  itens.reduce((s, i) => s + num(i.qtd) * num(i.valor), 0);

export const calcDesconto = (subtotal, desconto, tipo) =>
  tipo === '%' ? (subtotal * num(desconto)) / 100 : num(desconto);

export function totals(doc = {}) {
  const subtotal = itemsSubtotal(doc.itens);
  const desconto = Math.min(subtotal, calcDesconto(subtotal, doc.desconto, doc.descontoTipo));
  const acrescimo = num(doc.acrescimo);
  const total = Math.max(0, subtotal - desconto + acrescimo);
  const pago = (doc.pagamentos || []).reduce((s, p) => s + num(p.valor), 0);
  return { subtotal, desconto, acrescimo, total, pago, saldo: Math.max(0, total - pago) };
}

// ---------- Cronômetro ----------
export function timeTotal(o, now = Date.now()) {
  const logs = (o?.timeLogs || []).reduce((s, l) => s + Math.max(0, new Date(l.end) - new Date(l.start)), 0);
  const running = o?.timerRunning ? Math.max(0, now - new Date(o.timerRunning.start)) : 0;
  return logs + running;
}

export function timeByEtapa(o, now = Date.now()) {
  const map = {};
  (o?.timeLogs || []).forEach((l) => {
    const k = l.etapaId || '_';
    map[k] = (map[k] || 0) + Math.max(0, new Date(l.end) - new Date(l.start));
  });
  if (o?.timerRunning) {
    const k = o.timerRunning.etapaId || '_';
    map[k] = (map[k] || 0) + Math.max(0, now - new Date(o.timerRunning.start));
  }
  return map;
}

// ---------- Templates ----------
export const getPath = (obj, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), obj);

export const fillTemplate = (str, ctx) =>
  String(str || '').replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, p) => {
    const v = getPath(ctx, p);
    return v == null || v === '' ? '________' : String(v);
  });

// ---------- Texto ----------
export const normalize = (s) =>
  String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const matches = (q, ...fields) => {
  const n = normalize(q).trim();
  if (!n) return true;
  return fields.some((f) => normalize(f).includes(n));
};

export const enderecoTexto = (c = {}) => {
  const l1 = [c.logradouro, c.numero].filter(Boolean).join(', ');
  const l2 = [c.complemento, c.bairro].filter(Boolean).join(' — ');
  const l3 = [c.cidade, c.uf].filter(Boolean).join('/');
  return [l1, l2, l3, c.cep ? 'CEP ' + c.cep : ''].filter(Boolean).join(' · ');
};

export const maskDoc = (v = '') => {
  const d = String(v).replace(/\D/g, '');
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  return v;
};

export const maskPhone = (v = '') => {
  const d = String(v).replace(/\D/g, '');
  if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  return v;
};

export const toCSV = (rows) =>
  rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';')).join('\r\n');

export const monthKey = (d) => String(d || '').slice(0, 7);
export const monthLabel = (key) => {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
};

export const valorPorExtenso = (valor) => {
  // Extenso simplificado em reais (até milhões)
  const u = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const d = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const c = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
  const ate999 = (n) => {
    if (n === 0) return '';
    if (n === 100) return 'cem';
    const parts = [];
    const ce = Math.floor(n / 100), r = n % 100;
    if (ce) parts.push(c[ce]);
    if (r < 20) { if (r) parts.push(u[r]); }
    else { const de = Math.floor(r / 10), un = r % 10; parts.push(un ? `${d[de]} e ${u[un]}` : d[de]); }
    return parts.join(' e ');
  };
  const inteiro = Math.floor(Number(valor) || 0);
  const cent = Math.round(((Number(valor) || 0) - inteiro) * 100);
  const mi = Math.floor(inteiro / 1e6), mil = Math.floor((inteiro % 1e6) / 1000), resto = inteiro % 1000;
  const p = [];
  if (mi) p.push(ate999(mi) + (mi === 1 ? ' milhão' : ' milhões'));
  if (mil) p.push(mil === 1 ? 'mil' : ate999(mil) + ' mil');
  if (resto) p.push(ate999(resto));
  let txt = p.join(p.length > 1 && (resto < 100 || resto % 100 === 0) ? ' e ' : ' ');
  if (inteiro) txt += inteiro === 1 ? ' real' : (resto === 0 && (mil || mi) && !mil && mi ? ' de reais' : ' reais');
  if (cent) txt += (inteiro ? ' e ' : '') + ate999(cent) + (cent === 1 ? ' centavo' : ' centavos');
  return txt.trim() || 'zero real';
};
