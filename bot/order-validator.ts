/**
 * Validatore per ordini di trading
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class OrderValidator {
  /**
   * Valida un ordine completo
   */
  validate(
    orderType: 'long' | 'short' | 'buy' | 'sell' | undefined,
    entry: string | undefined,
    takeProfit: string | undefined,
    stopLoss: string | undefined,
    symbol?: string
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const isLong = orderType === 'long' || orderType === 'buy';
    const isShort = orderType === 'short' || orderType === 'sell';

    // Validazione tipo ordine
    if (!orderType) {
      errors.push('Tipo di ordine non specificato');
    }

    // Validazione simbolo
    if (!symbol) {
      warnings.push('Simbolo non specificato');
    }

    // Validazione Entry
    if (!entry) {
      errors.push('Prezzo Entry non specificato');
    } else {
      const entryPrice = parseFloat(entry);
      if (isNaN(entryPrice) || entryPrice <= 0) {
        errors.push(`Entry non valido: ${entry}`);
      }

      // Validazione TP
      if (takeProfit) {
        const tpPrice = parseFloat(takeProfit);
        if (isNaN(tpPrice) || tpPrice <= 0) {
          errors.push(`Take Profit non valido: ${takeProfit}`);
        } else {
          // Per LONG: TP deve essere sopra Entry
          if (isLong && tpPrice <= entryPrice) {
            errors.push(`Per LONG, Take Profit (${tpPrice}) deve essere sopra Entry (${entryPrice})`);
          }
          // Per SHORT: TP deve essere sotto Entry
          if (isShort && tpPrice >= entryPrice) {
            errors.push(`Per SHORT, Take Profit (${tpPrice}) deve essere sotto Entry (${entryPrice})`);
          }
        }
      } else {
        warnings.push('Take Profit non specificato');
      }

      // Validazione SL
      if (stopLoss) {
        const slPrice = parseFloat(stopLoss);
        if (isNaN(slPrice) || slPrice <= 0) {
          errors.push(`Stop Loss non valido: ${stopLoss}`);
        } else {
          // Per LONG: SL deve essere sotto Entry
          if (isLong && slPrice >= entryPrice) {
            errors.push(`Per LONG, Stop Loss (${slPrice}) deve essere sotto Entry (${entryPrice})`);
          }
          // Per SHORT: SL deve essere sopra Entry
          if (isShort && slPrice <= entryPrice) {
            errors.push(`Per SHORT, Stop Loss (${slPrice}) deve essere sopra Entry (${entryPrice})`);
          }
        }
      } else {
        warnings.push('Stop Loss non specificato');
      }

      // Validazione Risk/Reward (se TP e SL sono presenti)
      if (takeProfit && stopLoss) {
        const tpPrice = parseFloat(takeProfit);
        const slPrice = parseFloat(stopLoss);
        
        if (!isNaN(tpPrice) && !isNaN(slPrice)) {
          const risk = Math.abs(entryPrice - slPrice);
          const reward = Math.abs(tpPrice - entryPrice);
          
          if (risk > 0) {
            const rr = reward / risk;
            
            if (rr < 0.5) {
              warnings.push(`Risk/Reward molto basso: ${rr.toFixed(2)}:1 (raccomandato almeno 1:1)`);
            } else if (rr > 5) {
              warnings.push(`Risk/Reward molto alto: ${rr.toFixed(2)}:1 (verifica se realistico)`);
            }

            // Verifica che SL non sia troppo vicino a Entry
            const slDistancePercent = (risk / entryPrice) * 100;
            if (slDistancePercent < 0.1) {
              warnings.push(`Stop Loss molto vicino a Entry (${slDistancePercent.toFixed(2)}%)`);
            }
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Valida TP multipli
   */
  validateMultipleTPs(
    orderType: 'long' | 'short' | 'buy' | 'sell' | undefined,
    entry: string | undefined,
    multipleTP: string[]
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const isLong = orderType === 'long' || orderType === 'buy';

    if (!entry) {
      errors.push('Entry richiesto per validare TP multipli');
      return { valid: false, errors, warnings };
    }

    const entryPrice = parseFloat(entry);
    if (isNaN(entryPrice)) {
      errors.push(`Entry non valido: ${entry}`);
      return { valid: false, errors, warnings };
    }

    if (multipleTP.length === 0) {
      return { valid: true, errors, warnings };
    }

    const tpPrices = multipleTP
      .map(tp => parseFloat(tp))
      .filter(price => !isNaN(price));

    if (tpPrices.length !== multipleTP.length) {
      errors.push('Alcuni TP multipli non sono numeri validi');
    }

    // Verifica ordine TP
    if (isLong) {
      // Per LONG: TP devono essere in ordine crescente (dal più vicino al più lontano)
      const sorted = [...tpPrices].sort((a, b) => a - b);
      const isOrdered = tpPrices.every((tp, i) => tp === sorted[i]);
      
      if (!isOrdered) {
        warnings.push('TP multipli non sono in ordine crescente per LONG');
      }

      // Verifica che tutti i TP siano sopra Entry
      const invalidTPs = tpPrices.filter(tp => tp <= entryPrice);
      if (invalidTPs.length > 0) {
        errors.push(`Per LONG, questi TP sono sotto Entry: ${invalidTPs.join(', ')}`);
      }
    } else {
      // Per SHORT: TP devono essere in ordine decrescente
      const sorted = [...tpPrices].sort((a, b) => b - a);
      const isOrdered = tpPrices.every((tp, i) => tp === sorted[i]);
      
      if (!isOrdered) {
        warnings.push('TP multipli non sono in ordine decrescente per SHORT');
      }

      // Verifica che tutti i TP siano sotto Entry
      const invalidTPs = tpPrices.filter(tp => tp >= entryPrice);
      if (invalidTPs.length > 0) {
        errors.push(`Per SHORT, questi TP sono sopra Entry: ${invalidTPs.join(', ')}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

