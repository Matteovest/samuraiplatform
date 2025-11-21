/**
 * Script di utilità per configurare i canali da monitorare
 */

import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import input from 'input';
import dotenv from 'dotenv';
import { resolve } from 'path';
import * as fs from 'fs-extra';

// Carica il file .env
dotenv.config({ path: resolve(__dirname, '.env') });

const apiId = parseInt(process.env.TELEGRAM_API_ID || '');
const apiHash = process.env.TELEGRAM_API_HASH || '';
const stringSession = process.env.TELEGRAM_STRING_SESSION || '';

if (!apiId || !apiHash) {
  console.error('❌ Errore: TELEGRAM_API_ID e TELEGRAM_API_HASH devono essere configurati nel file .env');
  process.exit(1);
}

const client = new TelegramClient(new StringSession(stringSession), apiId, apiHash, {
  connectionRetries: 5,
});

async function listDialogs() {
  console.log('📋 Caricamento chat e canali...\n');
  
  const dialogs = await client.getDialogs();
  
  console.log('📂 Chat e Canali disponibili:\n');
  console.log('─'.repeat(60));
  
  dialogs.forEach((dialog: any, index: number) => {
    const chat = dialog.entity;
    const title = (chat as any).title || `${(chat as any).firstName || ''} ${(chat as any).lastName || ''}`.trim() || 'Chat senza nome';
    const username = (chat as any).username ? `@${(chat as any).username}` : '';
    const chatId = chat.id.toString();
    const type = (chat as any).className || 'Unknown';
    
    console.log(`${index + 1}. ${title}`);
    console.log(`   ID: ${chatId}`);
    if (username) console.log(`   Username: ${username}`);
    console.log(`   Tipo: ${type}`);
    console.log('');
  });
  
  console.log('─'.repeat(60));
  console.log('\n💡 Usa ID, Username o Nome per configurare TELEGRAM_CHANNELS nel file .env');
  console.log('   Esempio: TELEGRAM_CHANNELS=@channel1,1234567890,nome_canale\n');
}

async function selectChannels() {
  console.log('🔧 Configurazione canali da monitorare\n');
  
  await listDialogs();
  
  const selected = await input.text('Inserisci i canali da monitorare (separati da virgola): ');
  const channels = selected.split(',').map((c: string) => c.trim()).filter((c: string) => c);
  
  if (channels.length === 0) {
    console.log('❌ Nessun canale selezionato');
    return;
  }
  
  console.log('\n✅ Canali selezionati:');
  channels.forEach((ch: string) => console.log(`   - ${ch}`));
  
  // Leggi il file .env
  const envPath = resolve(__dirname, '.env');
  let envContent = '';
  
  if (await fs.pathExists(envPath)) {
    envContent = await fs.readFile(envPath, 'utf-8');
  } else {
    // Crea un file .env di base
    envContent = `TELEGRAM_API_ID=${apiId}
TELEGRAM_API_HASH=${apiHash}
TELEGRAM_STRING_SESSION=${stringSession}
`;
  }
  
  // Aggiorna o aggiungi TELEGRAM_CHANNELS
  const channelsValue = channels.join(',');
  
  if (envContent.includes('TELEGRAM_CHANNELS=')) {
    envContent = envContent.replace(
      /TELEGRAM_CHANNELS=.*/,
      `TELEGRAM_CHANNELS=${channelsValue}`
    );
  } else {
    envContent += `TELEGRAM_CHANNELS=${channelsValue}\n`;
  }
  
  // Salva il file .env
  await fs.writeFile(envPath, envContent);
  
  console.log(`\n✅ Configurazione salvata in ${envPath}`);
  console.log('🔄 Riavvia il bot per applicare le modifiche\n');
}

async function main() {
  console.log('🚀 Setup Canali Telegram Bot\n');
  
  await client.start({
    phoneNumber: async () => await input.text('📱 Numero di telefono: '),
    password: async () => await input.text('🔐 Password 2FA (se presente): '),
    phoneCode: async () => await input.text('✉️ Codice di verifica: '),
    onError: (err: any) => console.error('❌ Errore:', err),
  });
  
  const choice = await input.text('\nScegli un\'opzione:\n1. Lista chat/canali\n2. Configura canali da monitorare\nScelta (1 o 2): ');
  
  if (choice === '1') {
    await listDialogs();
  } else if (choice === '2') {
    await selectChannels();
  } else {
    console.log('❌ Scelta non valida');
  }
  
  await client.disconnect();
}

main().catch(console.error);

