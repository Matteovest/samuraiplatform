/**
 * Broker Manager per TradingView - Gestione multi-broker
 */

import puppeteer, { Browser, Page } from 'puppeteer';

export interface BrokerConfig {
  name: string;
  brokerId: string; // TradingView broker ID
  accountType: 'demo' | 'live';
  credentials?: {
    username?: string;
    password?: string;
    apiKey?: string;
  };
  spread?: number; // Spread in pips (ignorato per entry/exit ma monitorato)
}

export interface PendingOrder {
  type: 'buy_limit' | 'sell_limit' | 'buy_stop' | 'sell_stop';
  symbol: string;
  volume: number; // Lot size
  entry: number;
  takeProfit?: number;
  stopLoss?: number;
  comment?: string;
}

export interface OpenPosition {
  id: string;
  type: 'buy' | 'sell';
  symbol: string;
  volume: number;
  entry: number;
  currentPrice: number;
  takeProfit?: number;
  stopLoss?: number;
  profit: number;
  broker: string;
}

export class BrokerManager {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private brokers: Map<string, BrokerConfig> = new Map();
  private headless: boolean;
  private tradingViewUrl: string = 'https://www.tradingview.com';

  constructor(headless: boolean = false) {
    this.headless = headless;
  }

  /**
   * Aggiungi configurazione broker
   */
  addBroker(config: BrokerConfig): void {
    this.brokers.set(config.name.toLowerCase(), config);
    console.log(`✅ Broker configurato: ${config.name} (${config.accountType})`);
  }

  /**
   * Ottieni configurazione broker
   */
  getBroker(name: string): BrokerConfig | undefined {
    return this.brokers.get(name.toLowerCase());
  }

  /**
   * Lista broker configurati
   */
  getBrokers(): BrokerConfig[] {
    return Array.from(this.brokers.values());
  }

  /**
   * Inizializza browser e pagina
   */
  async init(): Promise<void> {
    if (this.browser) {
      return;
    }

    console.log('🌐 Avvio browser per TradingView broker...');
    this.browser = await puppeteer.launch({
      headless: this.headless,
      defaultViewport: { width: 1920, height: 1080 },
      args: [
        '--start-maximized',
        '--disable-blink-features=AutomationControlled',
        '--disable-infobars',
      ],
    });

    this.page = await this.browser.newPage();
    
    // Naviga a TradingView
    await this.page.goto(this.tradingViewUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    console.log('✅ Browser inizializzato');
  }

  /**
   * Connetti a broker TradingView
   */
  async connectToBroker(brokerName: string): Promise<boolean> {
    const broker = this.getBroker(brokerName);
    if (!broker) {
      throw new Error(`Broker non configurato: ${brokerName}`);
    }

    if (!this.page) {
      await this.init();
    }

    if (!this.page) {
      throw new Error('Browser non inizializzato');
    }

    try {
      console.log(`🔗 Connessione a broker: ${broker.name}...`);

      // Apri il pannello broker su TradingView
      // TradingView ha un pannello broker integrato
      // Nota: Questo richiede che l'utente sia già loggato e collegato al broker
      
      // Metodo 1: Usa il browser automation per accedere al broker panel
      await this.page.evaluate(() => {
        // Cerca il pulsante del broker panel
        const brokerButton = document.querySelector('[data-name="broker-button"]') ||
                           document.querySelector('.broker-button') ||
                           document.querySelector('[title*="Broker"]');
        
        if (brokerButton && brokerButton instanceof HTMLElement) {
          brokerButton.click();
        }
      });

      // Attendi che il broker panel si apra
      await this.page.waitForTimeout(2000);

      // Verifica connessione
      const isConnected = await this.page.evaluate(() => {
        // Verifica se il broker è connesso
        const connectedIndicator = document.querySelector('.broker-connected') ||
                                  document.querySelector('[data-broker-connected="true"]');
        return connectedIndicator !== null;
      });

      if (isConnected) {
        console.log(`✅ Connesso al broker: ${broker.name}`);
        return true;
      } else {
        console.log(`⚠️ Broker non connesso. Assicurati di essere loggato su TradingView e collegato a ${broker.name}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Errore durante la connessione al broker:`, error);
      return false;
    }
  }

  /**
   * Apri ordine pending (Buy Limit / Sell Limit)
   */
  async placePendingOrder(
    brokerName: string,
    order: PendingOrder
  ): Promise<string | null> {
    const broker = this.getBroker(brokerName);
    if (!broker) {
      throw new Error(`Broker non configurato: ${brokerName}`);
    }

    if (!this.page) {
      await this.init();
    }

    if (!this.page) {
      throw new Error('Browser non inizializzato');
    }

    try {
      console.log(`📊 Apertura ordine ${order.type} per ${order.symbol}...`);
      console.log(`   Entry: ${order.entry}`);
      console.log(`   Volume: ${order.volume} lot`);
      if (order.takeProfit) console.log(`   TP: ${order.takeProfit}`);
      if (order.stopLoss) console.log(`   SL: ${order.stopLoss}`);

      // Metodo: Usa browser automation per aprire ordine su TradingView
      // TradingView broker panel permette di aprire ordini direttamente dal grafico
      
      const orderResult = await this.page.evaluate((order) => {
        // Trova il broker panel
        const brokerPanel = document.querySelector('.broker-panel') ||
                           document.querySelector('[data-name="broker-panel"]');
        
        if (!brokerPanel) {
          return { success: false, error: 'Broker panel non trovato' };
        }

        // Cerca il pulsante per aprire ordine
        const orderButton = brokerPanel.querySelector('[data-name="new-order"]') ||
                           brokerPanel.querySelector('.new-order-button') ||
                           brokerPanel.querySelector('button[title*="Order"]');
        
        if (!orderButton) {
          return { success: false, error: 'Pulsante ordine non trovato' };
        }

        // Click sul pulsante ordine
        (orderButton as HTMLElement).click();

        // Aspetta che il form ordine si apra
        setTimeout(() => {
          // Compila il form ordine
          const orderTypeSelect = document.querySelector('[name="order-type"]') ||
                                 document.querySelector('#order-type');
          if (orderTypeSelect) {
            (orderTypeSelect as HTMLSelectElement).value = order.type;
          }

          // Imposta simbolo
          const symbolInput = document.querySelector('[name="symbol"]') ||
                             document.querySelector('#symbol');
          if (symbolInput) {
            (symbolInput as HTMLInputElement).value = order.symbol;
          }

          // Imposta volume
          const volumeInput = document.querySelector('[name="volume"]') ||
                             document.querySelector('#volume');
          if (volumeInput) {
            (volumeInput as HTMLInputElement).value = order.volume.toString();
          }

          // Imposta entry (prezzo per limit order)
          const priceInput = document.querySelector('[name="price"]') ||
                            document.querySelector('#price');
          if (priceInput) {
            (priceInput as HTMLInputElement).value = order.entry.toString();
          }

          // Imposta TP se presente
          if (order.takeProfit) {
            const tpInput = document.querySelector('[name="take-profit"]') ||
                           document.querySelector('#take-profit');
            if (tpInput) {
              (tpInput as HTMLInputElement).value = order.takeProfit.toString();
            }
          }

          // Imposta SL se presente
          if (order.stopLoss) {
            const slInput = document.querySelector('[name="stop-loss"]') ||
                           document.querySelector('#stop-loss');
            if (slInput) {
              (slInput as HTMLInputElement).value = order.stopLoss.toString();
            }
          }

          // Commento se presente
          if (order.comment) {
            const commentInput = document.querySelector('[name="comment"]') ||
                                document.querySelector('#comment');
            if (commentInput) {
              (commentInput as HTMLInputElement).value = order.comment;
            }
          }

          // Invia l'ordine
          const submitButton = document.querySelector('[type="submit"]') ||
                              document.querySelector('.submit-order');
          if (submitButton) {
            (submitButton as HTMLElement).click();
          }
        }, 1000);

        return { success: true };
      }, order);

      if (orderResult.success) {
        console.log(`✅ Ordine ${order.type} aperto con successo`);
        return `order_${Date.now()}`;
      } else {
        console.error(`❌ Errore durante l'apertura ordine:`, orderResult.error);
        return null;
      }
    } catch (error) {
      console.error(`❌ Errore durante l'apertura ordine:`, error);
      return null;
    }
  }

  /**
   * Ottieni posizioni aperte
   */
  async getOpenPositions(brokerName: string): Promise<OpenPosition[]> {
    const broker = this.getBroker(brokerName);
    if (!broker) {
      throw new Error(`Broker non configurato: ${brokerName}`);
    }

    if (!this.page) {
      await this.init();
    }

    if (!this.page) {
      throw new Error('Browser non inizializzato');
    }

    try {
      const positions = await this.page.evaluate(() => {
        // Trova la lista delle posizioni nel broker panel
        const positionsList = document.querySelector('.positions-list') ||
                             document.querySelector('[data-name="positions"]');
        
        if (!positionsList) {
          return [];
        }

        // Estrai informazioni sulle posizioni
        const positionElements = positionsList.querySelectorAll('.position-item, tr[data-position]');
        
        return Array.from(positionElements).map((el, index) => {
          const text = el.textContent || '';
          // Parsing semplificato - potrebbe richiedere adattamenti per broker specifici
          return {
            id: `pos_${index}`,
            symbol: '',
            type: 'buy',
            volume: 0.01,
            entry: 0,
            currentPrice: 0,
            profit: 0,
          };
        });
      });

      return positions.map(pos => ({
        ...pos,
        broker: broker.name,
      }));
    } catch (error) {
      console.error(`❌ Errore durante il recupero posizioni:`, error);
      return [];
    }
  }

  /**
   * Monitora posizioni (controlla TP/SL raggiunti)
   */
  async monitorPositions(brokerName: string, callback?: (position: OpenPosition) => void): Promise<void> {
    const positions = await this.getOpenPositions(brokerName);
    
    for (const position of positions) {
      // Verifica se TP o SL sono stati raggiunti
      const tpReached = position.takeProfit && 
                       ((position.type === 'buy' && position.currentPrice >= position.takeProfit) ||
                        (position.type === 'sell' && position.currentPrice <= position.takeProfit));
      
      const slReached = position.stopLoss && 
                       ((position.type === 'buy' && position.currentPrice <= position.stopLoss) ||
                        (position.type === 'sell' && position.currentPrice >= position.stopLoss));

      if (tpReached || slReached) {
        console.log(`🎯 ${tpReached ? 'TP' : 'SL'} raggiunto per ${position.symbol}`);
        if (callback) {
          callback(position);
        }
      }
    }
  }

  /**
   * Chiudi browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}

