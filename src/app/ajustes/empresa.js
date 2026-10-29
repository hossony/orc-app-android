import React from 'react';
import { View, Image } from 'react-native';
import { Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useDB, actions } from '../../lib/store';
import { Screen, Card, Field, Input, Btn, Row, Hint, toast } from '../../components/ui';
import { SignatureField } from '../../components/biz';

export default function Empresa() {
  const db = useDB();
  const e = db.settings.empresa;
  const set = (k, v) => actions.settings((s) => { s.empresa[k] = v; });
  const F = (k, label, extra = {}) => <Field key={k} label={label} style={extra.style}><Input value={e[k] || ''} onChangeText={(t) => set(k, t)} {...extra} /></Field>;

  const pickLogo = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], base64: true, quality: 0.6, allowsEditing: true });
    if (r.canceled || !r.assets?.[0]?.base64) return;
    const a = r.assets[0];
    set('logo', `data:${a.mimeType || 'image/jpeg'};base64,${a.base64}`);
    toast('Logo atualizada');
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Dados da luthieria' }} />
      <Card title="Logo">
        <View style={{ alignItems: 'center' }}>
          {e.logo ? <Image source={{ uri: e.logo }} style={{ width: 160, height: 100, backgroundColor: '#fff', borderRadius: 10 }} resizeMode="contain" /> : <Hint>Nenhuma logo cadastrada.</Hint>}
        </View>
        <Row>
          <Btn flex icon="image-outline" title={e.logo ? 'Trocar logo' : 'Escolher logo'} onPress={pickLogo} />
          {e.logo ? <Btn variant="danger" icon="trash-outline" onPress={() => set('logo', '')} /> : null}
        </Row>
      </Card>
      <Card title="Identificação">
        {F('fantasia', 'Nome fantasia (marca)')}
        {F('nome', 'Razão social / nome')}
        {F('slogan', 'Slogan / descrição')}
        {F('responsavel', 'Luthier responsável')}
        <Row>{F('documento', 'CNPJ / CPF', { keyboardType: 'numeric' })}{F('ie', 'Insc. estadual')}</Row>
      </Card>
      <Card title="Contato e endereço">
        <Row>{F('whatsapp', 'WhatsApp', { keyboardType: 'phone-pad' })}{F('telefone', 'Telefone', { keyboardType: 'phone-pad' })}</Row>
        {F('email', 'E-mail', { keyboardType: 'email-address', autoCapitalize: 'none' })}
        <Row>{F('site', 'Site', { autoCapitalize: 'none' })}{F('instagram', 'Instagram', { autoCapitalize: 'none' })}</Row>
        {F('endereco', 'Endereço (rua, número, bairro)')}
        <Row>{F('cidade', 'Cidade', { style: { flex: 2 } })}{F('uf', 'UF', { maxLength: 2, autoCapitalize: 'characters' })}{F('cep', 'CEP', { keyboardType: 'numeric', style: { flex: 1.4 } })}</Row>
        {F('chavePix', 'Chave PIX', { autoCapitalize: 'none' })}
      </Card>
      <Card title="Assinatura padrão do luthier">
        <Hint>Aparece nos orçamentos e já vem preenchida nos contratos novos.</Hint>
        <SignatureField value={e.assinatura} signer={e.responsavel || e.nome} onChange={(v) => set('assinatura', v)} />
      </Card>
    </Screen>
  );
}
