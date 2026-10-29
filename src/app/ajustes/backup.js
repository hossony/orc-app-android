import React from 'react';
import { Text, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import { useDB, getState, replaceAll, flush, loadDemo } from '../../lib/store';
import { useTheme } from '../../lib/theme';
import { emptyDB } from '../../lib/defaults';
import { today } from '../../lib/utils';
import { Screen, Card, Btn, Hint, toast, confirm } from '../../components/ui';

export default function Backup() {
  const db = useDB();
  const c = useTheme();
  const size = JSON.stringify(db).length;

  const exportar = async () => {
    flush();
    const content = JSON.stringify(getState());
    if (Platform.OS === 'web') return toast('Backup disponível no celular');
    const f = new File(Paths.cache, `hossony-orcamentos-backup-${today()}.json`);
    if (f.exists) f.delete();
    f.create(); f.writeSync(content);
    await Sharing.shareAsync(f.uri, { mimeType: 'application/json', dialogTitle: 'Salvar backup' });
  };

  const importar = async () => {
    const r = await DocumentPicker.getDocumentAsync({ type: ['application/json', '*/*'], copyToCacheDirectory: true });
    if (r.canceled || !r.assets?.[0]) return;
    try {
      const data = JSON.parse(await new File(r.assets[0].uri).text());
      if (!data.settings || !Array.isArray(data.orcamentos)) throw new Error('Arquivo não é um backup do Hossony Orçamentos');
      if (!(await confirm('Restaurar backup?', `${data.orcamentos.length} orçamentos, ${data.contratos?.length || 0} contratos e ${data.clientes?.length || 0} clientes. Os dados atuais serão substituídos.`, 'Restaurar', true))) return;
      replaceAll(data);
      toast('Backup restaurado');
    } catch (e) { toast('Falha: ' + e.message); }
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Backup e restauração' }} />
      <Card title="Seus dados">
        <Text style={{ color: c.text }}>{db.orcamentos.length} orçamentos · {db.contratos.length} contratos · {db.clientes.length} clientes</Text>
        <Hint>Tudo fica salvo no próprio celular e funciona sem internet. O app guarda também uma cópia de segurança diária. Tamanho atual: {(size / 1024).toFixed(0)} KB.</Hint>
      </Card>
      <Card title="Backup">
        <Btn variant="primary" icon="cloud-upload-outline" title="Exportar backup" onPress={exportar} />
        <Hint>Envie o arquivo para o Google Drive, e-mail ou WhatsApp. Faça isso de vez em quando — se o celular for perdido ou formatado, é o backup que recupera tudo.</Hint>
        <Btn icon="cloud-download-outline" title="Restaurar de um arquivo" onPress={importar} />
      </Card>
      <Card title="Demonstração">
        <Btn icon="sparkles-outline" title="Criar exemplos" onPress={async () => {
          if (!(await confirm('Criar exemplos?', 'Adiciona 2 clientes e 2 orçamentos de exemplo.', 'Criar'))) return;
          const id = loadDemo(); toast('Exemplos criados'); router.push(`/orcamento/${id}`);
        }} />
      </Card>
      <Card title="Zona de perigo">
        <Btn variant="danger" icon="trash-outline" title="Apagar todos os dados" onPress={async () => {
          if (!(await confirm('Apagar tudo?', 'Orçamentos, contratos, clientes e configurações serão apagados. Exporte um backup antes.', 'Apagar', true))) return;
          if (!(await confirm('Tem certeza?', 'Esta ação não pode ser desfeita.', 'Apagar tudo', true))) return;
          replaceAll(emptyDB()); toast('Dados apagados');
        }} />
      </Card>
    </Screen>
  );
}
