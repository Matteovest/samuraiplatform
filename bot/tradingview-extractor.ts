/**
 * Estrattore di informazioni dai link TradingView
 */

export interface TradingViewLinkInfo {
  symbol?: string;
  interval?: string;
  timeframe?: string;
  fullUrl: string;
}

export class TradingViewLinkExtractor {
  private tradingViewDomainPattern = /tradingview\.com/i;
  private tradingViewChartPattern = /tradingview\.com\/chart/i;
  private tradingViewSymbolPattern = /[A-Z]{1,5}[A-Z0-9]*\/[A-Z]{1,5}|[A-Z]{1,5}USD|[A-Z]{1,5}EUR|BTC|ETH/gi;

  /**
   * Estrae tutti i link TradingView da un testo
   */
  extractLinks(text: string): string[] {
    const urlPattern = /https?:\/\/[^\s]+/g;
    const urls = text.match(urlPattern) || [];
    
    return urls.filter(url => 
      this.tradingViewDomainPattern.test(url)
    );
  }

  /**
   * Estrae informazioni da un link TradingView
   */
  extractInfoFromLink(url: string): TradingViewLinkInfo {
    const info: TradingViewLinkInfo = {
      fullUrl: url,
    };

    try {
      const urlObj = new URL(url);

      // Estrai simbolo dai parametri URL o dal path
      if (urlObj.searchParams.has('symbol')) {
        info.symbol = urlObj.searchParams.get('symbol')?.toUpperCase();
      } else {
        // Prova a estrarre dal path o dal testo intorno al link
        const symbolMatch = url.match(this.tradingViewSymbolPattern);
        if (symbolMatch && symbolMatch[0]) {
          info.symbol = symbolMatch[0].toUpperCase();
        }
      }

      // Estrai timeframe/interval
      if (urlObj.searchParams.has('interval')) {
        info.interval = urlObj.searchParams.get('interval') || undefined;
      }
      if (urlObj.searchParams.has('timeframe')) {
        info.timeframe = urlObj.searchParams.get('timeframe') || undefined;
      }

      // Estrai dal path (es. /chart/?symbol=BTCUSD&interval=5)
      const pathMatch = url.match(/\/chart\/.*[?&]symbol=([^&]+)/i);
      if (pathMatch && pathMatch[1]) {
        info.symbol = decodeURIComponent(pathMatch[1]).toUpperCase();
      }
    } catch (error) {
      console.error('Errore durante l\'estrazione delle informazioni dal link:', error);
    }

    return info;
  }

  /**
   * Verifica se un URL è un link TradingView
   */
  isTradingViewLink(url: string): boolean {
    return this.tradingViewDomainPattern.test(url);
  }

  /**
   * Normalizza un URL TradingView per renderlo compatibile con le API
   */
  normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      
      // Assicurati che sia un URL chart
      if (!urlObj.pathname.includes('/chart')) {
        urlObj.pathname = '/chart/';
      }

      return urlObj.toString();
    } catch {
      return url;
    }
  }
}

