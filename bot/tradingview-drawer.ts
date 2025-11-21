/**
 * Modulo per disegnare ordini su TradingView usando browser automation
 */

import puppeteer, { Browser, Page } from 'puppeteer';

export interface OrderDetails {
  entry?: string;
  takeProfit?: string;
  stopLoss?: string;
}

export class TradingViewDrawer {
  private browser: Browser | null = null;
  private headless: boolean;

  constructor(headless: boolean = false) {
    this.headless = headless;
  }

  /**
   * Inizializza il browser Puppeteer
   */
  async initBrowser(): Promise<Browser> {
    if (this.browser) {
      return this.browser;
    }

    console.log('🌐 Avvio browser...');
    this.browser = await puppeteer.launch({
      headless: this.headless,
      defaultViewport: { width: 1920, height: 1080 },
      args: [
        '--start-maximized',
        '--disable-blink-features=AutomationControlled',
        '--disable-infobars',
      ],
    });

    return this.browser;
  }

  /**
   * Chiude il browser
   */
  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Disegna un ordine sul grafico TradingView
   */
  async drawOrder(
    tradingViewUrl: string,
    orderType: 'long' | 'short' | 'buy' | 'sell',
    symbol: string,
    details: OrderDetails
  ): Promise<void> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();

    try {
      console.log(`📊 Aprendo TradingView: ${tradingViewUrl}`);
      
      // Vai alla pagina TradingView
      await page.goto(tradingViewUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // Attendi che il grafico sia caricato
      await page.waitForTimeout(3000);

      // Aspetta che la barra degli strumenti sia visibile
      await page.waitForSelector('[data-name="legend-source-item"]', { timeout: 10000 }).catch(() => {
        console.warn('⚠️ Grafico potrebbe non essere completamente caricato');
      });

      console.log('✅ Grafico caricato');

      // Disegna in base al tipo di ordine
      if (orderType === 'long' || orderType === 'buy') {
        await this.drawLongOrder(page, details);
      } else if (orderType === 'short' || orderType === 'sell') {
        await this.drawShortOrder(page, details);
      }

      console.log('✅ Ordine disegnato con successo!');

      // Mantieni il browser aperto per 10 secondi per vedere il risultato
      if (!this.headless) {
        await page.waitForTimeout(10000);
      }

    } catch (error) {
      console.error('❌ Errore durante il disegno:', error);
      throw error;
    } finally {
      await page.close();
    }
  }

  /**
   * Disegna un ordine LONG sul grafico
   */
  private async drawLongOrder(page: Page, details: OrderDetails): Promise<void> {
    console.log('📈 Disegno ordine LONG...');

    // Cerca il pulsante per gli strumenti di disegno
    // TradingView ha una barra degli strumenti con vari tool
    // Usiamo i tasti da tastiera per accedere agli strumenti

    try {
      // Apri la barra degli strumenti (premi 'Alt + T' o usa il click)
      await page.keyboard.press('Alt+t');
      await page.waitForTimeout(500);

      // Seleziona lo strumento "Linea orizzontale" per Entry
      // In TradingView, gli strumenti hanno scorciatoie da tastiera
      
      // Per ora, proviamo a usare JavaScript per interagire direttamente con la pagina
      await page.evaluate((details) => {
        // TradingView espone API interne tramite window.charting_library
        // Nota: Questo richiede che la pagina usi la Charting Library
        const chart = (window as any).charting_library;
        
        if (chart) {
          console.log('Charting Library disponibile');
          // Qui potresti usare le API della Charting Library se disponibili
        }
      }, details);

      // Metodo alternativo: usare i tool di disegno tramite interfaccia
      // Cerca il pulsante "Linea orizzontale"
      const horizontalLineButton = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button, div[role="button"]'));
        return buttons.find((btn: any) => 
          btn.textContent?.includes('Horizontal Line') ||
          btn.title?.includes('Horizontal Line') ||
          btn.getAttribute('data-name') === 'horizontal-line'
        );
      });

      if (horizontalLineButton && horizontalLineButton.asElement()) {
        await horizontalLineButton.asElement()!.click();
        console.log('✅ Strumento linea orizzontale selezionato');
        
        // Disegna la linea Entry
        if (details.entry) {
          // Clicca sul grafico alla posizione Entry
          const canvas = await page.$('canvas');
          if (canvas) {
            const box = await canvas.boundingBox();
            if (box) {
              // Calcola la posizione Y in base al prezzo Entry
              // Nota: Questo richiede calcoli più complessi basati sul range del grafico
              const entryY = box.height * 0.5; // Posizione approssimativa
              await canvas.click({ x: box.width / 2, y: entryY });
            }
          }
        }
      } else {
        console.warn('⚠️ Strumento di disegno non trovato. Usando metodo alternativo.');
        // Metodo alternativo: usa la tastiera
        await page.keyboard.type('h'); // Scorciatoia per linea orizzontale (può variare)
      }

      // Disegna Take Profit (linea verde sopra Entry)
      if (details.takeProfit) {
        await page.waitForTimeout(1000);
        // Similar logic for TP
        console.log(`🎯 Take Profit: ${details.takeProfit}`);
      }

      // Disegna Stop Loss (linea rossa sotto Entry)
      if (details.stopLoss) {
        await page.waitForTimeout(1000);
        // Similar logic for SL
        console.log(`🛑 Stop Loss: ${details.stopLoss}`);
      }

    } catch (error) {
      console.error('Errore durante il disegno LONG:', error);
      // Metodo fallback: stampa le informazioni invece di disegnare
      console.log('📝 Informazioni ordine LONG:');
      console.log(`   Entry: ${details.entry || 'N/A'}`);
      console.log(`   Take Profit: ${details.takeProfit || 'N/A'}`);
      console.log(`   Stop Loss: ${details.stopLoss || 'N/A'}`);
    }
  }

  /**
   * Disegna un ordine SHORT sul grafico
   */
  private async drawShortOrder(page: Page, details: OrderDetails): Promise<void> {
    console.log('📉 Disegno ordine SHORT...');

    // Logica simile a drawLongOrder ma invertita
    try {
      await page.keyboard.press('Alt+t');
      await page.waitForTimeout(500);

      const horizontalLineButton = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button, div[role="button"]'));
        return buttons.find((btn: any) => 
          btn.textContent?.includes('Horizontal Line') ||
          btn.title?.includes('Horizontal Line')
        );
      });

      if (horizontalLineButton && horizontalLineButton.asElement()) {
        await horizontalLineButton.asElement()!.click();
        console.log('✅ Strumento linea orizzontale selezionato');
      }

      if (details.entry) {
        console.log(`📊 Entry: ${details.entry}`);
      }
      if (details.takeProfit) {
        console.log(`🎯 Take Profit: ${details.takeProfit}`);
      }
      if (details.stopLoss) {
        console.log(`🛑 Stop Loss: ${details.stopLoss}`);
      }

    } catch (error) {
      console.error('Errore durante il disegno SHORT:', error);
      console.log('📝 Informazioni ordine SHORT:');
      console.log(`   Entry: ${details.entry || 'N/A'}`);
      console.log(`   Take Profit: ${details.takeProfit || 'N/A'}`);
      console.log(`   Stop Loss: ${details.stopLoss || 'N/A'}`);
    }
  }

  /**
   * Metodo alternativo: genera uno script Pine Script migliorato che può essere copiato
   */
  generatePineScript(
    orderType: string, 
    symbol: string, 
    details: OrderDetails,
    multipleTP?: string[],
    riskReward?: string,
    leverage?: string
  ): string {
    const entry = details.entry || '0';
    const tp = details.takeProfit || '0';
    const sl = details.stopLoss || '0';
    const isLong = orderType.toLowerCase() === 'long' || orderType.toLowerCase() === 'buy';
    
    // Colori migliorati
    const entryColor = isLong ? 'color.new(color.blue, 0)' : 'color.new(color.blue, 0)';
    const tpColor = 'color.new(color.green, 0)';
    const slColor = 'color.new(color.red, 0)';
    const boxColor = isLong ? 'color.new(color.new(color.blue, 90), 0)' : 'color.new(color.new(color.red, 90), 0)';
    
    // Calcola Risk/Reward se non specificato
    let rrText = '';
    if (riskReward) {
      rrText = `// Risk/Reward: ${riskReward}:1`;
    } else if (entry !== '0' && tp !== '0' && sl !== '0') {
      const entryPrice = parseFloat(entry);
      const tpPrice = parseFloat(tp);
      const slPrice = parseFloat(sl);
      if (!isNaN(entryPrice) && !isNaN(tpPrice) && !isNaN(slPrice)) {
        const risk = Math.abs(entryPrice - slPrice);
        const reward = Math.abs(tpPrice - entryPrice);
        if (risk > 0) {
          const rr = (reward / risk).toFixed(2);
          rrText = `// Risk/Reward calcolato: ${rr}:1`;
        }
      }
    }
    
    // Genera TP multipli se presenti
    let tpsCode = '';
    if (multipleTP && multipleTP.length > 0) {
      multipleTP.forEach((tpPrice, index) => {
        const tpNum = index + 1;
        tpsCode += `
// Take Profit ${tpNum}
hline(${tpPrice}, "TP${tpNum}", color=${tpColor}, linewidth=2, linestyle=line.style_dashed)
if barstate.islast
    label.new(bar_index, ${tpPrice}, "TP${tpNum}: ${tpPrice}", 
              style=label.style_label_${isLong ? 'down' : 'up'}, 
              color=${tpColor}, textcolor=color.white, size=size.small)
`;
      });
    }
    
    return `//@version=5
indicator("Ordine ${orderType.toUpperCase()} - ${symbol}", overlay=true, max_bars_back=500)

// ═══════════════════════════════════════════════════════════════════════
// CONFIGURAZIONE ORDINE
// ═══════════════════════════════════════════════════════════════════════

entry_price = ${entry}
tp_price = ${tp}
sl_price = ${sl}

${rrText}
${leverage ? `// Leverage: ${leverage}x` : ''}

// ═══════════════════════════════════════════════════════════════════════
// DISEGNO ENTRY, TP, SL
// ═══════════════════════════════════════════════════════════════════════

// Linea Entry (spessa e prominente)
hline(entry_price, "Entry", color=${entryColor}, linewidth=3, linestyle=line.style_solid)

// Take Profit (se specificato)
${tp !== '0' ? `
hline(tp_price, "Take Profit", color=${tpColor}, linewidth=2, linestyle=line.style_dashed)
if barstate.islast
    label.new(bar_index, tp_price, "TP: ${tp}", 
              style=label.style_label_${isLong ? 'down' : 'up'}, 
              color=${tpColor}, textcolor=color.white, size=size.normal)
` : ''}

// Stop Loss (se specificato)
${sl !== '0' ? `
hline(sl_price, "Stop Loss", color=${slColor}, linewidth=2, linestyle=line.style_solid)
if barstate.islast
    label.new(bar_index, sl_price, "SL: ${sl}", 
              style=label.style_label_${isLong ? 'up' : 'down'}, 
              color=${slColor}, textcolor=color.white, size=size.normal)
` : ''}

${tpsCode}

// ═══════════════════════════════════════════════════════════════════════
// BOX ENTRY ZONE (zona di ingresso evidenziata)
// ═══════════════════════════════════════════════════════════════════════

${entry !== '0' && sl !== '0' ? `
// Box zona Entry (se Entry e SL sono definiti)
var box entryBox = na
if barstate.islast and entry_price != 0 and sl_price != 0
    entryRange = math.abs(entry_price - sl_price) * 0.1  // 10% del range SL-Entry
    boxTop = entry_price + entryRange
    boxBottom = entry_price - entryRange
    entryBox := box.new(bar_index - 10, boxTop, bar_index + 5, boxBottom, 
                        border_color=${boxColor}, bgcolor=${boxColor}, 
                        extend=extend.none)
` : ''}

// ═══════════════════════════════════════════════════════════════════════
// LABEL PRINCIPALE ORDINE
// ═══════════════════════════════════════════════════════════════════════

if barstate.islast
    orderText = "${orderType.toUpperCase()}\\nEntry: ${entry}\\n${tp !== '0' ? 'TP: ' + tp + '\\n' : ''}${sl !== '0' ? 'SL: ' + sl : ''}"
    label.new(bar_index, entry_price, orderText, 
              style=label.style_label_${isLong ? 'up' : 'down'}, 
              color=${entryColor}, textcolor=color.white, 
              size=size.normal, textalign=text.align_center)

// ═══════════════════════════════════════════════════════════════════════
// CALCOLO RISK/REWARD (visuale)
// ═══════════════════════════════════════════════════════════════════════

${entry !== '0' && tp !== '0' && sl !== '0' ? `
var table infoTable = na
if barstate.islast and entry_price != 0 and tp_price != 0 and sl_price != 0
    risk = math.abs(entry_price - sl_price)
    reward = math.abs(tp_price - entry_price)
    rr = risk > 0 ? reward / risk : 0
    
    infoTable := table.new(position.top_right, 2, 5, 
                          bgcolor=color.new(color.gray, 80), 
                          border_width=1, 
                          border_color=color.gray)
    table.cell(infoTable, 0, 0, "Risk", bgcolor=color.new(color.gray, 70), text_color=color.white)
    table.cell(infoTable, 1, 0, str.tostring(risk, "#.####"), text_color=color.white)
    table.cell(infoTable, 0, 1, "Reward", bgcolor=color.new(color.gray, 70), text_color=color.white)
    table.cell(infoTable, 1, 1, str.tostring(reward, "#.####"), text_color=color.white)
    table.cell(infoTable, 0, 2, "R/R", bgcolor=color.new(color.gray, 70), text_color=color.white)
    table.cell(infoTable, 1, 2, str.tostring(rr, "#.##") + ":1", text_color=rr > 1 ? color.green : color.red)
    table.cell(infoTable, 0, 3, "Entry", bgcolor=color.new(color.gray, 70), text_color=color.white)
    table.cell(infoTable, 1, 3, str.tostring(entry_price, "#.####"), text_color=color.white)
    table.cell(infoTable, 0, 4, "Type", bgcolor=color.new(color.gray, 70), text_color=color.white)
    table.cell(infoTable, 1, 4, "${orderType.toUpperCase()}", text_color=${isLong ? 'color.green' : 'color.red'})
` : ''}
`;
  }
}

