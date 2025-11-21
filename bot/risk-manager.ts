/**
 * Risk Manager - Gestione rischio 0.4% per operazione
 */

export interface RiskCalculation {
  accountBalance: number;
  riskPercent: number; // 0.4%
  riskAmount: number; // In valuta base
  entry: number;
  stopLoss: number;
  pipValue: number;
  lotSize: number; // Calcolato per rischiare esattamente 0.4%
  maxLoss: number; // Loss massimo in pips
}

export class RiskManager {
  private riskPercent: number; // 0.4% di default
  private accountBalance: number;
  private defaultSpreadPips: number; // Spread medio per calcolo BE

  constructor(
    accountBalance: number,
    riskPercent: number = 0.4,
    defaultSpreadPips: number = 2 // 2 pip di default per spread
  ) {
    this.accountBalance = accountBalance;
    this.riskPercent = riskPercent;
    this.defaultSpreadPips = defaultSpreadPips;
  }

  /**
   * Calcola il volume (lot size) in base al rischio del 0.4%
   * IMPORTANTE: Usa interesse composto - il balance include già profitti precedenti
   */
  calculateLotSize(
    entry: number,
    stopLoss: number,
    symbol: string
  ): RiskCalculation {
    // Calcola la distanza in pips tra Entry e SL
    const pipDistance = this.calculatePipDistance(entry, stopLoss, symbol);
    
    // Calcola l'importo da rischiare (0.4% del balance CORRENTE)
    // IMPORTANTE: Questo è interesse composto - se i trade precedenti hanno chiuso in profitto,
    // il balance è aumentato, quindi questo trade userà il nuovo balance (più alto)
    const currentBalance = this.accountBalance; // Balance attuale (con profitti inclusi)
    const riskAmount = (currentBalance * this.riskPercent) / 100;
    
    // Calcola il valore di un pip per il simbolo
    const pipValue = this.calculatePipValue(symbol, entry);
    
    // Calcola il lot size necessario
    // riskAmount = pipDistance * pipValue * lotSize
    // lotSize = riskAmount / (pipDistance * pipValue)
    const lotSize = pipDistance > 0 
      ? Math.max(0.01, Math.round((riskAmount / (pipDistance * pipValue)) * 100) / 100)
      : 0.01; // Default a 0.01 se calcolo fallisce
    
    // Limita il lot size a valori ragionevoli
    const maxLotSize = this.accountBalance / 10000; // 1 lot ogni $10k
    const finalLotSize = Math.min(lotSize, maxLotSize);

    return {
      accountBalance: this.accountBalance,
      riskPercent: this.riskPercent,
      riskAmount,
      entry,
      stopLoss,
      pipValue,
      lotSize: finalLotSize,
      maxLoss: pipDistance,
    };
  }

  /**
   * Calcola la distanza in pips tra Entry e SL
   */
  private calculatePipDistance(entry: number, stopLoss: number, symbol: string): number {
    const distance = Math.abs(entry - stopLoss);
    
    // Determina il pip value in base al simbolo
    // Forex: 4 decimali per la maggior parte (es. EUR/USD)
    // Forex JPY: 2 decimali (es. USD/JPY)
    // Crypto: varia
    // Indices/CFD: varia
    
    let pipMultiplier = 0.0001; // Default per Forex (4 decimali)
    
    if (symbol.includes('JPY')) {
      pipMultiplier = 0.01; // JPY usa 2 decimali
    } else if (symbol.includes('XAU') || symbol.includes('GOLD')) {
      pipMultiplier = 0.01; // Oro usa 2 decimali
    } else if (symbol.includes('BTC') || symbol.includes('ETH') || symbol.includes('USDT')) {
      pipMultiplier = 1; // Crypto varia
    }
    
    return Math.round(distance / pipMultiplier);
  }

  /**
   * Calcola il valore di un pip per il simbolo
   */
  private calculatePipValue(symbol: string, price: number): number {
    // Valore pip per 1 lot standard
    // Forex: $10 per pip per 1 lot (per coppie con USD come quote currency)
    // Variabile per altre coppie
    
    let basePipValue = 10; // $10 per pip per 1 lot (default Forex)
    
    if (symbol.includes('JPY')) {
      basePipValue = price * 0.01; // Per JPY
    } else if (symbol.includes('XAU') || symbol.includes('GOLD')) {
      basePipValue = 100; // $100 per pip per 1 lot (oro)
    } else if (symbol.includes('BTC') || symbol.includes('ETH')) {
      basePipValue = price * 0.01; // Varia per crypto
    }
    
    return basePipValue;
  }

  /**
   * Aggiorna balance account (da chiamare quando si conosce il nuovo balance)
   * IMPORTANTE: Usa interesse composto - ogni trade usa il balance aggiornato
   */
  updateBalance(newBalance: number): void {
    const oldBalance = this.accountBalance;
    this.accountBalance = newBalance;
    console.log(`💰 Balance aggiornato: $${oldBalance.toFixed(2)} → $${newBalance.toFixed(2)}`);
  }

  /**
   * Aggiorna balance aggiungendo profit/loss (interesse composto)
   * IMPORTANTE: Questo è l'interesse composto - ogni trade successivo userà il nuovo balance
   */
  addProfitLoss(profitLoss: number): void {
    const oldBalance = this.accountBalance;
    this.accountBalance = this.accountBalance + profitLoss;
    const change = profitLoss > 0 ? '+' : '';
    console.log(`💰 Balance aggiornato (interesse composto): $${oldBalance.toFixed(2)} → $${this.accountBalance.toFixed(2)} (${change}$${profitLoss.toFixed(2)})`);
  }

  /**
   * Ottieni balance corrente (con interesse composto incluso)
   */
  getBalance(): number {
    return this.accountBalance;
  }

  /**
   * Salva balance su file per persistenza
   */
  async saveBalance(balanceFile: string = './temp/balance.json'): Promise<void> {
    try {
      const fs = await import('fs-extra');
      const path = await import('path');
      await fs.ensureDir(path.dirname(balanceFile));
      await fs.writeFile(balanceFile, JSON.stringify({
        balance: this.accountBalance,
        lastUpdated: new Date().toISOString(),
      }, null, 2), 'utf-8');
    } catch (error) {
      console.error('Errore salvataggio balance:', error);
    }
  }

  /**
   * Carica balance da file
   */
  async loadBalance(balanceFile: string = './temp/balance.json'): Promise<void> {
    try {
      const fs = await import('fs-extra');
      if (await fs.pathExists(balanceFile)) {
        const data = await fs.readFile(balanceFile, 'utf-8');
        const balanceData = JSON.parse(data);
        if (balanceData.balance) {
          this.accountBalance = balanceData.balance;
          console.log(`💰 Balance caricato: $${this.accountBalance.toFixed(2)}`);
        }
      }
    } catch (error) {
      console.error('Errore caricamento balance:', error);
    }
  }

  /**
   * Aggiorna risk percent
   */
  setRiskPercent(percent: number): void {
    if (percent <= 0 || percent > 10) {
      throw new Error('Risk percent deve essere tra 0 e 10');
    }
    this.riskPercent = percent;
  }

  /**
   * Calcola prezzo Break Even (Entry + spread per coprire costi)
   */
  calculateBreakEven(entry: number, orderType: 'long' | 'short' | 'buy' | 'sell', symbol: string): number {
    const isLong = orderType === 'long' || orderType === 'buy';
    
    // Calcola spread in pips e converte in prezzo
    const pipMultiplier = this.getPipMultiplier(symbol);
    const spreadInPrice = this.defaultSpreadPips * pipMultiplier;
    
    // Per LONG: BE = Entry + spread (per coprire spread su apertura)
    // Per SHORT: BE = Entry - spread
    const breakEven = isLong 
      ? entry + spreadInPrice
      : entry - spreadInPrice;
    
    return Math.round(breakEven / pipMultiplier) * pipMultiplier; // Arrotonda al pip più vicino
  }

  /**
   * Ottieni multiplier per pip in base al simbolo
   */
  private getPipMultiplier(symbol: string): number {
    if (symbol.includes('JPY')) {
      return 0.01;
    } else if (symbol.includes('XAU') || symbol.includes('GOLD')) {
      return 0.01;
    } else if (symbol.includes('BTC') || symbol.includes('ETH') || symbol.includes('USDT')) {
      return 1;
    }
    return 0.0001; // Default Forex
  }

  /**
   * Valida che il rischio sia accettabile
   */
  validateRisk(
    entry: number,
    stopLoss: number,
    symbol: string,
    maxRiskPercent: number = 1.0
  ): { valid: boolean; actualRiskPercent?: number; warning?: string } {
    const calculation = this.calculateLotSize(entry, stopLoss, symbol);
    const actualRisk = (calculation.maxLoss * calculation.pipValue * calculation.lotSize) / this.accountBalance * 100;
    
    if (actualRisk > maxRiskPercent) {
      return {
        valid: false,
        actualRiskPercent: actualRisk,
        warning: `Rischio troppo alto: ${actualRisk.toFixed(2)}% (massimo: ${maxRiskPercent}%)`,
      };
    }
    
    return {
      valid: true,
      actualRiskPercent: actualRisk,
    };
  }
}

