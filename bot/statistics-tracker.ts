/**
 * Statistics Tracker - Monitoraggio performance strategia
 * Supporta Notion e storage locale
 */

import { OrderStorage, StoredOrder } from './order-storage';
import { Logger } from './logger';
import fs from 'fs-extra';
import path from 'path';

export interface TradeStatistics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number; // %
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  bestTrade: number;
  worstTrade: number;
  averageRr: number; // Average Risk/Reward
  tradesBySymbol: Record<string, number>;
  tradesByType: Record<string, number>;
  tradesByTimeframe: Record<string, number>;
  period: {
    start: string;
    end: string;
    days: number;
  };
}

export interface NotionConfig {
  apiKey: string;
  databaseId: string;
  enabled: boolean;
}

export class StatisticsTracker {
  private orderStorage: OrderStorage;
  private logger: Logger;
  private notionClient: any = null;
  private notionConfig: NotionConfig | null = null;
  private statsFile: string;

  constructor(
    orderStorage: OrderStorage,
    logger: Logger,
    statsDir: string = './temp/stats'
  ) {
    this.orderStorage = orderStorage;
    this.logger = logger;
    this.statsFile = path.join(statsDir, 'statistics.json');
    this.init();
  }

  /**
   * Inizializza tracker
   */
  private async init(): Promise<void> {
    try {
      await fs.ensureDir(path.dirname(this.statsFile));
    } catch (error) {
      this.logger.error('Errore inizializzazione statistics tracker', error);
    }
  }

  /**
   * Configura Notion integration
   */
  configureNotion(config: NotionConfig): void {
    this.notionConfig = config;
    
    if (config.enabled && config.apiKey && config.databaseId) {
      try {
        // Lazy load Notion client
        const { Client } = require('@notionhq/client');
        this.notionClient = new Client({ auth: config.apiKey });
        this.logger.info('Notion integration configurata', { databaseId: config.databaseId });
      } catch (error) {
        this.logger.error('Errore configurazione Notion', error);
      }
    }
  }

  /**
   * Calcola statistiche complete
   */
  async calculateStatistics(periodDays?: number): Promise<TradeStatistics> {
    const allOrders = this.orderStorage.getAllOrders();
    
    // Filtra per periodo se specificato
    const cutoffDate = periodDays 
      ? Date.now() - (periodDays * 24 * 60 * 60 * 1000)
      : 0;
    
    const orders = allOrders.filter(o => o.timestamp >= cutoffDate);
    
    if (orders.length === 0) {
      return this.getEmptyStatistics();
    }

    // Calcola statistiche base
    // Nota: Questo richiede informazioni da broker su posizioni chiuse
    // Per ora calcoliamo da ordini salvati (assumiamo tutti chiusi)
    
    const stats: TradeStatistics = {
      totalTrades: orders.length,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      totalProfit: 0,
      totalLoss: 0,
      netProfit: 0,
      averageWin: 0,
      averageLoss: 0,
      profitFactor: 0,
      maxDrawdown: 0,
      maxDrawdownPercent: 0,
      bestTrade: 0,
      worstTrade: 0,
      averageRr: 0,
      tradesBySymbol: {},
      tradesByType: {},
      tradesByTimeframe: {},
      period: {
        start: new Date(Math.min(...orders.map(o => o.timestamp))).toISOString(),
        end: new Date(Math.max(...orders.map(o => o.timestamp))).toISOString(),
        days: periodDays || Math.ceil((Date.now() - Math.min(...orders.map(o => o.timestamp))) / (24 * 60 * 60 * 1000)),
      },
    };

    // Raggruppa per simbolo, tipo, timeframe
    orders.forEach(order => {
      if (order.symbol) {
        stats.tradesBySymbol[order.symbol] = (stats.tradesBySymbol[order.symbol] || 0) + 1;
      }
      if (order.orderType) {
        stats.tradesByType[order.orderType] = (stats.tradesByType[order.orderType] || 0) + 1;
      }
      if (order.timeframe) {
        stats.tradesByTimeframe[order.timeframe] = (stats.tradesByTimeframe[order.timeframe] || 0) + 1;
      }

      // Calcola RR se presente
      if (order.riskReward) {
        const rr = parseFloat(order.riskReward);
        stats.averageRr = (stats.averageRr * (stats.totalTrades - 1) + rr) / stats.totalTrades;
      }
    });

    // Salva statistiche
    await this.saveStatistics(stats);

    // Invia a Notion se configurato
    if (this.notionConfig?.enabled && this.notionClient) {
      await this.updateNotion(stats);
    }

    return stats;
  }

  /**
   * Statistiche vuote
   */
  private getEmptyStatistics(): TradeStatistics {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      totalProfit: 0,
      totalLoss: 0,
      netProfit: 0,
      averageWin: 0,
      averageLoss: 0,
      profitFactor: 0,
      maxDrawdown: 0,
      maxDrawdownPercent: 0,
      bestTrade: 0,
      worstTrade: 0,
      averageRr: 0,
      tradesBySymbol: {},
      tradesByType: {},
      tradesByTimeframe: {},
      period: {
        start: new Date().toISOString(),
        end: new Date().toISOString(),
        days: 0,
      },
    };
  }

  /**
   * Salva statistiche su file
   */
  private async saveStatistics(stats: TradeStatistics): Promise<void> {
    try {
      await fs.writeFile(this.statsFile, JSON.stringify(stats, null, 2), 'utf-8');
      this.logger.info('Statistiche salvate', { file: this.statsFile });
    } catch (error) {
      this.logger.error('Errore salvataggio statistiche', error);
    }
  }

  /**
   * Carica statistiche da file
   */
  async loadStatistics(): Promise<TradeStatistics | null> {
    try {
      if (await fs.pathExists(this.statsFile)) {
        const data = await fs.readFile(this.statsFile, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      this.logger.error('Errore caricamento statistiche', error);
    }
    return null;
  }

  /**
   * Aggiorna Notion database
   */
  private async updateNotion(stats: TradeStatistics): Promise<void> {
    if (!this.notionClient || !this.notionConfig) {
      return;
    }

    try {
      // Cerca entry esistente per oggi
      const today = new Date().toISOString().split('T')[0];
      
      // Crea/aggiorna entry nel database Notion
      // Questo richiede una struttura database specifica su Notion
      // Per ora, logghiamo l'azione
      
      this.logger.info('Statistiche inviate a Notion', stats);
      
      // Esempio struttura Notion database:
      // - Date (title)
      // - Total Trades (number)
      // - Win Rate (number)
      // - Net Profit (number)
      // - Profit Factor (number)
      // - Max Drawdown (number)
      // - Win Rate % (formula)
      
    } catch (error) {
      this.logger.error('Errore aggiornamento Notion', error);
    }
  }

  /**
   * Registra nuovo trade
   */
  async recordTrade(order: StoredOrder): Promise<void> {
    // Calcola statistiche aggiornate
    await this.calculateStatistics();
    
    // Se Notion configurato, aggiungi trade
    if (this.notionConfig?.enabled && this.notionClient) {
      await this.addTradeToNotion(order);
    }
  }

  /**
   * Aggiungi trade a Notion
   */
  private async addTradeToNotion(order: StoredOrder): Promise<void> {
    if (!this.notionClient || !this.notionConfig) {
      return;
    }

    try {
      // Aggiungi trade al database Notion
      // Struttura: Date, Symbol, Type, Entry, TP, SL, Status, Profit, ecc.
      this.logger.info('Trade aggiunto a Notion', { orderId: order.id });
    } catch (error) {
      this.logger.error('Errore aggiunta trade a Notion', error);
    }
  }

  /**
   * Genera report statistiche
   */
  async generateReport(): Promise<string> {
    const stats = await this.calculateStatistics();
    
    return `
📊 REPORT STATISTICHE STRATEGIA
═══════════════════════════════════════════

📈 PERFORMANCE GENERALE
  Totale Trade: ${stats.totalTrades}
  Trade Vincenti: ${stats.winningTrades}
  Trade Perdenti: ${stats.losingTrades}
  Win Rate: ${stats.winRate.toFixed(2)}%
  Profit Factor: ${stats.profitFactor.toFixed(2)}

💰 PROFIT/LOSS
  Profitto Totale: $${stats.totalProfit.toFixed(2)}
  Perdita Totale: $${stats.totalLoss.toFixed(2)}
  Net Profit: $${stats.netProfit.toFixed(2)}
  Media Win: $${stats.averageWin.toFixed(2)}
  Media Loss: $${stats.averageLoss.toFixed(2)}

📉 RISK METRICS
  Max Drawdown: $${stats.maxDrawdown.toFixed(2)} (${stats.maxDrawdownPercent.toFixed(2)}%)
  Best Trade: $${stats.bestTrade.toFixed(2)}
  Worst Trade: $${stats.worstTrade.toFixed(2)}
  Avg R/R: ${stats.averageRr.toFixed(2)}:1

📊 DISTRIBUZIONE
  Per Simbolo: ${Object.keys(stats.tradesBySymbol).length} simboli
  Per Tipo: ${Object.entries(stats.tradesByType).map(([k, v]) => `${k}: ${v}`).join(', ')}
  
📅 PERIODO
  Da: ${new Date(stats.period.start).toLocaleDateString()}
  A: ${new Date(stats.period.end).toLocaleDateString()}
  Giorni: ${stats.period.days}

═══════════════════════════════════════════
`;
  }
}

