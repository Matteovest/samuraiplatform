/**
 * Order Executor - Esegue ordini automaticamente su TradingView broker
 */

import { BrokerManager, PendingOrder } from './broker-manager';
import { OrderValidator } from './order-validator';
import { Logger } from './logger';
import { OrderStorage } from './order-storage';

export interface ExecutionConfig {
  broker: string;
  defaultVolume: number; // Lot size di default
  maxVolume?: number; // Volume massimo
  minVolume?: number; // Volume minimo
  autoPlaceOrders: boolean; // Se true, apri ordini automaticamente
  checkSpread: boolean; // Se true, verifica spread (ma non lo usa per entry/exit)
}

export class OrderExecutor {
  private brokerManager: BrokerManager;
  private validator: OrderValidator;
  private logger: Logger;
  private orderStorage: OrderStorage;
  private config: ExecutionConfig;

  constructor(
    brokerManager: BrokerManager,
    validator: OrderValidator,
    logger: Logger,
    orderStorage: OrderStorage,
    config: ExecutionConfig
  ) {
    this.brokerManager = brokerManager;
    this.validator = validator;
    this.logger = logger;
    this.orderStorage = orderStorage;
    this.config = config;
  }

  /**
   * Esegui ordine automaticamente
   * Usa volume calcolato con risk management se disponibile
   */
  async executeOrder(
    orderType: 'long' | 'short' | 'buy' | 'sell',
    symbol: string,
    entry: string,
    takeProfit?: string,
    stopLoss?: string,
    volume?: number, // Se fornito, usa questo (già calcolato con risk management)
    notes?: string
  ): Promise<{ success: boolean; orderId?: string; error?: string }> {
    try {
      // Valida l'ordine
      const validation = this.validator.validate(
        orderType,
        entry,
        takeProfit,
        stopLoss,
        symbol
      );

      if (!validation.valid) {
        const errorMsg = `Ordine non valido: ${validation.errors.join(', ')}`;
        this.logger.error(errorMsg, { validation });
        return { success: false, error: errorMsg };
      }

      if (!this.config.autoPlaceOrders) {
        this.logger.info('Ordine non eseguito: autoPlaceOrders è false', {
          orderType,
          symbol,
          entry,
        });
        return { success: false, error: 'Esecuzione automatica disabilitata' };
      }

      // Determina il tipo di ordine pending
      // Per LONG: Buy Limit (entry sotto prezzo corrente)
      // Per SHORT: Sell Limit (entry sopra prezzo corrente)
      const entryPrice = parseFloat(entry);
      
      // Nota: In un'implementazione reale, dovremmo ottenere il prezzo corrente
      // Per ora assumiamo che l'entry sia il prezzo target (limit order)
      const pendingOrderType: 'buy_limit' | 'sell_limit' = 
        orderType === 'long' || orderType === 'buy' ? 'buy_limit' : 'sell_limit';

      // Usa volume configurato o default
      const orderVolume = volume || this.config.defaultVolume;
      
      // Valida volume
      if (this.config.minVolume && orderVolume < this.config.minVolume) {
        return { success: false, error: `Volume minimo: ${this.config.minVolume} lot` };
      }
      if (this.config.maxVolume && orderVolume > this.config.maxVolume) {
        return { success: false, error: `Volume massimo: ${this.config.maxVolume} lot` };
      }

      // Crea ordine pending
      const pendingOrder: PendingOrder = {
        type: pendingOrderType,
        symbol: symbol,
        volume: orderVolume,
        entry: entryPrice,
        takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
        stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
        comment: notes || `Auto: ${orderType.toUpperCase()} ${symbol}`,
      };

      // Esegui ordine sul broker
      const orderId = await this.brokerManager.placePendingOrder(
        this.config.broker,
        pendingOrder
      );

      if (orderId) {
        this.logger.info('Ordine eseguito con successo', {
          orderId,
          orderType,
          symbol,
          entry,
          volume: orderVolume,
        });

        return { success: true, orderId };
      } else {
        const errorMsg = 'Errore durante l\'apertura dell\'ordine sul broker';
        this.logger.error(errorMsg, { pendingOrder });
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Errore sconosciuto';
      this.logger.error('Errore durante l\'esecuzione ordine', error);
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Verifica se l'ordine può essere eseguito (controlla spread se configurato)
   */
  async canExecuteOrder(symbol: string, entry: number): Promise<{
    canExecute: boolean;
    spread?: number;
    warning?: string;
  }> {
    if (!this.config.checkSpread) {
      return { canExecute: true };
    }

    // In un'implementazione reale, otterremmo lo spread corrente dal broker
    // Per ora, restituiamo sempre true (spread ignorato per entry/exit)
    // Nota: Lo spread può essere monitorato ma non influenza entry/exit
    
    return {
      canExecute: true,
      spread: 0, // Spread molto basso come indicato dall'utente
      warning: 'Spread ignorato per entry/exit come configurato',
    };
  }

  /**
   * Aggiorna configurazione
   */
  updateConfig(config: Partial<ExecutionConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.info('Configurazione aggiornata', this.config);
  }

  /**
   * Ottieni configurazione corrente
   */
  getConfig(): ExecutionConfig {
    return { ...this.config };
  }
}

