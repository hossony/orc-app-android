import React from 'react';
import { Text, View, Pressable, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useDB, actions } from '../../lib/store';
import { useTheme } from '../../lib/theme';
import { MSG_PLACEHOLDERS } from '../../lib/defaults';
import { whatsappMessage } from '../../lib/pdf';
import * as WhatsApp from '../../../modules/whatsapp-share';
import { Screen, Card, Field, Input, SwitchRow, Hint, Label } from '../../components/ui';

export default function WhatsAppConfig() {
  const db = useDB();
  const c = useTheme();
  const w = db.settings.whatsapp;
  const set = (k, v) => actions.settings((s) => { s.whatsapp[k] = v; });
  const ex = db.orcamentos[0];
  return (
    <Screen>
      <Stack.Screen options={{ title: 'WhatsApp' }} />
      <Card title="Envio">
        <SwitchRow label="Enviar direto para a conversa do cliente" value={w.direto} onChange={(v) => set('direto', v)}
          hint="Abre o WhatsApp já com o PDF anexado na conversa do número cadastrado. Desligado, mostra o menu de compartilhar do Android." />
        {Platform.OS === 'android' && !WhatsApp.isAvailable && <Hint>Envio direto disponível no app instalado (APK). No Expo Go é usado o menu de compartilhar.</Hint>}
      </Card>
      <Card title="Mensagem do orçamento">
        <Input multiline value={w.orcamento} onChangeText={(v) => set('orcamento', v)} />
        {ex && <><Label>Exemplo</Label><Text style={{ color: c.text2, fontStyle: 'italic' }}>{whatsappMessage(db, 'orcamento', ex)}</Text></>}
      </Card>
      <Card title="Mensagem do contrato">
        <Input multiline value={w.contrato} onChangeText={(v) => set('contrato', v)} />
      </Card>
      <Card title="Variáveis">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {MSG_PLACEHOLDERS.map(([k, l]) => (
            <Pressable key={k} onPress={() => set('orcamento', `${w.orcamento} {{${k}}}`)} style={{ borderWidth: 1, borderColor: c.line, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5 }}>
              <Text style={{ color: c.text2, fontSize: 12.5 }}>{l}</Text>
            </Pressable>
          ))}
        </View>
        <Hint>Toque para acrescentar à mensagem do orçamento. A legenda vai junto com o PDF.</Hint>
      </Card>
    </Screen>
  );
}
