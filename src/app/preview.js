import React, { useMemo, useState } from 'react';
import { View, Platform } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useDB } from '../lib/store';
import { useTheme } from '../lib/theme';
import { orcamentoHTML, contratoHTML, exportPdf, sharePdf, openPdf, sendWhatsApp } from '../lib/pdf';
import { Btn, toast } from '../components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

let WebView = null;
if (Platform.OS !== 'web') { try { WebView = require('react-native-webview').WebView; } catch {} }

export default function Preview() {
  const { kind, id } = useLocalSearchParams();
  const db = useDB();
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);
  const doc = kind === 'contrato' ? db.contratos.find((x) => x.id === id) : db.orcamentos.find((x) => x.id === id);
  const html = useMemo(() => (doc ? (kind === 'contrato' ? contratoHTML(db, doc) : orcamentoHTML(db, doc)) : '<p>Documento não encontrado</p>'), [db, doc, kind]);
  // visualização em tela: simula a folha com largura fixa e margens
  const screenHtml = html.replace('<body>', '<body style="padding:14px;background:#fff">');
  const run = async (fn) => { setBusy(true); try { await fn(); } catch (e) { toast('Erro: ' + (e?.message || e)); } finally { setBusy(false); } };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Stack.Screen options={{ title: doc?.numero ? `Prévia ${doc.numero}` : 'Prévia' }} />
      <View style={{ flex: 1, margin: 10, borderRadius: 10, overflow: 'hidden', backgroundColor: '#fff' }}>
        {WebView ? (
          <WebView originWhitelist={['*']} source={{ html: screenHtml }} style={{ flex: 1 }} setBuiltInZoomControls={true} setDisplayZoomControls={false} />
        ) : React.createElement('iframe', { srcDoc: screenHtml, style: { width: '100%', height: '100%', border: 0 } })}
      </View>
      <View style={{ flexDirection: 'row', gap: 8, padding: 10, paddingBottom: 10 + insets.bottom, backgroundColor: c.card }}>
        <Btn flex style={{ paddingHorizontal: 8 }} icon="open-outline" title="Abrir" disabled={busy || !doc} onPress={() => run(async () => openPdf(await exportPdf(db, kind, doc)))} />
        <Btn flex style={{ paddingHorizontal: 8 }} icon="share-social-outline" title="Enviar" disabled={busy || !doc} onPress={() => run(async () => sharePdf(await exportPdf(db, kind, doc)))} />
        <Btn style={{ paddingHorizontal: 8, flex: 1.5 }} variant="whatsapp" icon="logo-whatsapp" title="WhatsApp" disabled={busy || !doc} onPress={() => run(() => sendWhatsApp(db, kind, doc))} />
      </View>
    </View>
  );
}
