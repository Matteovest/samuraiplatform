/**
 * Position Monitor - Monitora posizioni aperte e gestisce Break Even
 */

import { OrderStorage, StoredOrder } from './order-storage';
import { BrokerManager } from './broker-manager';
import { RiskManager } from './risk-manager';
import { Logger } from './logger';

export interface PositionStatus {
  orderId: string;
  symbol: string;
  type: 'long' | 'short' | 'buy' | 'sell';
  entry: number;
  currentPrice: number;
  takeProfit?: number;
  stopLoss: number;
  volume: number;
  profit: number;
  profitPercent: number;
  breakEvenSet: boolean; // Se SL è stato spostato a BE
  breakEvenPrice?: number;
}

export class PositionMonitor {
  private orderStorage: OrderStorage;
  private brokerManager: BrokerManager;
  private riskManager: RiskManager;
  private logger: Logger;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private breakEvenPips: number; // Pips sopra entry per BE

  constructor(
    orderStorage: OrderStorage,
    brokerManager: BrokerManager,
    riskManager: RiskManager,
    logger: Logger,
    breakEvenPips: number = 2 // 2 pip di default
  ) {
    this.orderStorage = orderStorage;
    this.brokerManager = brokerManager;
    this.riskManager = riskManager;
    this.logger = logger;
    this.breakEvenPips = breakEvenPips;
  }

  /**
   * Avvia monitoraggio automatico delle posizioni
   */
  startMonitoring(intervalMs: number = 60000): void { // Default: ogni minuto
    if (this.monitoringInterval) {
      this.stopMonitoring();
    }

    console.log(`🔍 Avvio monitoraggio posizioni (intervallo: ${intervalMs / 1000}s)\n`);
    this.logger.info('Monitoraggio posizioni avviato', { interval: intervalMs });

    this.monitoringInterval = setInterval(async () => {
      await this.checkPositions();
    }, intervalMs);
  }

  /**
   * Ferma monitoraggio
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('🛑 Monitoraggio posizioni fermato\n');
      this.logger.info('Monitoraggio posizioni fermato');
    }
  }

  /**
   * Controlla tutte le posizioni aperte
   */
  async checkPositions(): Promise<void> {
    try {
      // Ottieni ordini recenti dallo storage
      const recentOrders = this.orderStorage.getRecentOrders(100); // Ultimi 100 ordini
      
      // Filtra solo ordini con esecuzione (potenzialmente aperti)
      const openOrders = recentOrders.filter(order => 
        order.entry && order.stopLoss && !order.breakEven // Non ancora a BE
      );

      for (const order of openOrders) {
        await this.checkSinglePosition(order);
      }
    } catch (error) {
      this.logger.error('Errore durante controllo posizioni', error);
    }
  }

  /**
   * Controlla una singola posizione
   */
  private async checkSinglePosition(order: StoredOrder): Promise<void> {
    try {
      // Qui otterremmo il prezzo corrente dal broker
      // Per ora, simuliamo con un prezzo di esempio
      // In produzione, useremo brokerManager.getOpenPositions()
      
      const positions = await this.brokerManager.getOpenPositions(order.symbol || '');
      const position = positions.find(p => p.symbol === order.symbol);

      if (!position) {
        // Posizione non trovata = probabilmente chiusa
        return;
      }

      // Controlla se posizione è stata chiusa (TP/SL raggiunti)
      const closedCheck = await this.checkPositionClosed(position);
      if (closedCheck.closed && closedCheck.profitLoss !== undefined) {
        // Posizione chiusa - aggiorna balance con interesse composto
        await this.handlePositionClosed(order.id, closedCheck.profitLoss, closedCheck.reason || 'manual');
        return; // Esci - posizione chiusa
      }

      // Controlla se deve essere spostato a BE (solo se ancora aperta)
      if (!order.breakEven && this.shouldMoveToBreakEven(position, order)) {
        await this.moveToBreakEven(order, position);
      }
    } catch (error) {
      this.logger.error(`Errore controllo posizione ${order.id}`, error);
    }
  }

  /**
   * Verifica se la posizione deve essere spostata a BE
   * 
   * LOGICA BREAK EVEN:
   * - Per LONG: Quando il prezzo sale e supera Entry, sposta SL a Entry + spread
   * - Per SHORT: Quando il prezzo scende e supera Entry, sposta SL a Entry - spread
   * - Questo protegge dalla perdita iniziale e copre lo spread
   * 
   * NOTA: Il messaggio "operazione spostata a BE" è una richiesta manuale,
   * mentre questa funzione è per spostamento automatico quando il prezzo raggiunge Entry
   */
  private shouldMoveToBreakEven(position: OpenPosition, order: StoredOrder): boolean {
    if (!order.entry || !order.stopLoss) {
      return false;
    }

    const entry = parseFloat(order.entry);
    const currentPrice = position.currentPrice;
    const isLong = order.orderType === 'long' || order.orderType === 'buy';

    // Per LONG: Se il prezzo è salito sopra Entry, può spostare a BE
    // Per SHORT: Se il prezzo è sceso sotto Entry, può spostare a BE
    // Questo significa che la posizione è già in profitto oltre Entry
    
    if (isLong) {
      // LONG: Prezzo sopra Entry = può spostare a BE
      return currentPrice > entry;
    } else {
      // SHORT: Prezzo sotto Entry = può spostare a BE
      return currentPrice < entry;
    }
  }

  /**
   * Sposta Stop Loss a Break Even
   */
  async moveToBreakEven(order: StoredOrder, position: OpenPosition): Promise<boolean> {
    try {
      if (!order.entry || !order.orderType) {
        return false;
      }

      const entry = parseFloat(order.entry);
      const breakEvenPrice = this.riskManager.calculateBreakEven(
        entry,
        order.orderType,
        order.symbol || ''
      );

      console.log(`🔧 Spostamento SL a BE per ${order.symbol}`);
      console.log(`   Entry: ${entry}`);
      console.log(`   Nuovo SL (BE): ${breakEvenPrice}\n`);

      this.logger.info('Spostamento SL a BE', {
        orderId: order.id,
        symbol: order.symbol,
        entry,
        breakEvenPrice,
      });

      // Qui aggiorneremmo lo SL sul broker
      // Per ora, aggiorniamo solo nello storage
      // In produzione: await brokerManager.updateStopLoss(order.id, breakEvenPrice);

      // Aggiorna ordine nello storage
      // Nota: OrderStorage non ha metodo update, dovremmo aggiungerlo
      // Per ora, logghiamo l'azione

      return true;
    } catch (error) {
      this.logger.error(`Errore spostamento BE per ${order.id}`, error);
      return false;
    }
  }

  /**
   * Gestisce messaggio Break Even dal Telegram
   */
  async handleBreakEvenMessage(
    referenceOrderId: string | undefined,
    orderType: 'long' | 'short' | 'buy' | 'sell' | undefined,
    symbol: string | undefined
  ): Promise<boolean> {
    try {
      // Trova l'ordine di riferimento
      let targetOrder: StoredOrder | undefined;

      if (referenceOrderId) {
        // Cerca per ID specifico
        const allOrders = this.orderStorage.getAllOrders();
        targetOrder = allOrders.find(o => o.id === referenceOrderId);
      } else if (symbol && orderType) {
        // Cerca ordine più recente per simbolo e tipo
        const orders = this.orderStorage.getAllOrders()
          .filter(o => o.symbol === symbol && o.orderType === orderType)
          .sort((a, b) => b.timestamp - a.timestamp);
        targetOrder = orders[0];
      }

      if (!targetOrder || !targetOrder.entry) {
        console.log('⚠️ Ordine di riferimento non trovato per BE update\n');
        this.logger.warn('Ordine riferimento BE non trovato', { referenceOrderId, symbol, orderType });
        return false;
      }

      console.log(`📨 Messaggio BE ricevuto, aggiornamento ordine ${targetOrder.id}\n`);

      // Ottieni posizione corrente dal broker
      const positions = await this.brokerManager.getOpenPositions(targetOrder.symbol || '');
      const position = positions.find(p => p.symbol === targetOrder.symbol);

      if (!position) {
        console.log('⚠️ Posizione non trovata sul broker\n');
        return false;
      }

      // Sposta a BE
      return await this.moveToBreakEven(targetOrder, position);
    } catch (error) {
      this.logger.error('Errore gestione messaggio BE', error);
      return false;
    }
  }

  /**
   * Ottieni statistiche posizioni
   */
  async getPositionStatistics(): Promise<{
    total: number;
    open: number;
    closed: number;
    inProfit: number;
    inLoss: number;
    totalProfit: number;
    totalLoss: number;
    winRate: number;
  }> {
    const allOrders = this.orderStorage.getAllOrders();
    
    // Questo richiederebbe informazioni dal broker su posizioni chiuse
    // Per ora, calcoliamo solo da ordini salvati
    
    return {
      total: allOrders.length,
      open: 0, // Da calcolare dal broker
      closed: 0,
      inProfit: 0,
      inLoss: 0,
      totalProfit: 0,
      totalLoss: 0,
      winRate: 0,
    };
  }
}

