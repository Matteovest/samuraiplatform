import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { NewMessage } from 'telegram/events';
import input from 'input';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { MessageParser } from './parser';
import { TradingViewDrawer } from './tradingview-drawer';
import { TradingViewLinkExtractor } from './tradingview-extractor';
import { ImageAnalyzer } from './image-analyzer';
import { OrderStorage } from './order-storage';
import { OrderValidator } from './order-validator';
import { Logger, LogLevel } from './logger';
import { BrokerManager } from './broker-manager';
import { OrderExecutor, ExecutionConfig } from './order-executor';
import { RiskManager } from './risk-manager';
import { PositionMonitor } from './position-monitor';
import { StatisticsTracker, NotionConfig } from './statistics-tracker';

// Carica il file .env dalla cartella bot/
dotenv.config({ path: resolve(__dirname, '.env') });

// Configurazione
const apiId = parseInt(process.env.TELEGRAM_API_ID || '');
const apiHash = process.env.TELEGRAM_API_HASH || '';
const stringSession = process.env.TELEGRAM_STRING_SESSION || '';

// Controlla se usare Bot Token (alternativa limitata) o Userbot API
const botToken = process.env.TELEGRAM_BOT_TOKEN || '';

if (!apiId || !apiHash) {
  if (botToken) {
    console.error('⚠️ ATTENZIONE: Hai configurato un Bot Token ma questo bot richiede API ID e API Hash per funzionare come userbot.');
    console.error('❌ Un token BotFather NON può essere usato come alternativa!');
    console.log('\n📝 I motivi:');
    console.log('   - Bot Token: Per bot ufficiali (account separato)');
    console.log('   - API ID/Hash: Per userbot (collegato al tuo account)');
    console.log('   - Sono SISTEMI DIVERSI e non intercambiabili');
    console.log('\n📝 Per ottenere API ID e API Hash:');
    console.log('   1. Vai su https://my.telegram.org/apps');
    console.log('   2. Accedi con il tuo numero Telegram');
    console.log('   3. Crea una nuova applicazione');
    console.log('   4. Copia API ID e API Hash');
    console.log('\n🔧 Se non riesci ad accedere, prova:');
    console.log('   - Browser diverso (Chrome, Safari, Firefox)');
    console.log('   - Dispositivo diverso (computer, tablet)');
    console.log('   - Rete diversa (WiFi, mobile data)');
    console.log('   - Modalità incognito/privata');
    console.log('\n📚 Vedi bot/ALTERNATIVE_SETUP.md per soluzioni dettagliate\n');
  } else {
    console.error('❌ Errore: TELEGRAM_API_ID e TELEGRAM_API_HASH devono essere configurati nel file .env');
    console.log('\n📝 Per ottenere le credenziali:');
    console.log('   1. Vai su https://my.telegram.org/apps');
    console.log('   2. Accedi con il tuo numero Telegram');
    console.log('   3. Crea una nuova applicazione');
    console.log('   4. Copia API ID e API Hash');
    console.log('\n🔧 Se hai problemi ad accedere, vedi bot/ALTERNATIVE_SETUP.md\n');
  }
  process.exit(1);
}

const client = new TelegramClient(new StringSession(stringSession), apiId, apiHash, {
  connectionRetries: 5,
});

const messageParser = new MessageParser();
const tradingViewDrawer = new TradingViewDrawer(process.env.TRADINGVIEW_HEADLESS === 'true');
const tradingViewExtractor = new TradingViewLinkExtractor();
const imageAnalyzer = new ImageAnalyzer('./temp');
const orderStorage = new OrderStorage('./temp/orders');
const orderValidator = new OrderValidator();
const logger = new Logger('./temp/logs', LogLevel.INFO);
const brokerManager = new BrokerManager(process.env.TRADINGVIEW_HEADLESS === 'true');

// Configurazione broker se specificata
if (process.env.TRADINGVIEW_BROKER) {
  brokerManager.addBroker({
    name: process.env.TRADINGVIEW_BROKER,
    brokerId: process.env.TRADINGVIEW_BROKER,
    accountType: (process.env.TRADINGVIEW_ACCOUNT_TYPE || 'demo') as 'demo' | 'live',
  });
}

// Configurazione order executor
const executionConfig: ExecutionConfig = {
  broker: process.env.TRADINGVIEW_BROKER || '',
  defaultVolume: parseFloat(process.env.DEFAULT_VOLUME || '0.01'),
  maxVolume: process.env.MAX_VOLUME ? parseFloat(process.env.MAX_VOLUME) : undefined,
  minVolume: process.env.MIN_VOLUME ? parseFloat(process.env.MIN_VOLUME) : undefined,
  autoPlaceOrders: process.env.AUTO_EXECUTE_ORDERS === 'true',
  checkSpread: process.env.CHECK_SPREAD === 'true',
};

const orderExecutor = new OrderExecutor(
  brokerManager,
  orderValidator,
  logger,
  orderStorage,
  executionConfig
);

// Risk Manager (0.4% per operazione con interesse composto)
const accountBalance = parseFloat(process.env.ACCOUNT_BALANCE || '10000'); // Default $10k
const riskPercent = parseFloat(process.env.RISK_PERCENT || '0.4'); // 0.4%
const riskManager = new RiskManager(accountBalance, riskPercent);

// Carica balance salvato (con interesse composto) se esiste
riskManager.loadBalance('./temp/balance.json').then(() => {
  console.log(`💰 Balance iniziale: $${riskManager.getBalance().toFixed(2)}\n`);
});

// Salva balance automaticamente ogni 10 minuti (con interesse composto)
setInterval(async () => {
  await riskManager.saveBalance('./temp/balance.json');
}, 10 * 60 * 1000); // 10 minuti

// Position Monitor
const positionMonitor = new PositionMonitor(
  orderStorage,
  brokerManager,
  riskManager,
  logger,
  parseFloat(process.env.BREAKEVEN_PIPS || '2') // 2 pip per BE
);

// Statistics Tracker
const statisticsTracker = new StatisticsTracker(orderStorage, logger, './temp/stats');

// Configura Notion se specificato
if (process.env.NOTION_API_KEY && process.env.NOTION_DATABASE_ID) {
  statisticsTracker.configureNotion({
    apiKey: process.env.NOTION_API_KEY,
    databaseId: process.env.NOTION_DATABASE_ID,
    enabled: process.env.NOTION_ENABLED === 'true',
  });
}

async function main() {
  console.log('🚀 Avvio del bot Telegram...\n');

  await client.start({
    phoneNumber: async () => await input.text('📱 Inserisci il tuo numero di telefono: '),
    password: async () => await input.text('🔐 Inserisci la password 2FA (se presente): '),
    phoneCode: async () => await input.text('✉️ Inserisci il codice ricevuto: '),
    onError: (err: any) => console.error('❌ Errore durante l\'accesso:', err),
  });

  // Salva la sessione
  const sessionString = client.session.save() as unknown as string;
  console.log('\n✅ Sessione salvata. Aggiungi questa riga al tuo file .env:');
  console.log(`TELEGRAM_STRING_SESSION=${sessionString}\n`);

  console.log('✅ Connesso a Telegram!\n');
  
  // Mostra informazioni account
  const me = await client.getMe();
  console.log(`👤 Account connesso: ${me.firstName || ''} ${me.lastName || ''} (@${me.username || 'N/A'})\n`);

  // Inizializza il worker OCR (può richiedere qualche secondo)
  console.log('🔧 Inizializzazione OCR...\n');
  try {
    await imageAnalyzer.initWorker();
    console.log('✅ OCR inizializzato correttamente\n');
  } catch (error) {
    console.error('⚠️ Errore durante l\'inizializzazione OCR:', error);
    console.log('⚠️ L\'analisi delle immagini potrebbe non funzionare correttamente\n');
  }

  // Inizializza broker manager se configurato
  if (process.env.TRADINGVIEW_BROKER) {
    console.log(`🔧 Inizializzazione broker manager...\n`);
    try {
      await brokerManager.init();
      const connected = await brokerManager.connectToBroker(process.env.TRADINGVIEW_BROKER);
      if (connected) {
        console.log(`✅ Broker manager inizializzato: ${process.env.TRADINGVIEW_BROKER}\n`);
        
        if (executionConfig.autoPlaceOrders) {
          console.log(`🤖 Esecuzione automatica ordini: ATTIVA\n`);
        } else {
          console.log(`💡 Esecuzione automatica ordini: DISATTIVA (imposta AUTO_EXECUTE_ORDERS=true per abilitare)\n`);
        }
      } else {
        console.log(`⚠️ Broker non connesso. Assicurati di essere loggato su TradingView e collegato a ${process.env.TRADINGVIEW_BROKER}\n`);
      }
    } catch (error) {
      console.error('⚠️ Errore durante l\'inizializzazione broker manager:', error);
      console.log('⚠️ L\'esecuzione automatica ordini potrebbe non funzionare\n');
    }
  }

  // Lista di chat/canali da monitorare (configurabile via env)
  const channelsToMonitor = process.env.TELEGRAM_CHANNELS?.split(',').map(c => c.trim()).filter(c => c) || [];
  
  if (channelsToMonitor.length > 0) {
    console.log(`📡 Monitoraggio canali configurati:`);
    channelsToMonitor.forEach(channel => {
      console.log(`   - ${channel}`);
    });
    console.log('');
  } else {
    console.log(`📡 Monitoraggio TUTTI i messaggi (nessun filtro configurato)\n`);
    console.log(`💡 Per monitorare canali specifici, aggiungi TELEGRAM_CHANNELS nel file .env`);
    console.log(`   Esempio: TELEGRAM_CHANNELS=@channel1,@channel2,nome_canale\n`);
  }
  
  console.log('👂 In ascolto di nuovi messaggi...\n');

  // Event handler per nuovi messaggi
  client.addEventHandler(async (event: NewMessage) => {
    const message = event.message;
    
    // Ignora i propri messaggi
    if (message.out) return;

    const chat = await message.getChat();
    const chatTitle = chat.title || (chat as any).username || 'Chat sconosciuta';
    
    // Filtra solo i canali specificati (se configurati)
    if (channelsToMonitor.length > 0) {
      const chatId = chat.id.toString();
      const chatUsername = (chat as any).username;
      const matches = channelsToMonitor.some(channel => 
        chatId === channel || 
        chatUsername === channel.replace('@', '') ||
        chatTitle === channel
      );
      if (!matches) return;
    }

    // Estrai il testo del messaggio
    const messageText = message.message || '';
    const messageId = message.id;

    console.log(`📨 Nuovo messaggio da ${chatTitle}:`);
    console.log(`   "${messageText.substring(0, 100)}${messageText.length > 100 ? '...' : ''}"\n`);

    let orderData: {
      orderType?: 'long' | 'short' | 'buy' | 'sell';
      symbol?: string;
      entry?: string;
      takeProfit?: string;
      stopLoss?: string;
    } = {};

    // 1. PRIMA: Controlla se c'è un'immagine allegata (screenshot TradingView)
    let imagePath: string | null = null;
    
    if (message.photo || message.media) {
      console.log('🖼️ Immagine rilevata nel messaggio\n');
      
      try {
        // Scarica l'immagine dal messaggio Telegram
        imagePath = await imageAnalyzer.downloadTelegramImage(client, message);
        
        if (imagePath) {
          console.log('✅ Immagine scaricata, avvio analisi...\n');
          
          // Analizza l'immagine per estrarre livelli di prezzo
          const imageAnalysis = await imageAnalyzer.analyzeTradingViewImage(imagePath);
          
          if (imageAnalysis.orderType || imageAnalysis.entry || imageAnalysis.prices?.length) {
            console.log('📊 Analisi immagine completata:\n');
            console.log(`   Tipo ordine: ${imageAnalysis.orderType || 'N/A'}`);
            console.log(`   Simbolo: ${imageAnalysis.symbol || 'N/A'}`);
            console.log(`   Entry: ${imageAnalysis.entry || 'N/A'}`);
            console.log(`   Take Profit: ${imageAnalysis.takeProfit || 'N/A'}`);
            console.log(`   Stop Loss: ${imageAnalysis.stopLoss || 'N/A'}`);
            console.log(`   Prezzi rilevati: ${imageAnalysis.prices?.join(', ') || 'N/A'}\n`);
            
            // Se ci sono TP multipli dall'immagine, aggiungili
            if (imageAnalysis.prices && imageAnalysis.prices.length > 3) {
              const sortedPrices = [...imageAnalysis.prices].sort((a, b) => b - a);
              const orderIsLong = imageAnalysis.orderType === 'long' || imageAnalysis.orderType === 'buy';
              const tpPrices = orderIsLong ? sortedPrices.slice(0, -1) : sortedPrices.slice(1);
              console.log(`   📊 TP multipli rilevati: ${tpPrices.join(', ')}\n`);
            }
            
            // Usa i dati dall'analisi dell'immagine
            orderData = {
              orderType: imageAnalysis.orderType,
              symbol: imageAnalysis.symbol,
              entry: imageAnalysis.entry,
              takeProfit: imageAnalysis.takeProfit,
              stopLoss: imageAnalysis.stopLoss,
            };
          } else {
            console.log('⚠️ Nessun dato estratto dall\'immagine\n');
          }
          
          // Pulisci il file temporaneo dopo l'analisi
          await imageAnalyzer.cleanup(imagePath);
        }
      } catch (error) {
        console.error('❌ Errore durante l\'analisi dell\'immagine:', error);
      }
    }

    // 2. SECONDA: Estrai link TradingView dal messaggio (per il disegno)
    const tradingViewLinks = tradingViewExtractor.extractLinks(messageText);
    
    if (tradingViewLinks.length > 0) {
      console.log(`🔗 Trovati ${tradingViewLinks.length} link TradingView\n`);
      
      for (const link of tradingViewLinks) {
        console.log(`   📊 Link: ${link}\n`);
        
        // Estrai informazioni dal link (simbolo se non già trovato)
        const linkInfo = tradingViewExtractor.extractInfoFromLink(link);
        if (linkInfo.symbol && !orderData.symbol) {
          orderData.symbol = linkInfo.symbol;
          console.log(`   📈 Simbolo dal link: ${linkInfo.symbol}\n`);
        }
      }
    }

    // 3. TERZA: Analizza il testo del messaggio (come fallback o integrazione)
    const parsedMessage = messageParser.parse(messageText);
    
    // 3a. GESTIONE MESSAGGI BREAK EVEN
    if (parsedMessage.isBreakEvenUpdate) {
      console.log('🔧 Messaggio Break Even rilevato\n');
      console.log(`   📋 Riferimento ordine: ${parsedMessage.referenceOrderId || 'N/A'}\n`);
      
      try {
        const beResult = await positionMonitor.handleBreakEvenMessage(
          parsedMessage.referenceOrderId,
          parsedMessage.orderType,
          parsedMessage.symbol
        );
        
        if (beResult) {
          console.log('✅ Stop Loss spostato a Break Even con successo!\n');
          logger.info('SL spostato a BE', {
            referenceOrderId: parsedMessage.referenceOrderId,
            symbol: parsedMessage.symbol,
          });
        } else {
          console.log('⚠️ Impossibile spostare SL a BE (ordine non trovato)\n');
          logger.warn('Impossibile spostare SL a BE', {
            referenceOrderId: parsedMessage.referenceOrderId,
          });
        }
      } catch (error) {
        console.error('❌ Errore durante gestione BE:', error);
        logger.error('Errore gestione BE', error);
      }
      
      console.log('─'.repeat(60) + '\n');
      return; // Esci dopo aver gestito il messaggio BE
    }
    
    // Integra i dati dal testo se mancanti dall'immagine
    if (!orderData.orderType && parsedMessage.orderType) {
      orderData.orderType = parsedMessage.orderType;
    }
    if (!orderData.symbol && parsedMessage.symbol) {
      orderData.symbol = parsedMessage.symbol;
    }
    if (!orderData.entry && parsedMessage.entry) {
      orderData.entry = parsedMessage.entry;
    }
    if (!orderData.takeProfit && parsedMessage.takeProfit) {
      orderData.takeProfit = parsedMessage.takeProfit;
    }
    if (!orderData.stopLoss && parsedMessage.stopLoss) {
      orderData.stopLoss = parsedMessage.stopLoss;
    }

    // 4. Processa l'ordine se abbiamo dati sufficienti
    if (orderData.orderType || orderData.entry || parsedMessage.hasOrder) {
      console.log(`✅ Ordine rilevato: ${orderData.orderType?.toUpperCase() || parsedMessage.orderType?.toUpperCase() || 'N/A'}\n`);
      console.log(`   💰 Entry: ${orderData.entry || 'N/A'}`);
      console.log(`   🎯 Take Profit: ${orderData.takeProfit || 'N/A'}`);
      console.log(`   🛑 Stop Loss: ${orderData.stopLoss || 'N/A'}`);
      console.log(`   📊 Simbolo: ${orderData.symbol || 'N/A'}\n`);

      // Mostra variabili aggiuntive se presenti
      if (parsedMessage.riskReward) {
        console.log(`   📊 Risk/Reward: ${parsedMessage.riskReward}:1`);
      }
      if (parsedMessage.leverage) {
        console.log(`   ⚖️ Leverage: ${parsedMessage.leverage}x`);
      }
      if (parsedMessage.timeframe) {
        console.log(`   ⏰ Timeframe: ${parsedMessage.timeframe}`);
      }
      if (parsedMessage.multipleTP && parsedMessage.multipleTP.length > 0) {
        console.log(`   🎯 TP Multipli: ${parsedMessage.multipleTP.join(', ')}`);
      }
      console.log('');

      // Validazione ordine
      const validation = orderValidator.validate(
        orderData.orderType || parsedMessage.orderType,
        orderData.entry || parsedMessage.entry,
        orderData.takeProfit || parsedMessage.takeProfit,
        orderData.stopLoss || parsedMessage.stopLoss,
        orderData.symbol || parsedMessage.symbol
      );

      // Valida TP multipli se presenti
      if (parsedMessage.multipleTP && parsedMessage.multipleTP.length > 0) {
        const tpValidation = orderValidator.validateMultipleTPs(
          orderData.orderType || parsedMessage.orderType,
          orderData.entry || parsedMessage.entry,
          parsedMessage.multipleTP
        );
        
        validation.errors.push(...tpValidation.errors);
        validation.warnings.push(...tpValidation.warnings);
      }

      // Mostra errori di validazione
      if (validation.errors.length > 0) {
        console.log(`⚠️ ERRORI DI VALIDAZIONE:`);
        validation.errors.forEach(err => console.log(`   ❌ ${err}`));
        console.log('');
        logger.warn('Ordine con errori di validazione', { errors: validation.errors });
      }

      // Mostra warning di validazione
      if (validation.warnings.length > 0) {
        console.log(`⚠️ AVVISI:`);
        validation.warnings.forEach(warn => console.log(`   ⚠️ ${warn}`));
        console.log('');
        logger.warn('Ordine con avvisi', { warnings: validation.warnings });
      }

      // Calcola volume basato su Risk Management (0.4%)
      let calculatedVolume = executionConfig.defaultVolume;
      const currentRiskPercent = parseFloat(process.env.RISK_PERCENT || '0.4');
      
      if (orderData.entry && orderData.stopLoss && orderData.symbol) {
        try {
          const riskCalculation = riskManager.calculateLotSize(
            parseFloat(orderData.entry),
            parseFloat(orderData.stopLoss),
            orderData.symbol
          );
          
          calculatedVolume = riskCalculation.lotSize;
          
          console.log(`💰 Risk Management (${currentRiskPercent}%):`);
          console.log(`   Balance: $${riskManager.getBalance().toFixed(2)}`);
          console.log(`   Risk Amount: $${riskCalculation.riskAmount.toFixed(2)}`);
          console.log(`   SL Distance: ${riskCalculation.maxLoss} pips`);
          console.log(`   Volume Calcolato: ${calculatedVolume.toFixed(2)} lot\n`);
          
          logger.info('Volume calcolato con risk management', riskCalculation);
          
          // Valida che il rischio sia accettabile (max 1%)
          const riskValidation = riskManager.validateRisk(
            parseFloat(orderData.entry),
            parseFloat(orderData.stopLoss),
            orderData.symbol,
            1.0 // Max 1%
          );
          
          if (!riskValidation.valid && riskValidation.actualRiskPercent) {
            console.log(`⚠️ AVVISO RISCHIO: ${riskValidation.warning}\n`);
            logger.warn('Rischio alto rilevato', riskValidation);
          }
        } catch (error) {
          console.log(`⚠️ Errore calcolo volume con risk management, uso default: ${executionConfig.defaultVolume}\n`);
          logger.warn('Errore calcolo volume risk management', error);
        }
      }

      // Salva l'ordine nello storage (solo se valido o con solo warning)
      let orderId: string | null = null;
      if (validation.valid || (validation.errors.length === 0 && validation.warnings.length > 0)) {
        try {
          orderId = await orderStorage.saveOrder({
            channel: chatTitle,
            orderType: orderData.orderType || parsedMessage.orderType!,
            symbol: orderData.symbol || parsedMessage.symbol,
            entry: orderData.entry || parsedMessage.entry,
            takeProfit: orderData.takeProfit || parsedMessage.takeProfit,
            stopLoss: orderData.stopLoss || parsedMessage.stopLoss,
            riskReward: parsedMessage.riskReward,
            leverage: parsedMessage.leverage,
            timeframe: parsedMessage.timeframe,
            multipleTP: parsedMessage.multipleTP,
            breakEven: parsedMessage.breakEven,
            trailingStop: parsedMessage.trailingStop,
            notes: parsedMessage.notes,
            tradingViewLink: tradingViewLinks.length > 0 ? tradingViewLinks[0] : undefined,
            imagePath: imagePath || undefined,
          });
          
          logger.order(orderData, chatTitle);
          console.log(`💾 Ordine salvato con ID: ${orderId}\n`);
        } catch (error) {
          logger.error('Errore durante il salvataggio dell\'ordine', error);
          console.error('❌ Errore durante il salvataggio dell\'ordine:', error);
        }
      }

      // Genera e salva Pine Script (sempre, anche senza link TradingView)
      if (orderData.orderType && orderData.entry) {
        try {
          const pineScript = tradingViewDrawer.generatePineScript(
            orderData.orderType,
            orderData.symbol || 'N/A',
            {
              entry: orderData.entry,
              takeProfit: orderData.takeProfit,
              stopLoss: orderData.stopLoss,
            },
            parsedMessage.multipleTP,
            parsedMessage.riskReward,
            parsedMessage.leverage
          );

          // Salva il Pine Script in un file
          const fs = await import('fs-extra');
          const path = await import('path');
          const filename = `order_${orderData.symbol || 'UNKNOWN'}_${Date.now()}.pine`;
          const filepath = path.join(__dirname, '..', 'temp', filename);
          await fs.ensureDir(path.dirname(filepath));
          await fs.writeFile(filepath, pineScript);
          
          // Aggiorna l'ordine salvato con il path del Pine Script
          if (orderId) {
            // Nota: Questo richiederebbe un metodo updateOrder nello storage
            // Per ora, il path viene salvato nel prossimo ordine
          }
          
          console.log(`📝 Pine Script generato e salvato: ${filepath}`);
          console.log(`💡 Copia lo script in TradingView per vedere i livelli sul grafico\n`);
          logger.info('Pine Script generato', { filepath });
        } catch (error) {
          console.error(`❌ Errore durante la generazione del Pine Script:`, error);
        }
      }

      // Se c'è un link TradingView, disegna sul grafico
      if (tradingViewLinks.length > 0 && orderData.orderType && orderData.symbol) {
        console.log(`🎨 Disegno sul grafico TradingView...\n`);
        
        try {
          await tradingViewDrawer.drawOrder(
            tradingViewLinks[0],
            orderData.orderType,
            orderData.symbol,
            {
              entry: orderData.entry,
              takeProfit: orderData.takeProfit,
              stopLoss: orderData.stopLoss,
            }
          );
          console.log(`✅ Disegno completato!\n`);
        } catch (error) {
          console.error(`❌ Errore durante il disegno:`, error);
          console.log(`💡 Usa il Pine Script generato come alternativa\n`);
        }
      } else if (!tradingViewLinks.length && orderData.orderType) {
        console.log('⚠️ Link TradingView non trovato. Usa il Pine Script generato per vedere i livelli.\n');
      }

      // 7. ESEGUZIONE AUTOMATICA ORDINE (se configurato)
      if (executionConfig.autoPlaceOrders && 
          orderData.orderType && 
          orderData.entry && 
          orderData.symbol) {
        console.log(`🤖 Esecuzione automatica ordine sul broker...\n`);
        
        try {
          const result = await orderExecutor.executeOrder(
            orderData.orderType,
            orderData.symbol,
            orderData.entry,
            orderData.takeProfit,
            orderData.stopLoss,
            calculatedVolume, // volume calcolato con risk management (0.4%)
            parsedMessage.notes
          );

          if (result.success && result.orderId) {
            console.log(`✅ Ordine eseguito con successo sul broker!`);
            console.log(`   Order ID: ${result.orderId}`);
            console.log(`   Volume: ${calculatedVolume.toFixed(2)} lot (${currentRiskPercent}% risk)\n`);
            logger.info('Ordine eseguito sul broker', {
              orderId: result.orderId,
              symbol: orderData.symbol,
              type: orderData.orderType,
              volume: calculatedVolume,
              riskPercent: currentRiskPercent,
            });
            
            // Registra trade per statistiche
            if (orderId) {
              try {
                await statisticsTracker.recordTrade({
                  id: orderId,
                  channel: chatTitle,
                  orderType: orderData.orderType || parsedMessage.orderType!,
                  symbol: orderData.symbol || parsedMessage.symbol,
                  entry: orderData.entry || parsedMessage.entry,
                  takeProfit: orderData.takeProfit || parsedMessage.takeProfit,
                  stopLoss: orderData.stopLoss || parsedMessage.stopLoss,
                  riskReward: parsedMessage.riskReward,
                  leverage: parsedMessage.leverage,
                  timeframe: parsedMessage.timeframe,
                  notes: parsedMessage.notes,
                } as any);
                
                // Calcola e mostra statistiche aggiornate
                const stats = await statisticsTracker.calculateStatistics();
                if (stats.totalTrades > 0) {
                  console.log(`📊 Statistiche aggiornate: ${stats.totalTrades} trade, Win Rate: ${stats.winRate.toFixed(2)}%\n`);
                }
              } catch (error) {
                logger.error('Errore registrazione trade per statistiche', error);
              }
            }
          } else {
            console.log(`⚠️ Ordine non eseguito: ${result.error || 'Errore sconosciuto'}\n`);
            logger.warn('Ordine non eseguito', { error: result.error });
          }
        } catch (error) {
          console.error(`❌ Errore durante l'esecuzione ordine:`, error);
          logger.error('Errore esecuzione ordine broker', error);
        }
      } else if (orderData.orderType && orderData.entry && !executionConfig.autoPlaceOrders) {
        console.log(`💡 Esecuzione automatica disabilitata (imposta AUTO_EXECUTE_ORDERS=true per abilitare)\n`);
      }
    } else if (parsedMessage.hasInfo) {
      console.log(`ℹ️ Messaggio informativo rilevato\n`);
    } else {
      console.log(`📝 Nessun ordine rilevato nel messaggio\n`);
    }

    console.log('─'.repeat(60) + '\n');
  }, new NewMessage({}));

  console.log('✅ Bot attivo e in ascolto!\n');
  console.log('Premi Ctrl+C per fermare il bot.\n');
}

// Gestione errori globale
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error);
  console.error('❌ Errore critico non gestito:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  console.error('❌ Promise rifiutata non gestita:', reason);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Chiusura del bot in corso...');
  logger.info('Bot in chiusura (SIGINT)');
  
  try {
    // Chiudi il client Telegram
    await client.disconnect();
    logger.info('Client Telegram disconnesso');
    
    // Chiudi il browser Puppeteer se aperto
    await tradingViewDrawer.closeBrowser();
    logger.info('Browser disegno chiuso');
    
    // Ferma monitoraggio posizioni
    positionMonitor.stopMonitoring();
    logger.info('Monitoraggio posizioni fermato');
    
    // Salva balance finale (con interesse composto)
    await riskManager.saveBalance('./temp/balance.json');
    logger.info('Balance finale salvato', { balance: riskManager.getBalance() });
    
    // Chiudi il broker manager se aperto
    await brokerManager.close();
    logger.info('Broker manager chiuso');
    
    // Chiudi il worker OCR
    await imageAnalyzer.closeWorker();
    logger.info('Worker OCR chiuso');
    
    console.log('✅ Bot chiuso correttamente\n');
    logger.info('Bot chiuso correttamente');
    process.exit(0);
  } catch (error) {
    logger.error('Errore durante la chiusura', error);
    console.error('❌ Errore durante la chiusura:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n\n🛑 Chiusura del bot in corso (SIGTERM)...');
  logger.info('Bot in chiusura (SIGTERM)');
  
  try {
    await client.disconnect();
    await tradingViewDrawer.closeBrowser();
    await imageAnalyzer.closeWorker();
    console.log('✅ Bot chiuso correttamente\n');
    process.exit(0);
  } catch (error) {
    logger.error('Errore durante la chiusura (SIGTERM)', error);
    process.exit(1);
  }
});

main().catch((error) => {
  logger.error('Errore in main()', error);
  console.error('❌ Errore fatale:', error);
  process.exit(1);
});

