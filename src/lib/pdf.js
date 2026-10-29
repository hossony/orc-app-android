// Geração dos PDFs (orçamento e contrato), compartilhamento e envio por WhatsApp
import { Platform, Linking } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import * as WhatsApp from '../../modules/whatsapp-share';
import { TAMANHOS_PDF } from './defaults';
import {
  money, num, totals, fmtDate, fmtDateLong, fmtDateTime, today, addDays, enderecoTexto, maskDoc, maskPhone, valorPorExtenso, fillTemplate, daysBetween,
} from './utils';

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const br = (s) => esc(s).replace(/\n/g, '<br/>');

// ---------- Contexto de variáveis ----------
export function especificacoes(db, orc) {
  return db.settings.camposPersonalizados
    .filter((c) => c.aplicaEm === 'orcamento' && c.imprimir !== false)
    .map((c) => ({ label: c.label, valor: orc?.especificacoes?.[c.id] }))
    .filter((x) => x.valor !== undefined && x.valor !== '' && x.valor !== false)
    .map((x) => ({ ...x, valor: x.valor === true ? 'Sim' : String(x.valor) }));
}

export const instrumentoTexto = (ins = {}) => [ins.tipo, ins.modelo, ins.marca, ins.numeroSerie && `nº ${ins.numeroSerie}`].filter(Boolean).join(' · ');

export function buildContext(db, { orcamento, cliente, contrato } = {}) {
  const e = db.settings.empresa;
  const cli = cliente || db.clientes.find((c) => c.id === orcamento?.clienteId) || {};
  const tipo = db.settings.tiposServico.find((t) => t.id === orcamento?.tipoServicoId);
  const t = totals(orcamento || {});
  const pct = orcamento?.sinalPercentual !== undefined && orcamento?.sinalPercentual !== '' ? num(orcamento.sinalPercentual) : num(tipo?.sinalPercentual);
  const sinal = (t.total * pct) / 100;
  const specs = especificacoes(db, orcamento);
  const ins = orcamento?.instrumento || {};
  const prazo = orcamento?.prazoDias ? addDays(orcamento.dataAprovacao || today(), orcamento.prazoDias) : '';
  const ordem = orcamento ? {
    ...orcamento,
    tipo: tipo?.nome || '',
    instrumento: [ins.tipo, ins.modelo && `modelo ${ins.modelo}`, ins.marca, ins.numeroSerie && `nº de série ${ins.numeroSerie}`].filter(Boolean).join(', '),
    especificacoes: specs.length ? specs.map((s) => `• ${s.label}: ${s.valor}`).join('\n') : '(conforme descrição)',
    itens: (orcamento.itens || []).map((i) => `• ${i.descricao} — ${num(i.qtd)} × ${money(i.valor)} = ${money(num(i.qtd) * num(i.valor))}`).join('\n') || '(sem itens)',
    total: money(t.total), totalExtenso: valorPorExtenso(t.total),
    sinal: money(sinal), sinalPercentual: `${Math.round(pct)}%`, saldo: money(Math.max(0, t.total - sinal)),
    prazo: prazo ? fmtDate(prazo) : '—', prazoDias: orcamento.prazoDias || '—',
    dataEntrada: fmtDate(orcamento.data), garantiaDias: tipo?.garantiaDias ?? 0,
    condicoesPagamento: orcamento.condicoesPagamento || db.settings.textos.condicoesPagamento,
    descricao: orcamento.descricao || orcamento.titulo || '',
  } : {};
  return {
    empresa: { ...e, documento: maskDoc(e.documento), endereco: [e.endereco, e.cidade && `${e.cidade}/${e.uf}`, e.cep && `CEP ${e.cep}`].filter(Boolean).join(' — ') },
    cliente: { ...cli, documento: maskDoc(cli.documento || ''), telefone: maskPhone(cli.whatsapp || cli.telefone || ''), endereco: enderecoTexto(cli) },
    ordem, orcamento: ordem,
    contrato: contrato || {},
    data: { hoje: fmtDate(today()), extenso: fmtDateLong(today()) },
  };
}

// ---------- HTML ----------
function css(db) {
  const p = db.settings.pdf;
  const [w, h] = TAMANHOS_PDF[p.tamanho] || TAMANHOS_PDF.A4;
  const m = num(p.margemMm) || 12;
  const cor = db.settings.aparencia.corDestaque || '#c0773a';
  return `
  @page { size: ${w}mm ${h}mm; margin: ${m}mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; }
  body { font-family: ${p.fonte}, Georgia, serif; font-size: ${num(p.tamanhoFonte) || 11}px; color: #111; line-height: 1.38; -webkit-print-color-adjust: exact; }
  .sans { font-family: Arial, Helvetica, sans-serif; }
  .muted { color: #555; } .small { font-size: .85em; } .xs { font-size: .75em; } .b { font-weight: 700; } .c { text-align: center; } .r { text-align: right; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; gap: 5mm; border-bottom: 2px solid ${cor}; padding-bottom: 3mm; margin-bottom: 4mm; }
  .head .logo { max-height: 20mm; max-width: 40mm; object-fit: contain; margin-right: 3mm; }
  .emp { display: flex; align-items: flex-start; }
  .emp h1 { margin: 0; font-size: 1.55em; }
  .slogan { font-style: italic; color: #555; }
  .title { text-align: right; min-width: 45mm; }
  .title h2 { margin: 0; color: ${cor}; font-size: 1.3em; letter-spacing: .06em; }
  .title .num { font-family: Arial, sans-serif; font-weight: 700; font-size: 1.1em; }
  .box { border: 1px solid #bbb; border-radius: 2mm; padding: 2.5mm 3mm; margin-bottom: 3.5mm; page-break-inside: avoid; }
  .bt { font-family: Arial, sans-serif; font-size: .76em; text-transform: uppercase; letter-spacing: .08em; color: ${cor}; font-weight: 700; margin-bottom: 1.5mm; }
  .kv { display: table; width: 100%; }
  .kv .cell { display: inline-block; width: 49%; vertical-align: top; margin-bottom: 1.2mm; }
  .kv .cell.full { width: 100%; }
  .kv .cell span { display: block; color: #555; font-size: .82em; font-family: Arial, sans-serif; }
  table { width: 100%; border-collapse: collapse; }
  th { font-family: Arial, sans-serif; font-size: .76em; text-transform: uppercase; letter-spacing: .05em; text-align: left; border-bottom: 1.5px solid #333; padding: 1.2mm 1mm; }
  td { border-bottom: 1px solid #ddd; padding: 1.2mm 1mm; vertical-align: top; }
  .totals { width: 65mm; margin-left: auto; font-family: Arial, sans-serif; margin-top: 2mm; }
  .totals div { display: flex; justify-content: space-between; padding: .5mm 0; }
  .totals .main { border-top: 1.5px solid #333; margin-top: 1mm; padding-top: 1.2mm; font-size: 1.2em; font-weight: 700; }
  .sigs { display: flex; gap: 12mm; margin-top: 12mm; page-break-inside: avoid; }
  .sig { flex: 1; text-align: center; }
  .sig img { height: 18mm; max-width: 100%; object-fit: contain; display: block; margin: 0 auto -2mm; }
  .sig .ph { height: 18mm; }
  .sig .line { border-top: 1px solid #000; padding-top: 1mm; font-size: .9em; }
  .note { font-size: .82em; color: #444; border-top: 1px solid #ccc; padding-top: 2mm; margin-top: 4mm; }
  .contract p { text-align: justify; margin: 0 0 2mm; }
  .contract .clause { font-weight: 700; margin-top: 3mm; }
  .contract .ctitle { text-align: center; font-weight: 700; font-size: 1.18em; margin-bottom: 4mm; }
  `;
}

const page = (db, body, title) =>
  `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)}</title><style>${css(db)}</style></head><body>${body}</body></html>`;

function header(db, titulo, numero, data) {
  const e = db.settings.empresa; const p = db.settings.pdf;
  return `<div class="head">
    <div class="emp">${p.mostrarLogo && e.logo ? `<img class="logo" src="${e.logo}"/>` : ''}
      <div><h1>${esc(e.fantasia || e.nome)}</h1>${e.slogan ? `<div class="slogan small">${esc(e.slogan)}</div>` : ''}
      <div class="small muted sans" style="margin-top:1.5mm">
        ${esc([e.nome !== e.fantasia ? e.nome : '', e.documento && 'CNPJ/CPF ' + maskDoc(e.documento)].filter(Boolean).join(' · '))}<br/>
        ${esc([e.endereco, e.cidade && `${e.cidade}/${e.uf}`, e.cep && 'CEP ' + e.cep].filter(Boolean).join(' — '))}<br/>
        ${esc([maskPhone(e.whatsapp || e.telefone), e.email, e.site, e.instagram].filter(Boolean).join(' · '))}
      </div></div></div>
    <div class="title"><h2>${esc(titulo)}</h2>${numero ? `<div class="num">${esc(numero)}</div>` : ''}${data ? `<div class="small muted sans">${esc(data)}</div>` : ''}</div>
  </div>`;
}

const sig = (img, nome, sub) => `<div class="sig">${img ? `<img src="${img}"/>` : '<div class="ph"></div>'}<div class="line">${esc(nome || ' ')}${sub ? `<div class="xs muted">${esc(sub)}</div>` : ''}</div></div>`;

export function orcamentoHTML(db, orc) {
  const p = db.settings.pdf; const e = db.settings.empresa;
  const cli = db.clientes.find((c) => c.id === orc.clienteId) || {};
  const tipo = db.settings.tiposServico.find((t) => t.id === orc.tipoServicoId);
  const specs = especificacoes(db, orc);
  const t = totals(orc);
  const validade = orc.validadeDias ? addDays(orc.data || today(), orc.validadeDias) : '';
  const ctx = buildContext(db, { orcamento: orc });
  const body = `
  ${header(db, orc.tituloDocumento || 'ORÇAMENTO', orc.numero, 'Emitido em ' + fmtDate(orc.data))}
  <div class="box"><div class="bt">Cliente</div><div class="kv">
    <div class="cell"><span>Nome</span>${esc(cli.nome || '—')}</div>
    <div class="cell"><span>${cli.tipo === 'PJ' ? 'CNPJ' : 'CPF'}</span>${esc(maskDoc(cli.documento) || '—')}</div>
    <div class="cell"><span>Telefone / WhatsApp</span>${esc(maskPhone(cli.whatsapp || cli.telefone) || '—')}</div>
    <div class="cell"><span>E-mail</span>${esc(cli.email || '—')}</div>
    ${enderecoTexto(cli) ? `<div class="cell full"><span>Endereço</span>${esc(enderecoTexto(cli))}</div>` : ''}
  </div></div>
  <div class="box"><div class="bt">Proposta</div><div class="kv">
    <div class="cell"><span>Serviço</span>${esc(tipo?.nome || '—')}</div>
    <div class="cell"><span>Instrumento</span>${esc(instrumentoTexto(orc.instrumento) || '—')}</div>
    <div class="cell"><span>Prazo estimado</span>${orc.prazoDias ? `${esc(orc.prazoDias)} dias após a aprovação` : '—'}</div>
    <div class="cell"><span>Garantia</span>${num(tipo?.garantiaDias) ? `${tipo.garantiaDias} dias` : '—'}</div>
  </div>
  ${orc.titulo ? `<p class="b" style="margin:2mm 0 1mm">${esc(orc.titulo)}</p>` : ''}
  ${orc.descricao ? `<p style="margin:0">${br(orc.descricao)}</p>` : ''}</div>
  ${p.mostrarEspecificacoes && specs.length ? `<div class="box"><div class="bt">Especificações</div><div class="kv">${specs.map((s) => `<div class="cell"><span>${esc(s.label)}</span>${br(s.valor)}</div>`).join('')}</div></div>` : ''}
  <div class="box"><div class="bt">Itens</div>
    <table><thead><tr><th>Descrição</th><th class="r" style="width:14mm">Qtd</th><th class="r" style="width:26mm">Unitário</th><th class="r" style="width:26mm">Total</th></tr></thead><tbody>
    ${(orc.itens || []).map((i) => `<tr><td>${br(i.descricao)}</td><td class="r">${num(i.qtd)}</td><td class="r">${money(i.valor)}</td><td class="r">${money(num(i.qtd) * num(i.valor))}</td></tr>`).join('') || '<tr><td colspan="4" class="muted">—</td></tr>'}
    </tbody></table>
    <div class="totals">
      <div><span>Subtotal</span><b>${money(t.subtotal)}</b></div>
      ${t.desconto > 0 ? `<div><span>Desconto</span><b>− ${money(t.desconto)}</b></div>` : ''}
      ${t.acrescimo > 0 ? `<div><span>Acréscimo</span><b>+ ${money(t.acrescimo)}</b></div>` : ''}
      <div class="main"><span>Total</span><span>${money(t.total)}</span></div>
      ${num(orc.sinalPercentual) > 0 ? `<div class="small"><span>Sinal (${num(orc.sinalPercentual)}%)</span><b>${ctx.ordem.sinal}</b></div>` : ''}
    </div>
  </div>
  <div class="box"><div class="kv">
    <div class="cell"><span>Condições de pagamento</span>${br(orc.condicoesPagamento || db.settings.textos.condicoesPagamento)}</div>
    ${p.mostrarValidade && validade ? `<div class="cell"><span>Validade da proposta</span>${orc.validadeDias} dias (até ${fmtDate(validade)})</div>` : ''}
    ${p.mostrarPix && e.chavePix ? `<div class="cell full"><span>Chave PIX</span>${esc(e.chavePix)}</div>` : ''}
  </div>
  ${(orc.observacoes || db.settings.textos.observacaoOrcamento) ? `<p class="small muted" style="margin:2mm 0 0">${br(orc.observacoes || db.settings.textos.observacaoOrcamento)}</p>` : ''}
  </div>
  ${p.mostrarGarantia && db.settings.textos.garantia ? `<div class="note"><b>Garantia:</b> ${br(db.settings.textos.garantia)}</div>` : ''}
  ${p.mostrarAssinaturas ? `<div class="sigs">${sig(orc.assinaturaCliente, cli.nome, orc.assinaturaCliente ? 'De acordo — ' + fmtDate(orc.dataAprovacao || today()) : 'De acordo (cliente)')}${sig(e.assinatura, e.responsavel || e.fantasia || e.nome, 'Luthier responsável')}</div>` : ''}
  ${p.mostrarRodape && db.settings.textos.rodape ? `<p class="c small muted" style="margin-top:6mm">${esc(db.settings.textos.rodape)}</p>` : ''}`;
  return page(db, body, orc.numero || 'Orçamento');
}

export function contratoHTML(db, ct) {
  const p = db.settings.pdf; const e = db.settings.empresa;
  const linhas = String(ct.corpo || '').split('\n');
  const body = `<div class="contract">
    ${p.mostrarLogo && e.logo ? `<div class="c" style="margin-bottom:3mm"><img src="${e.logo}" style="max-height:18mm;max-width:50mm"/></div>` : ''}
    <div class="ctitle">${esc(linhas[0])}</div>
    ${linhas.slice(1).filter((l) => l.trim()).map((l) => {
      const clause = /^(CLÁUSULA|CLAUSULA)/i.test(l.trim()) && l.trim().length < 90;
      return `<p class="${clause ? 'clause' : ''}">${esc(l)}</p>`;
    }).join('')}
    ${p.mostrarAssinaturas ? `<div class="sigs" style="margin-top:16mm">
      ${sig(ct.assinaturaLuthier, ct.nomeLuthier || e.responsavel || e.nome, 'CONTRATADO' + (e.documento ? ' — ' + maskDoc(e.documento) : ''))}
      ${sig(ct.assinaturaCliente, ct.nomeCliente, 'CONTRATANTE' + (ct.docCliente ? ' — ' + maskDoc(ct.docCliente) : ''))}</div>` : ''}
    ${p.testemunhas ? `<div class="sigs">${sig(ct.assinaturaTest1, ct.testemunha1 || 'Testemunha 1', 'CPF:')}${sig(ct.assinaturaTest2, ct.testemunha2 || 'Testemunha 2', 'CPF:')}</div>` : ''}
    ${p.mostrarDataAssinatura && ct.dataAssinatura ? `<p class="xs muted c" style="margin-top:6mm">Assinado eletronicamente em ${fmtDateTime(ct.dataAssinatura)} · Contrato ${esc(ct.numero || '')}</p>` : ''}
  </div>`;
  return page(db, body, ct.numero || 'Contrato');
}

// ---------- Exportar / compartilhar ----------
const safeName = (s) => String(s).replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim().slice(0, 90);

export function docFileName(db, kind, doc) {
  const cli = db.clientes.find((c) => c.id === doc.clienteId);
  const prefix = kind === 'contrato' ? 'Contrato' : 'Orcamento';
  return safeName(`${prefix} ${doc.numero || ''}${cli ? ' - ' + cli.nome : ''}`) + '.pdf';
}

export async function exportPdf(db, kind, doc) {
  const html = kind === 'contrato' ? contratoHTML(db, doc) : orcamentoHTML(db, doc);
  const [w, h] = TAMANHOS_PDF[db.settings.pdf.tamanho] || TAMANHOS_PDF.A4;
  const pts = (mm) => Math.round((mm / 25.4) * 72);
  const { uri } = await Print.printToFileAsync({ html, width: pts(w), height: pts(h) });
  if (Platform.OS === 'web') return { uri, name: docFileName(db, kind, doc) };
  const src = new File(uri);
  const dest = new File(Paths.cache, docFileName(db, kind, doc));
  if (dest.exists) dest.delete();
  src.moveSync(dest);
  return { uri: dest.uri, name: dest.name, file: dest };
}

export async function sharePdf(pdf) {
  if (!(await Sharing.isAvailableAsync())) throw new Error('Compartilhamento indisponível neste aparelho');
  await Sharing.shareAsync(pdf.uri, { mimeType: 'application/pdf', dialogTitle: pdf.name, UTI: 'com.adobe.pdf' });
}

export async function openPdf(pdf) {
  if (pdf.file && (await pdf.file.canPreview())) return pdf.file.preview();
  return sharePdf(pdf);
}

export function whatsappMessage(db, kind, doc) {
  const cli = db.clientes.find((c) => c.id === doc.clienteId) || {};
  const e = db.settings.empresa;
  const orc = kind === 'contrato' ? db.orcamentos.find((o) => o.id === doc.orcamentoId) : doc;
  const t = totals(orc || {});
  const ctx = {
    cliente: { ...cli, primeiroNome: (cli.nome || '').split(' ')[0] },
    empresa: { ...e, fantasia: e.fantasia || e.nome },
    doc: {
      numero: doc.numero, titulo: doc.titulo || orc?.titulo || instrumentoTexto(orc?.instrumento) || '',
      total: money(t.total), validade: orc?.validadeDias ? fmtDate(addDays(orc.data, orc.validadeDias)) : '—',
      prazo: orc?.prazoDias ? `${orc.prazoDias} dias` : '—',
    },
  };
  return fillTemplate(db.settings.whatsapp[kind === 'contrato' ? 'contrato' : 'orcamento'], ctx).replace(/________/g, '').trim();
}

export function phoneForWhatsApp(cli) {
  const d = String(cli?.whatsapp || cli?.telefone || '').replace(/\D/g, '');
  if (!d) return '';
  return d.length <= 11 ? '55' + d : d;
}

// Envia o PDF para o WhatsApp: direto na conversa do cliente quando possível, senão pelo menu de compartilhar
export async function sendWhatsApp(db, kind, doc) {
  const pdf = await exportPdf(db, kind, doc);
  const cli = db.clientes.find((c) => c.id === doc.clienteId);
  const msg = whatsappMessage(db, kind, doc);
  if (Platform.OS === 'android' && db.settings.whatsapp.direto && WhatsApp.isAvailable) {
    const ok = await WhatsApp.sendFile(pdf.uri, phoneForWhatsApp(cli), msg);
    if (ok) return 'whatsapp';
  }
  await sharePdf(pdf);
  return 'share';
}

export async function openWhatsAppChat(db, kind, doc) {
  const cli = db.clientes.find((c) => c.id === doc.clienteId);
  const phone = phoneForWhatsApp(cli);
  const msg = encodeURIComponent(whatsappMessage(db, kind, doc));
  await Linking.openURL(phone ? `https://wa.me/${phone}?text=${msg}` : `https://wa.me/?text=${msg}`);
}
