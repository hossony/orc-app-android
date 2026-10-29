// Envio direto de PDF para o WhatsApp (módulo nativo local, só Android).
// Se o módulo não estiver disponível (ex.: Expo Go), o app usa o compartilhamento padrão.
import { requireOptionalNativeModule } from 'expo-modules-core';

const Native = requireOptionalNativeModule('WhatsappShare');

export const isAvailable = !!Native;

/**
 * Abre o WhatsApp com o arquivo anexado.
 * @param {string} fileUri  file:// do PDF (cache ou documentos do app)
 * @param {string|null} phone  número com DDI (ex.: 5514999999999) para abrir direto na conversa
 * @param {string|null} text  legenda/mensagem
 * @returns {Promise<boolean>} false se o WhatsApp não estiver instalado
 */
export async function sendFile(fileUri, phone, text) {
  if (!Native) return false;
  return Native.sendFile(fileUri, phone || null, text || null);
}
