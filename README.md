# Hossony Orçamentos (Android)

App de celular para criar **orçamentos** e **contratos** da luthieria, gerar **PDF** e enviar pelo **WhatsApp**. Funciona totalmente offline e tudo é personalizável em **Ajustes**.

Feito com React Native + Expo (SDK 58). Não precisa de Play Store — gera um APK para instalar direto no celular.

## O que o app faz

- **Orçamentos**: cliente, tipo de serviço, instrumento, especificações (madeiras, verniz, voluta…), itens com tabela de preços, desconto, acréscimo, sinal, validade, prazo, condições e assinatura de aceite do cliente na tela. Salva sozinho enquanto você digita.
- **Contratos**: gerados a partir do orçamento com modelos editáveis (construção, restauração, consignação). Variáveis como `{{cliente.nome}}` e `{{ordem.total}}` são preenchidas automaticamente. Modo "Ler e assinar" para o cliente, assinatura do luthier e de testemunhas.
- **PDF**: prévia na tela, abrir no leitor de PDF ou compartilhar (Drive, e-mail, etc.).
- **WhatsApp**: envia o PDF **direto na conversa do cliente** com mensagem pronta (editável). Se não der, abre o menu de compartilhar do Android.
- **Clientes**: cadastro com busca de CEP (quando tiver internet), histórico de orçamentos e contratos.
- **Ajustes**: dados e logo da luthieria, assinatura padrão, PIX, tema claro/escuro e cor, tipos de serviço (prazo, sinal, garantia, contrato padrão), tabela de preços, tipos de instrumento, campos personalizados, textos padrão, numeração, modelos de contrato, layout do PDF (A4/A5/Carta, fonte, margens, o que aparece), mensagens do WhatsApp, backup/restauração.

Os dados ficam num arquivo dentro do próprio app, com cópia de segurança diária. Use **Ajustes → Backup** para exportar de vez em quando (Drive ou WhatsApp).

## Gerar o APK

### Opção 1 — Na nuvem com EAS (mais fácil, não precisa de Android Studio)

1. Instale o Node.js 20+ (https://nodejs.org).
2. Na pasta do projeto:
   ```bash
   npm install
   npx eas-cli@latest login        # crie uma conta gratuita em expo.dev se não tiver
   npx eas-cli@latest build -p android --profile preview
   ```
   (ou `npm run apk`). Na primeira vez ele pergunta se pode criar a chave de assinatura — responda **sim**.
3. Ao terminar, ele mostra um link e QR code para baixar o **.apk**. Abra no celular do seu pai e instale (o Android vai pedir para permitir "instalar apps desconhecidos").

### Opção 2 — Local, com Android Studio

Requer Android Studio (SDK + JDK 17).

```bash
npm install
npx expo prebuild -p android
cd android
./gradlew assembleRelease
```

O APK sai em `android/app/build/outputs/apk/release/app-release.apk`.

### Testar rápido antes de gerar o APK

`npx expo start` e abra com o app **Expo Go** (versão do SDK 58). Tudo funciona, só o envio direto ao WhatsApp cai no menu de compartilhar — o envio direto usa um módulo nativo que só existe no APK.

### Atualizar o app depois

Gere um novo APK com a mesma conta/chave e instale por cima. Antes, aumente `version` em `app.json`. Os dados são mantidos.

## Estrutura

```
src/app/                 telas (Expo Router)
  (tabs)/                Orçamentos, Contratos, Clientes, Ajustes
  orcamento/[id].js      editor de orçamento
  contrato/[id].js       editor de contrato
  cliente/[id].js        cadastro de cliente
  preview.js             prévia do PDF
  ajustes/               todas as configurações
src/lib/                 dados, PDF, WhatsApp, utilitários, padrões
src/components/          componentes de tela
modules/whatsapp-share/  módulo nativo (Kotlin) para enviar o PDF direto na conversa
```

Os modelos de contrato são um ponto de partida — vale revisar com um advogado antes do uso comercial.
