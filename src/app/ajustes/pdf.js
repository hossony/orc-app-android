import React, { useState } from 'react';
import { Stack, router } from 'expo-router';
import { useDB, actions } from '../../lib/store';
import { num } from '../../lib/utils';
import { FONTES_PDF, TAMANHOS_PDF } from '../../lib/defaults';
import { exportPdf, openPdf } from '../../lib/pdf';
import { Screen, Card, Field, NumInput, Btn, Row, Segmented, Select, SwitchRow, Hint, toast } from '../../components/ui';

export default function PdfConfig() {
  const db = useDB();
  const p = db.settings.pdf;
  const set = (k, v) => actions.settings((s) => { s.pdf[k] = v; });
  const [busy, setBusy] = useState(false);
  const exemplo = db.orcamentos[0];
  const SW = (k, label) => <SwitchRow key={k} label={label} value={p[k]} onChange={(v) => set(k, v)} />;
  return (
    <Screen>
      <Stack.Screen options={{ title: 'Layout do PDF' }} />
      <Card title="Página">
        <Field label="Tamanho do papel">
          <Segmented options={Object.keys(TAMANHOS_PDF).map((k) => ({ value: k, label: k }))} value={p.tamanho} onChange={(v) => set('tamanho', v)} />
        </Field>
        <Row>
          <Field label="Margem (mm)"><NumInput value={p.margemMm} onChange={(v) => set('margemMm', num(v))} /></Field>
          <Field label="Tamanho da letra"><NumInput value={p.tamanhoFonte} onChange={(v) => set('tamanhoFonte', num(v))} /></Field>
        </Row>
        <Field label="Fonte"><Select value={p.fonte} options={FONTES_PDF.map((f) => ({ value: f, label: f }))} onChange={(v) => set('fonte', v)} title="Fonte do PDF" /></Field>
      </Card>
      <Card title="O que aparece">
        {SW('mostrarLogo', 'Logo')}
        {SW('mostrarEspecificacoes', 'Especificações')}
        {SW('mostrarValidade', 'Validade do orçamento')}
        {SW('mostrarPix', 'Chave PIX')}
        {SW('mostrarGarantia', 'Texto de garantia')}
        {SW('mostrarAssinaturas', 'Assinaturas')}
        {SW('testemunhas', 'Testemunhas no contrato')}
        {SW('mostrarDataAssinatura', 'Data/hora da assinatura no contrato')}
        {SW('mostrarRodape', 'Rodapé')}
      </Card>
      {exemplo ? (
        <Row>
          <Btn flex icon="eye-outline" title="Prévia" onPress={() => router.push({ pathname: '/preview', params: { kind: 'orcamento', id: exemplo.id } })} />
          <Btn flex icon="document-outline" title="Testar PDF" disabled={busy} onPress={async () => {
            setBusy(true); try { await openPdf(await exportPdf(db, 'orcamento', exemplo)); } catch (e) { toast('Erro: ' + e.message); } finally { setBusy(false); }
          }} />
        </Row>
      ) : <Hint>Crie um orçamento para testar o layout.</Hint>}
    </Screen>
  );
}
