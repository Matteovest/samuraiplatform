/**
 * Sistema di salvataggio storico ordini
 */

import fs from 'fs-extra';
import path from 'path';

export interface StoredOrder {
  id: string;
  timestamp: number;
  date: string;
  channel: string;
  orderType: 'long' | 'short' | 'buy' | 'sell';
  symbol?: string;
  entry?: string;
  takeProfit?: string;
  stopLoss?: string;
  riskReward?: string;
  leverage?: string;
  timeframe?: string;
  multipleTP?: string[];
  breakEven?: string;
  trailingStop?: string;
  notes?: string;
  tradingViewLink?: string;
  imagePath?: string;
  pineScriptPath?: string;
}

export class OrderStorage {
  private storageDir: string;
  private ordersFile: string;
  private orders: StoredOrder[] = [];

  constructor(storageDir: string = './temp/orders') {
    this.storageDir = storageDir;
    this.ordersFile = path.join(storageDir, 'orders.json');
    this.init();
  }

  /**
   * Inizializza lo storage
   */
  private async init(): Promise<void> {
    try {
      await fs.ensureDir(this.storageDir);
      
      // Carica ordini esistenti se il file esiste
      if (await fs.pathExists(this.ordersFile)) {
        const data = await fs.readFile(this.ordersFile, 'utf-8');
        this.orders = JSON.parse(data);
      }
    } catch (error) {
      console.error('Errore durante l\'inizializzazione dello storage:', error);
      this.orders = [];
    }
  }

  /**
   * Salva un nuovo ordine
   */
  async saveOrder(order: Omit<StoredOrder, 'id' | 'timestamp' | 'date'>): Promise<string> {
    const storedOrder: StoredOrder = {
      ...order,
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      date: new Date().toISOString(),
    };

    this.orders.push(storedOrder);
    
    // Salva in ordine cronologico (più recenti prima)
    this.orders.sort((a, b) => b.timestamp - a.timestamp);

    try {
      await this.persist();
    } catch (error) {
      console.error('Errore durante il salvataggio dell\'ordine:', error);
    }

    return storedOrder.id;
  }

  /**
   * Ottieni tutti gli ordini
   */
  getAllOrders(): StoredOrder[] {
    return [...this.orders];
  }

  /**
   * Ottieni ordini per simbolo
   */
  getOrdersBySymbol(symbol: string): StoredOrder[] {
    return this.orders.filter(o => o.symbol?.toUpperCase() === symbol.toUpperCase());
  }

  /**
   * Ottieni ordini per tipo
   */
  getOrdersByType(orderType: 'long' | 'short' | 'buy' | 'sell'): StoredOrder[] {
    return this.orders.filter(o => 
      o.orderType === orderType || 
      (orderType === 'long' && o.orderType === 'buy') ||
      (orderType === 'short' && o.orderType === 'sell')
    );
  }

  /**
   * Ottieni ordini recenti (ultimi N)
   */
  getRecentOrders(limit: number = 10): StoredOrder[] {
    return this.orders.slice(0, limit);
  }

  /**
   * Ottieni ordini per canale
   */
  getOrdersByChannel(channel: string): StoredOrder[] {
    return this.orders.filter(o => 
      o.channel.toLowerCase().includes(channel.toLowerCase()) ||
      o.channel.toLowerCase() === channel.toLowerCase()
    );
  }

  /**
   * Ottieni statistiche
   */
  getStatistics(): {
    total: number;
    byType: Record<string, number>;
    bySymbol: Record<string, number>;
    byChannel: Record<string, number>;
  } {
    const stats = {
      total: this.orders.length,
      byType: {} as Record<string, number>,
      bySymbol: {} as Record<string, number>,
      byChannel: {} as Record<string, number>,
    };

    this.orders.forEach(order => {
      // Per tipo
      const type = order.orderType;
      stats.byType[type] = (stats.byType[type] || 0) + 1;

      // Per simbolo
      if (order.symbol) {
        const symbol = order.symbol.toUpperCase();
        stats.bySymbol[symbol] = (stats.bySymbol[symbol] || 0) + 1;
      }

      // Per canale
      const channel = order.channel;
      stats.byChannel[channel] = (stats.byChannel[channel] || 0) + 1;
    });

    return stats;
  }

  /**
   * Salva i dati su file
   */
  private async persist(): Promise<void> {
    try {
      await fs.writeFile(this.ordersFile, JSON.stringify(this.orders, null, 2), 'utf-8');
    } catch (error) {
      console.error('Errore durante il salvataggio su file:', error);
      throw error;
    }
  }

  /**
   * Esporta ordini in CSV
   */
  async exportToCSV(outputPath?: string): Promise<string> {
    const csvPath = outputPath || path.join(this.storageDir, `orders_${Date.now()}.csv`);
    
    const headers = [
      'ID', 'Date', 'Channel', 'Type', 'Symbol', 'Entry', 'TP', 'SL',
      'RR', 'Leverage', 'Timeframe', 'TP Multiple', 'Notes'
    ].join(',');

    const rows = this.orders.map(order => [
      order.id,
      order.date,
      `"${order.channel}"`,
      order.orderType,
      order.symbol || '',
      order.entry || '',
      order.takeProfit || '',
      order.stopLoss || '',
      order.riskReward || '',
      order.leverage || '',
      order.timeframe || '',
      order.multipleTP?.join(';') || '',
      `"${order.notes || ''}"`
    ].join(','));

    const csv = [headers, ...rows].join('\n');
    
    await fs.writeFile(csvPath, csv, 'utf-8');
    
    return csvPath;
  }

  /**
   * Pulisci ordini vecchi (opzionale)
   */
  async cleanOldOrders(daysToKeep: number = 30): Promise<number> {
    const cutoff = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    const initialCount = this.orders.length;
    
    this.orders = this.orders.filter(order => order.timestamp >= cutoff);
    
    const removed = initialCount - this.orders.length;
    
    if (removed > 0) {
      await this.persist();
    }
    
    return removed;
  }
}

