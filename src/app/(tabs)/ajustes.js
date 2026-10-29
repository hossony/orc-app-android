import React from 'react';
import { View, ScrollView, Text, Image } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { useDB } from '../../lib/store';
import { useTheme } from '../../lib/theme';
import { ListItem, Icon } from '../../components/ui';

const GRUPOS = [
  ['Luthieria', [
    ['empresa', 'business-outline', 'Dados da luthieria', 'Nome, logo, contatos, PIX e assinatura'],
    ['aparencia', 'color-palette-outline', 'Aparência', 'Tema claro/escuro e cor'],
  ]],
  ['Orçamentos', [
    ['servicos', 'construct-outline', 'Tipos de serviço', 'Prazo, sinal, garantia e contrato padrão'],
    ['catalogo', 'pricetags-outline', 'Tabela de preços', 'Serviços com valor para adicionar rápido'],
    ['listas', 'musical-notes-outline', 'Tipos de instrumento', 'Violino, viola, violoncelo…'],
    ['campos', 'options-outline', 'Campos personalizados', 'Especificações e dados extras'],
    ['textos', 'text-outline', 'Textos e numeração', 'Condições, garantia, validade, prefixos'],
  ]],
  ['Contratos', [
    ['modelos', 'reader-outline', 'Modelos de contrato', 'Edite cláusulas e variáveis'],
  ]],
  ['Envio', [
    ['pdf', 'document-outline', 'Layout do PDF', 'Tamanho, fonte, margens e o que aparece'],
    ['whatsapp', 'logo-whatsapp', 'WhatsApp', 'Mensagens padrão e envio direto'],
  ]],
  ['Dados', [
    ['backup', 'cloud-download-outline', 'Backup e restauração', 'Exportar, importar, demonstração'],
  ]],
];

export default function Ajustes() {
  const db = useDB();
  const c = useTheme();
  const e = db.settings.empresa;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 14, gap: 16, paddingBottom: 40 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: c.line }}>
        {e.logo ? <Image source={{ uri: e.logo }} style={{ width: 52, height: 52, borderRadius: 10, backgroundColor: '#fff' }} resizeMode="contain" />
          : <View style={{ width: 52, height: 52, borderRadius: 12, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#fff', fontSize: 26, fontWeight: '800', fontFamily: 'serif' }}>H</Text></View>}
        <View style={{ flex: 1 }}>
          <Text style={{ color: c.text, fontSize: 18, fontWeight: '800' }}>{e.fantasia || e.nome}</Text>
          <Text style={{ color: c.muted }}>{db.orcamentos.length} orçamentos · {db.contratos.length} contratos · {db.clientes.length} clientes</Text>
        </View>
      </View>
      {GRUPOS.map(([titulo, itens]) => (
        <View key={titulo} style={{ gap: 6 }}>
          <Text style={{ color: c.muted, fontWeight: '700', fontSize: 12.5, textTransform: 'uppercase', letterSpacing: 0.6, paddingHorizontal: 4 }}>{titulo}</Text>
          <View style={{ backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.line, overflow: 'hidden' }}>
            {itens.map(([rota, icon, t, sub], i) => (
              <ListItem key={rota} last={i === itens.length - 1} onPress={() => router.push(`/ajustes/${rota}`)} title={t} subtitle={sub}
                left={<View style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: c.accent + '22', alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={18} color={c.accent} /></View>} />
            ))}
          </View>
        </View>
      ))}
      <Text style={{ color: c.muted, textAlign: 'center', fontSize: 12 }}>Hossony Orçamentos v{Constants.expoConfig?.version || '1.0.0'} · funciona offline</Text>
    </ScrollView>
  );
}
