/**
 * Parser per analizzare i messaggi Telegram e riconoscere ordini di trading
 */

export interface ParsedMessage {
  hasOrder: boolean;
  orderType?: 'long' | 'short' | 'buy' | 'sell';
  symbol?: string;
  entry?: string;
  takeProfit?: string;
  stopLoss?: string;
  hasInfo: boolean;
  rawText: string;
  // Nuove variabili estese
  riskReward?: string;
  leverage?: string;
  timeframe?: string;
  multipleTP?: string[]; // TP multipli
  breakEven?: string;
  trailingStop?: string;
  notes?: string;
  // Gestione Break Even
  isBreakEvenUpdate?: boolean; // Messaggio che richiede spostamento a BE
  referenceOrderId?: string; // ID ordine di riferimento per BE update
}

export class MessageParser {
  // Pattern per riconoscere ordini long (migliorati)
  private longPatterns = [
    /\b(long|compra|buy|acquista|entry long|go long|apri long|posizione long|call|rialzo)\b/gi,
    /📈|⬆️|🔼|🚀|🔺|💚|✅/g,
    /\b(alto|up|higher|rise|rally|rialzo|rialzista|bull|bullish)\b/gi,
  ];

  // Pattern per riconoscere ordini short (migliorati)
  private shortPatterns = [
    /\b(short|vendi|sell|vai short|entry short|apri short|posizione short|put|ribasso)\b/gi,
    /📉|⬇️|🔽|📊|🔻|❤️|💔|❌/g,
    /\b(basso|down|lower|fall|drop|ribasso|ribassista|bear|bearish)\b/gi,
  ];

  // Pattern per riconoscere simboli di trading (estesi)
  private symbolPattern = /\b([A-Z]{1,5}[A-Z0-9]*\/[A-Z]{1,5}|[A-Z]{1,5}USD|[A-Z]{1,5}EUR|[A-Z]{1,5}GBP|[A-Z]{1,5}JPY|[A-Z]{1,5}CHF|[A-Z]{1,5}AUD|BTC\/USD|ETH\/USD|EUR\/USD|GBP\/USD|USD\/JPY|USD\/CHF|AUD\/USD|XAU\/USD|XAG\/USD|BTCUSDT|ETHUSDT)\b/gi;

  // Pattern per riconoscere prezzi (Entry, TP, SL) - migliorati
  private pricePatterns = {
    entry: /\b(entry|ingresso|entrata|@|prezzo|price|entry price|entry price:)\s*:?\s*([\d.,]+)\b/gi,
    takeProfit: /\b(tp|take profit|profitto|target|obiettivo|take profit:|tp:|target price|profit)\s*:?\s*([\d.,]+)\b/gi,
    stopLoss: /\b(sl|stop loss|stop|fermata|stop loss:|sl:|stop price|loss)\s*:?\s*([\d.,]+)\b/gi,
    riskReward: /\b(rr|risk reward|r\/r|risk\/reward|risk:reward)\s*:?\s*([\d.,]+)\b/gi,
    leverage: /\b(lev|leverage|leva|lev:|leverage:)\s*:?\s*([\d.,]+x?)\b/gi,
    timeframe: /\b(tf|timeframe|time frame|periodo|period|m1|m5|m15|m30|h1|h4|d1|w1|mn1)\b/gi,
    breakEven: /\b(be|break even|break-even|break even:)\s*:?\s*([\d.,]+)\b/gi,
    trailingStop: /\b(ts|trailing stop|trailing stop:)\s*:?\s*([\d.,]+)\b/gi,
  };

  parse(text: string): ParsedMessage {
    const normalizedText = this.normalizeText(text);
    const result: ParsedMessage = {
      hasOrder: false,
      hasInfo: false,
      rawText: text,
    };

    // Riconosci il tipo di ordine
    const isLong = this.matchesPattern(normalizedText, this.longPatterns);
    const isShort = this.matchesPattern(normalizedText, this.shortPatterns);

    if (isLong || isShort) {
      result.hasOrder = true;
      result.orderType = isLong ? 'long' : 'short';

      // Estrai simbolo
      const symbolMatch = normalizedText.match(this.symbolPattern);
      if (symbolMatch && symbolMatch[0]) {
        result.symbol = symbolMatch[0].replace(/\s+/g, '').toUpperCase();
      }

      // Estrai Entry
      const entryMatch = this.extractPrice(normalizedText, this.pricePatterns.entry);
      if (entryMatch) {
        result.entry = entryMatch;
      }

      // Estrai Take Profit
      const tpMatch = this.extractPrice(normalizedText, this.pricePatterns.takeProfit);
      if (tpMatch) {
        result.takeProfit = tpMatch;
      }

      // Estrai Stop Loss
      const slMatch = this.extractPrice(normalizedText, this.pricePatterns.stopLoss);
      if (slMatch) {
        result.stopLoss = slMatch;
      }

      // Estrai Risk/Reward
      const rrMatch = this.extractPrice(normalizedText, this.pricePatterns.riskReward);
      if (rrMatch) {
        result.riskReward = rrMatch;
      }

      // Estrai Leverage
      const levMatch = normalizedText.match(this.pricePatterns.leverage);
      if (levMatch && levMatch[2]) {
        result.leverage = levMatch[2].replace(/[xX]/g, '');
      }

      // Estrai Timeframe
      const tfMatch = normalizedText.match(this.pricePatterns.timeframe);
      if (tfMatch && tfMatch[1]) {
        result.timeframe = tfMatch[1].toUpperCase();
      }

      // Estrai Break Even
      const beMatch = this.extractPrice(normalizedText, this.pricePatterns.breakEven);
      if (beMatch) {
        result.breakEven = beMatch;
      }

      // Estrai Trailing Stop
      const tsMatch = this.extractPrice(normalizedText, this.pricePatterns.trailingStop);
      if (tsMatch) {
        result.trailingStop = tsMatch;
      }

      // Estrai TP multipli (TP1, TP2, TP3, ecc.)
      const multipleTPs = this.extractMultipleTPs(normalizedText);
      if (multipleTPs.length > 0) {
        result.multipleTP = multipleTPs;
      }

      // Estrai note aggiuntive (tutto dopo i dati principali)
      const notesMatch = normalizedText.match(/(?:note|note:|info|info:|📝|ℹ️)\s*(.+)/i);
      if (notesMatch && notesMatch[1]) {
        result.notes = notesMatch[1].trim();
      }
    }

    // Riconosci messaggi informativi (es. analisi, aggiornamenti, chiusure)
    const infoPatterns = [
      /\b(aggiornamento|update|chiuso|closed|chiudiamo|exit|uscita|stop|breakout|breakdown)\b/gi,
      /✅|❌|⏰|📢/g,
    ];

    if (this.matchesPattern(normalizedText, infoPatterns)) {
      result.hasInfo = true;
    }

    // Riconosci messaggi Break Even (operazione spostata a BE)
    const bePatterns = [
      /\b(operazione|trade|posizione)\s+(spostata|sposta|muovi|move)\s+(a|al|in)\s+BE\b/gi,
      /\b(break even|breakeven|BE)\s+(spostata|sposta|attivato|attivata)\b/gi,
      /\b(spostare|sposta)\s+(stop|sl)\s+(a|al|in)\s+BE\b/gi,
      /\bBE\s+(attivo|attiva|attivato|attivata)\b/gi,
    ];

    if (this.matchesPattern(normalizedText, bePatterns)) {
      result.isBreakEvenUpdate = true;
      result.hasInfo = true;
      
      // Cerca ID ordine di riferimento (se presente nel messaggio)
      const orderIdMatch = normalizedText.match(/\b(order|ordine|#|id)[:\s]*([a-zA-Z0-9_-]+)\b/gi);
      if (orderIdMatch && orderIdMatch[0]) {
        const idMatch = orderIdMatch[0].match(/([a-zA-Z0-9_-]+)/);
        if (idMatch && idMatch[1]) {
          result.referenceOrderId = idMatch[1];
        }
      }
    }

    return result;
  }

  private normalizeText(text: string): string {
    return text
      .replace(/[^\w\s@.,:;!?\-\[\](){}💰📈📉⬆️⬇️🔼🔽🚀📊✅❌⏰📢]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private matchesPattern(text: string, patterns: RegExp[]): boolean {
    return patterns.some(pattern => pattern.test(text));
  }

  private extractPrice(text: string, pattern: RegExp): string | null {
    const matches = [...text.matchAll(pattern)];
    if (matches.length > 0) {
      // Prendi l'ultimo match (spesso più preciso)
      const lastMatch = matches[matches.length - 1];
      if (lastMatch[2]) {
        return lastMatch[2].replace(/[,]/g, '.');
      }
    }
    return null;
  }

  /**
   * Estrae tutti i numeri che potrebbero essere prezzi dal messaggio
   */
  extractPrices(text: string): number[] {
    const numbers = text.match(/\b[\d.,]+\b/g);
    if (!numbers) return [];
    
    return numbers
      .map(n => parseFloat(n.replace(/,/g, '.')))
      .filter(n => !isNaN(n) && n > 0);
  }

  /**
   * Estrae TP multipli (TP1, TP2, TP3, ecc.)
   */
  private extractMultipleTPs(text: string): string[] {
    const tpPattern = /\b(tp[1-9]|target[1-9]|profitto[1-9])\s*:?\s*([\d.,]+)\b/gi;
    const matches = [...text.matchAll(tpPattern)];
    
    if (matches.length === 0) return [];
    
    // Ordina per numero TP e estrai prezzi
    const tps = matches
      .map(m => ({
        index: parseInt(m[1].match(/\d+/)?.[0] || '0'),
        price: m[2].replace(/,/g, '.')
      }))
      .sort((a, b) => a.index - b.index)
      .map(tp => tp.price);
    
    return tps;
  }
}

