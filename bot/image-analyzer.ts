/**
 * Modulo per analizzare immagini TradingView e estrarre livelli di prezzo
 */

import { createWorker, Worker } from 'tesseract.js';
import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';
import { Message } from 'telegram/tl/custom/message';
import { TelegramClient } from 'telegram';

export interface ImageAnalysisResult {
  orderType?: 'long' | 'short' | 'buy' | 'sell';
  symbol?: string;
  entry?: string;
  takeProfit?: string;
  stopLoss?: string;
  prices?: number[]; // Tutti i prezzi rilevati nella barra laterale
}

export class ImageAnalyzer {
  private worker: Worker | null = null;
  private tempDir: string;

  constructor(tempDir: string = './temp') {
    this.tempDir = tempDir;
    fs.ensureDirSync(tempDir);
  }

  /**
   * Inizializza il worker OCR
   */
  async initWorker(): Promise<Worker> {
    if (this.worker) {
      return this.worker;
    }

    console.log('🔧 Inizializzazione OCR...');
    this.worker = await createWorker('eng', 1, {
      logger: (m: any) => {
        if (m.status === 'recognizing text') {
          // Log opzionale per debug
        }
      },
    });

    return this.worker;
  }

  /**
   * Chiude il worker OCR
   */
  async closeWorker(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }

  /**
   * Scarica un'immagine da un messaggio Telegram
   */
  async downloadTelegramImage(
    client: TelegramClient,
    message: Message
  ): Promise<string | null> {
    try {
      // Controlla se il messaggio ha una foto
      if (!message.photo && !message.media) {
        return null;
      }

      // Scarica l'immagine
      const buffer = await client.downloadMedia(message, {});
      
      if (!buffer) {
        return null;
      }

      // Salva in un file temporaneo
      const filename = `telegram_${message.id}_${Date.now()}.jpg`;
      const filepath = path.join(this.tempDir, filename);
      
      if (Buffer.isBuffer(buffer)) {
        await fs.writeFile(filepath, buffer);
      } else {
        // Se è già un path
        await fs.copy(buffer, filepath);
      }

      return filepath;
    } catch (error) {
      console.error('Errore durante il download dell\'immagine:', error);
      return null;
    }
  }

  /**
   * Scarica un'immagine da un URL
   */
  async downloadImageFromUrl(url: string): Promise<string | null> {
    try {
      const axios = (await import('axios')).default;
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000,
      });

      const filename = `url_${Date.now()}.jpg`;
      const filepath = path.join(this.tempDir, filename);
      
      await fs.writeFile(filepath, Buffer.from(response.data));
      
      return filepath;
    } catch (error) {
      console.error('Errore durante il download dell\'immagine da URL:', error);
      return null;
    }
  }

  /**
   * Estrae la regione della barra dei prezzi laterale (lato destro dell'immagine)
   */
  async extractPriceBarRegion(imagePath: string): Promise<string> {
    try {
      // Carica l'immagine e ottieni le dimensioni
      const metadata = await sharp(imagePath).metadata();
      const width = metadata.width || 1920;
      const height = metadata.height || 1080;

      // La barra dei prezzi è tipicamente nel 10-15% destro dell'immagine
      // e occupa tutta l'altezza del grafico (escludendo header/footer)
      const priceBarWidth = Math.floor(width * 0.12); // 12% della larghezza
      const priceBarLeft = width - priceBarWidth;
      const priceBarTop = Math.floor(height * 0.1); // 10% dall'alto (salta header)
      const priceBarHeight = Math.floor(height * 0.8); // 80% dell'altezza

      // Estrai la regione della barra dei prezzi
      const extractedPath = imagePath.replace('.jpg', '_pricebar.jpg');
      await sharp(imagePath)
        .extract({
          left: priceBarLeft,
          top: priceBarTop,
          width: priceBarWidth,
          height: priceBarHeight,
        })
        .normalize() // Migliora il contrasto
        .greyscale() // Converte in scala di grigi per miglior OCR
        .toFile(extractedPath);

      return extractedPath;
    } catch (error) {
      console.error('Errore durante l\'estrazione della barra dei prezzi:', error);
      return imagePath; // Ritorna l'immagine originale in caso di errore
    }
  }

  /**
   * Riconosce se l'immagine mostra una posizione LONG o SHORT
   */
  async detectOrderType(imagePath: string): Promise<'long' | 'short' | null> {
    try {
      // Analizza l'immagine per riconoscere frecce/linee che indicano direzione
      // Metodo 1: Cerca frecce verdi/rosse o pattern visivi
      // Metodo 2: Analizza la posizione del disegno rispetto al prezzo
      
      // Per ora usiamo una strategia semplice: analizza i colori dominanti
      // e la posizione relativa dei disegni
      
      const metadata = await sharp(imagePath).metadata();
      const width = metadata.width || 1920;
      const height = metadata.height || 1080;

      // Estrai una regione centrale del grafico per analisi
      const centerRegion = await sharp(imagePath)
        .extract({
          left: Math.floor(width * 0.2),
          top: Math.floor(height * 0.2),
          width: Math.floor(width * 0.6),
          height: Math.floor(height * 0.6),
        })
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Analizza i colori per capire se ci sono frecce verdi (long) o rosse (short)
      // Nota: Questa è una semplificazione, un'implementazione completa richiederebbe
      // un modello ML o pattern matching più sofisticato

      // Per ora, possiamo anche cercare nel testo OCR parole come "LONG", "SHORT", "BUY", "SELL"
      return null; // Ritorna null se non rilevato, verrà analizzato dal testo
    } catch (error) {
      console.error('Errore durante il riconoscimento del tipo di ordine:', error);
      return null;
    }
  }

  /**
   * Estrae tutti i prezzi dalla barra laterale usando OCR
   */
  async extractPricesFromPriceBar(priceBarPath: string): Promise<number[]> {
    const worker = await this.initWorker();
    
    try {
      console.log('📊 Analisi OCR della barra dei prezzi...');
      
      const { data: { text } } = await worker.recognize(priceBarPath);
      
      // Estrai numeri dal testo OCR
      const pricePattern = /\b\d+[.,]\d+\b/g;
      const matches = text.match(pricePattern) || [];
      
      // Converti in numeri
      const prices = matches
        .map((m: string) => parseFloat(m.replace(/,/g, '.')))
        .filter((p: number) => !isNaN(p) && p > 0)
        .sort((a: number, b: number) => b - a); // Ordina dal più alto al più basso

      console.log(`✅ Rilevati ${prices.length} prezzi:`, prices);
      
      return prices;
    } catch (error) {
      console.error('Errore durante l\'estrazione dei prezzi:', error);
      return [];
    }
  }

  /**
   * Analizza un'immagine TradingView completa
   */
  async analyzeTradingViewImage(imagePath: string): Promise<ImageAnalysisResult> {
    const result: ImageAnalysisResult = {};

    try {
      console.log('🔍 Analisi immagine TradingView...');
      
      // 1. Riconosci il tipo di ordine (long/short)
      const orderType = await this.detectOrderType(imagePath);
      if (orderType) {
        result.orderType = orderType;
      }

      // 2. Estrai la barra dei prezzi
      const priceBarPath = await this.extractPriceBarRegion(imagePath);
      console.log('📊 Barra dei prezzi estratta');

      // 3. Estrai tutti i prezzi dalla barra laterale
      const prices = await this.extractPricesFromPriceBar(priceBarPath);
      result.prices = prices;

      // 4. Identifica Entry, TP, SL dai prezzi estratti
      // Strategia: Il prezzo Entry è tipicamente al centro o vicino a linee orizzontali visibili
      // TP e SL sono sopra/sotto Entry per LONG, sotto/sopra per SHORT
      if (prices.length >= 3) {
        // Ordina i prezzi (dal più alto al più basso)
        const sortedPrices = [...prices].sort((a, b) => b - a);
        
        // Per LONG: Entry è tipicamente nel mezzo, TP sopra, SL sotto
        // Per SHORT: Entry è tipicamente nel mezzo, TP sotto, SL sopra
        if (orderType === 'long' || !orderType) {
          // Assumiamo che il prezzo centrale sia Entry
          const midIndex = Math.floor(sortedPrices.length / 2);
          result.entry = sortedPrices[midIndex].toString();
          
          // Prezzo più alto potrebbe essere TP
          if (sortedPrices.length > midIndex) {
            result.takeProfit = sortedPrices[0].toString();
          }
          
          // Prezzo più basso potrebbe essere SL
          if (sortedPrices.length > 1) {
            result.stopLoss = sortedPrices[sortedPrices.length - 1].toString();
          }
        } else if (orderType === 'short') {
          const midIndex = Math.floor(sortedPrices.length / 2);
          result.entry = sortedPrices[midIndex].toString();
          
          // Per SHORT: TP è sotto (prezzo più basso), SL è sopra (prezzo più alto)
          if (sortedPrices.length > 1) {
            result.takeProfit = sortedPrices[sortedPrices.length - 1].toString();
            result.stopLoss = sortedPrices[0].toString();
          }
        }
      } else if (prices.length === 1) {
        // Solo un prezzo: probabilmente Entry
        result.entry = prices[0].toString();
      }

      // 5. Cerca il simbolo nel testo OCR (analizzando tutta l'immagine)
      const worker = await this.initWorker();
      const { data: { text } } = await worker.recognize(imagePath);
      
      // Cerca pattern di simboli (es. EURUSD, BTC/USD, etc.)
      const symbolPattern = /\b([A-Z]{2,5}\/?[A-Z]{2,5}|[A-Z]{3,5}USD|BTC|ETH)\b/g;
      const symbolMatch = text.match(symbolPattern);
      if (symbolMatch && symbolMatch[0]) {
        result.symbol = symbolMatch[0].replace(/\s+/g, '').toUpperCase();
      }

      // Cerca anche nel testo per confermare LONG/SHORT se non già rilevato
      if (!result.orderType) {
        const textUpper = text.toUpperCase();
        if (textUpper.includes('LONG') || textUpper.includes('BUY')) {
          result.orderType = 'long';
        } else if (textUpper.includes('SHORT') || textUpper.includes('SELL')) {
          result.orderType = 'short';
        }
      }

      console.log('✅ Analisi completata:', result);

      return result;
    } catch (error) {
      console.error('Errore durante l\'analisi dell\'immagine:', error);
      return result;
    }
  }

  /**
   * Pulisce i file temporanei
   */
  async cleanup(imagePath: string): Promise<void> {
    try {
      if (imagePath && await fs.pathExists(imagePath)) {
        await fs.remove(imagePath);
      }
      // Rimuovi anche i file correlati (es. _pricebar.jpg)
      const relatedFiles = [
        imagePath.replace('.jpg', '_pricebar.jpg'),
      ];
      for (const file of relatedFiles) {
        if (await fs.pathExists(file)) {
          await fs.remove(file);
        }
      }
    } catch (error) {
      console.error('Errore durante la pulizia dei file temporanei:', error);
    }
  }
}

