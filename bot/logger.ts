/**
 * Sistema di logging strutturato
 */

import fs from 'fs-extra';
import path from 'path';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class Logger {
  private logDir: string;
  private logFile: string;
  private minLevel: LogLevel;

  constructor(logDir: string = './temp/logs', minLevel: LogLevel = LogLevel.INFO) {
    this.logDir = logDir;
    this.logFile = path.join(logDir, `bot_${this.getDateString()}.log`);
    this.minLevel = minLevel;
    this.init();
  }

  /**
   * Inizializza il logger
   */
  private async init(): Promise<void> {
    try {
      await fs.ensureDir(this.logDir);
    } catch (error) {
      console.error('Errore durante l\'inizializzazione del logger:', error);
    }
  }

  /**
   * Ottieni data formattata per nome file
   */
  private getDateString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  /**
   * Ottieni timestamp formattato
   */
  private getTimestamp(): string {
    const now = new Date();
    return now.toISOString();
  }

  /**
   * Log un messaggio
   */
  private async log(level: LogLevel, levelName: string, message: string, data?: any): Promise<void> {
    if (level < this.minLevel) return;

    const timestamp = this.getTimestamp();
    const logMessage = data
      ? `[${timestamp}] [${levelName}] ${message} ${JSON.stringify(data)}`
      : `[${timestamp}] [${levelName}] ${message}`;

    // Log su console
    const consoleMethod = level >= LogLevel.ERROR ? 'error' : level >= LogLevel.WARN ? 'warn' : 'log';
    console[consoleMethod](logMessage);

    // Log su file (async, non blocca)
    try {
      await fs.appendFile(this.logFile, logMessage + '\n', 'utf-8');
    } catch (error) {
      // Non bloccare se il file non può essere scritto
      console.error('Errore durante la scrittura del log:', error);
    }
  }

  /**
   * Log debug
   */
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, data);
  }

  /**
   * Log info
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, 'INFO', message, data);
  }

  /**
   * Log warning
   */
  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, 'WARN', message, data);
  }

  /**
   * Log error
   */
  error(message: string, error?: any): void {
    const errorData = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : error;
    this.log(LogLevel.ERROR, 'ERROR', message, errorData);
  }

  /**
   * Log ordine rilevato
   */
  order(orderData: any, channel: string): void {
    this.info(`Ordine rilevato in ${channel}`, orderData);
  }

  /**
   * Log analisi immagine
   */
  imageAnalysis(result: any): void {
    this.info('Analisi immagine completata', result);
  }

  /**
   * Log disegno TradingView
   */
  tradingViewDraw(result: boolean, error?: any): void {
    if (error) {
      this.error('Errore durante disegno TradingView', error);
    } else {
      this.info('Disegno TradingView completato', { success: result });
    }
  }
}

