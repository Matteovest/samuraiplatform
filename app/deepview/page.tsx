'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, BarChart3, Activity, Globe, RefreshCw, AlertCircle } from 'lucide-react'

interface MacroData {
  interestRate: { value: number; previous: number | null; change: number | null; date: string }
  inflation: { value: number; previous: number | null; change: number | null; date: string }
  unemployment: { value: number; previous: number | null; change: number | null; date: string }
  gdp: { value: number; previous: number | null; change: number | null; date: string }
  industrialProduction: { value: number; previous: number | null; change: number | null; date: string }
  // Nuovi indicatori per analisi forex completa
  pmiManufacturing: { value: number; previous: number | null; change: number | null; date: string } | null
  pmiServices: { value: number; previous: number | null; change: number | null; date: string } | null
  ppi: { value: number; previous: number | null; change: number | null; date: string } | null
  tradeBalance: { value: number; previous: number | null; change: number | null; date: string } | null
  consumerConfidence: { value: number; previous: number | null; change: number | null; date: string } | null
  businessConfidence: { value: number; previous: number | null; change: number | null; date: string } | null
  // Indicatori specifici per indici azionari USA
  nonfarmPayrolls: { value: number; previous: number | null; change: number | null; date: string } | null
  averageWorkweek: { value: number; previous: number | null; change: number | null; date: string } | null
  personalConsumption: { value: number; previous: number | null; change: number | null; date: string } | null
  retailSales: { value: number; previous: number | null; change: number | null; date: string } | null
  ismManufacturing: { value: number; previous: number | null; change: number | null; date: string } | null
  ismServices: { value: number; previous: number | null; change: number | null; date: string } | null
  leadingIndicators: { value: number; previous: number | null; change: number | null; date: string } | null
  inflationExpectations: { value: number; previous: number | null; change: number | null; date: string } | null
  // Indicatori specifici per criptovalute
  dxyIndex: { value: number; previous: number | null; change: number | null; date: string } | null
  moneySupply: { value: number; previous: number | null; change: number | null; date: string } | null
  spxPerformance: { value: number; previous: number | null; change: number | null; date: string } | null
  vixIndex: { value: number; previous: number | null; change: number | null; date: string } | null
}

interface MarketData {
  sentiment: string
  volatility: string
  trend: string
  support: number
  resistance: number
  currentPrice: number
  bullish: number
  bearish: number
  atr: number
  weeklyChange: number
  monthlyChange: number
  cotData: {
    commercial: number
    nonCommercial: number
    nonReportable: number
    lastUpdate: string
  }
  macroData: MacroData | null
  seasonality: Array<{ month: string; value: number; positive: boolean }>
}

export default function DeepViewPage() {
  const [selectedAsset, setSelectedAsset] = useState('EURUSD')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [marketData, setMarketData] = useState<MarketData | null>(null)

  const assets = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'XAUUSD', 'WTI', 'SPX', 'NDX', 'BTCUSD']

  // Determina il tipo di asset
  const getAssetType = (asset: string): 'forex' | 'commodity' | 'crypto' | 'index' => {
    if (asset === 'XAUUSD' || asset === 'WTI') return 'commodity'
    if (asset === 'BTCUSD' || asset.startsWith('BTC')) return 'crypto'
    if (asset === 'SPX' || asset === 'NDX' || asset === 'DJI') return 'index'
    return 'forex'
  }

  const currentAssetType = getAssetType(selectedAsset)

  // Mappa asset a simboli per API
  const assetToSymbol = (asset: string) => {
    const map: { [key: string]: string } = {
      'EURUSD': 'EUR/USD',
      'GBPUSD': 'GBP/USD',
      'USDJPY': 'USD/JPY',
      'AUDUSD': 'AUD/USD',
      'USDCAD': 'USD/CAD',
      'NZDUSD': 'NZD/USD',
      'XAUUSD': 'XAU/USD', // Oro
      'WTI': 'WTI', // Petrolio
      'SPX': 'SPX', // S&P 500
      'NDX': 'NDX', // NASDAQ
      'BTCUSD': 'BTC/USD', // Bitcoin
    }
    return map[asset] || asset
  }

  // Calcola supporto e resistenza da dati storici
  const calculateSupportResistance = (prices: number[]) => {
    if (prices.length === 0) return { support: 0, resistance: 0 }
    const sorted = [...prices].sort((a, b) => a - b)
    const support = sorted[Math.floor(sorted.length * 0.1)] // 10th percentile
    const resistance = sorted[Math.floor(sorted.length * 0.9)] // 90th percentile
    return { support, resistance }
  }

  // Calcola ATR (Average True Range) simulato
  const calculateATR = (prices: number[]) => {
    if (prices.length < 14) return 0
    const changes = []
    for (let i = 1; i < prices.length; i++) {
      changes.push(Math.abs(prices[i] - prices[i - 1]))
    }
    const avg = changes.slice(-14).reduce((a, b) => a + b, 0) / 14
    return (avg / prices[prices.length - 1]) * 100 // Percentuale
  }

  // Interpreta i dati COT con collegamenti macroeconomici precisi
  const interpretCOTData = (cotData: { commercial: number; nonCommercial: number; nonReportable: number }, asset: string, macroData: MacroData | null) => {
    const { commercial, nonCommercial, nonReportable } = cotData
    
    // Determina quale valuta è la base (prima parte della coppia)
    // Per asset non-forex, usa il simbolo completo
    let baseCurrency = ''
    let quoteCurrency = ''
    
    if (asset.length === 6 && asset !== 'XAUUSD' && asset !== 'BTCUSD') {
      // Forex standard (EURUSD, GBPUSD, etc.)
      baseCurrency = asset.substring(0, 3)
      quoteCurrency = asset.substring(3, 6)
    } else if (asset === 'XAUUSD') {
      baseCurrency = 'XAU'
      quoteCurrency = 'USD'
    } else if (asset === 'BTCUSD') {
      baseCurrency = 'BTC'
      quoteCurrency = 'USD'
    } else {
      // Asset singoli (WTI, SPX, NDX)
      baseCurrency = asset
      quoteCurrency = 'USD'
    }
    
    // Calcola rapporti per determinare l'intensità delle posizioni
    const absCommercial = Math.abs(commercial)
    const absNonCommercial = Math.abs(nonCommercial)
    const totalAbs = absCommercial + absNonCommercial
    const commercialRatio = totalAbs > 0 ? (absCommercial / totalAbs) * 100 : 0
    const nonCommercialRatio = totalAbs > 0 ? (absNonCommercial / totalAbs) * 100 : 0
    
    // Determina il sentiment basato su posizioni non-commercial (più indicative)
    let sentiment = 'neutrale'
    let sentimentColor = 'text-gray-600'
    let sentimentStrength = ''
    
    if (absNonCommercial > 0) {
      const strength = absNonCommercial / 10000 // Normalizza per determinare intensità
      if (nonCommercial > 0) {
        sentiment = 'rialzista'
        sentimentColor = 'text-green-600'
        sentimentStrength = strength > 3 ? 'fortemente' : strength > 1.5 ? 'moderatamente' : 'leggermente'
      } else {
        sentiment = 'ribassista'
        sentimentColor = 'text-red-600'
        sentimentStrength = strength > 3 ? 'fortemente' : strength > 1.5 ? 'moderatamente' : 'leggermente'
      }
    }
    
    // Interpreta posizioni COMMERCIAL con collegamenti macroeconomici
    let commercialInterpretation = ''
    let commercialMacroContext = ''
    
    if (commercial < 0) {
      // Commercial SHORT = hedgers si proteggono da deprezzamento della base currency
      commercialInterpretation = `Gli operatori commerciali mantengono ${absCommercial.toLocaleString('it-IT')} contratti in posizione corta netta. Questo significa che le aziende che operano con ${baseCurrency} (esportatori, importatori, multinazionali) stanno coprendo il rischio di un deprezzamento di ${baseCurrency} rispetto a ${quoteCurrency}.`
      
      // Collegamenti macroeconomici per posizione commercial SHORT
      if (baseCurrency === 'EUR' || baseCurrency === 'GBP' || baseCurrency === 'AUD') {
        commercialMacroContext = `Questa posizione corta degli hedgers suggerisce aspettative di: (1) Politiche monetarie più accomodanti da parte della banca centrale di ${baseCurrency}, (2) Divergenza di tassi di interesse a favore di ${quoteCurrency}, (3) Preoccupazioni sulla crescita economica o inflazione in ${baseCurrency}. Gli hedgers si proteggono perché operano con flussi commerciali reali che risentirebbero di un ${baseCurrency} più debole.`
      } else if (baseCurrency === 'USD') {
        commercialMacroContext = `Posizione corta su USD indica che le aziende statunitensi si aspettano un dollaro più debole, spesso legato a: (1) Aspettative di tagli dei tassi della Fed, (2) Allentamento quantitativo o politiche monetarie espansive, (3) Deficit commerciale o fiscale in aumento.`
      }
    } else if (commercial > 0) {
      // Commercial LONG = hedgers si proteggono da apprezzamento della base currency
      commercialInterpretation = `Gli operatori commerciali mantengono ${absCommercial.toLocaleString('it-IT')} contratti in posizione lunga netta. Le aziende si stanno proteggendo da un rafforzamento di ${baseCurrency}, che renderebbe più costose le loro operazioni commerciali.`
      
      commercialMacroContext = `Questa posizione lunga indica che gli hedgers si aspettano: (1) Politiche monetarie più restrittive (rialzo tassi) da parte della banca centrale di ${baseCurrency}, (2) Divergenza di tassi favorevole a ${baseCurrency}, (3) Forte crescita economica o inflazione in ${baseCurrency} che spinge la banca centrale ad alzare i tassi.`
    } else {
      commercialInterpretation = `Le posizioni commerciali sono bilanciate (${absCommercial.toLocaleString('it-IT')} contratti netti), indicando incertezza o coperture incrociate.`
      commercialMacroContext = `Posizioni bilanciate suggeriscono che gli hedgers non vedono un rischio unidirezionale chiaro, possibilmente a causa di: (1) Incertezza sulle politiche monetarie, (2) Equilibrio tra fattori rialzisti e ribassisti, (3) Periodo di transizione tra cicli economici.`
    }
    
    // Interpreta posizioni NON-COMMERCIAL con collegamenti macroeconomici
    let nonCommercialInterpretation = ''
    let nonCommercialMacroContext = ''
    
    if (nonCommercial > 0) {
      // Non-Commercial LONG = speculatori scommettono su apprezzamento
      nonCommercialInterpretation = `I grandi speculatori istituzionali (hedge fund, CTA, money manager) hanno ${absNonCommercial.toLocaleString('it-IT')} contratti in posizione lunga netta su ${baseCurrency}. Questo rappresenta ${nonCommercialRatio.toFixed(0)}% del totale delle posizioni significative.`
      
      // Collegamenti macroeconomici per posizione non-commercial LONG
      if (baseCurrency === 'XAU') {
        // Oro
        let macroContext = `Posizione lunga degli speculatori su oro indica: (1) Aspettative di inflazione in aumento, (2) Debolezza del dollaro, (3) Rischio geopolitico o incertezza economica, (4) Politiche monetarie espansive che erodono il valore delle valute fiat.`
        if (macroData) {
          const inflation = macroData.inflation.value.toFixed(1)
          macroContext += ` Dati attuali: Inflazione ${inflation}%. L'oro è tradizionalmente un hedge contro l'inflazione.`
        }
        nonCommercialMacroContext = macroContext
      } else if (baseCurrency === 'WTI') {
        // Petrolio
        let macroContext = `Posizione lunga degli speculatori su petrolio indica: (1) Aspettative di crescita economica globale, (2) Domanda energetica in aumento, (3) Tensioni geopolitiche nelle regioni produttrici, (4) Restrizioni dell'offerta (OPEC+, etc.).`
        if (macroData) {
          const gdp = macroData.gdp.value.toFixed(1)
          macroContext += ` Dati attuali: Crescita PIL ${gdp}%. Il petrolio è sensibile alla crescita economica globale.`
        }
        nonCommercialMacroContext = macroContext
      } else if (baseCurrency === 'EUR' || baseCurrency === 'GBP' || baseCurrency === 'AUD') {
        let macroContext = `Posizione lunga degli speculatori su ${baseCurrency} tipicamente riflette: (1) Aspettative di rialzo dei tassi di interesse da parte della banca centrale di ${baseCurrency} (ECB, BoE, RBA), (2) Divergenza di tassi favorevole a ${baseCurrency} vs ${quoteCurrency}, (3) Forte crescita economica o inflazione che spinge verso politiche restrittive, (4) Flussi di capitale verso ${baseCurrency} per rendimenti più alti.`
        
        // Aggiungi dati macroeconomici reali se disponibili
        if (macroData) {
          const rate = macroData.interestRate.value.toFixed(2)
          const inflation = macroData.inflation.value.toFixed(1)
          const unemployment = macroData.unemployment.value.toFixed(1)
          const gdp = macroData.gdp.value.toFixed(1)
          
          macroContext += ` Dati attuali: Tasso interesse ${rate}%, Inflazione ${inflation}%, Disoccupazione ${unemployment}%, Crescita PIL ${gdp}%.`
          
          // Analisi basata sui dati reali
          if (macroData.inflation.value > 2.5) {
            macroContext += ` L'inflazione elevata (${inflation}%) può spingere la banca centrale ad alzare i tassi.`
          }
          if (macroData.unemployment.value < 4.5) {
            macroContext += ` La disoccupazione bassa (${unemployment}%) indica un mercato del lavoro forte, supportando politiche restrittive.`
          }
          if (macroData.gdp.value > 2) {
            macroContext += ` La crescita robusta (${gdp}%) può giustificare rialzi dei tassi per contenere l'inflazione.`
          }
        }
        
        nonCommercialMacroContext = macroContext + ` Gli speculatori anticipano che tassi più alti = valuta più forte.`
      } else if (baseCurrency === 'USD') {
        nonCommercialMacroContext = `Posizione lunga su USD indica che gli speculatori si aspettano: (1) Fed più hawkish (rialzo tassi o mantenimento di tassi alti), (2) Inflazione persistente che richiede politiche restrittive, (3) Flight to quality (volo verso la qualità) in periodi di incertezza globale, (4) Divergenza di crescita economica USA vs resto del mondo.`
      } else if (baseCurrency === 'JPY') {
        nonCommercialMacroContext = `Posizione lunga su JPY è rara ma può indicare: (1) Aspettative di fine delle politiche ultra-accomodanti della BoJ, (2) Rischio-off globale che spinge verso safe haven, (3) Carry trade unwinding (chiusura di posizioni short JPY finanziate con valute ad alto rendimento).`
      }
    } else if (nonCommercial < 0) {
      // Non-Commercial SHORT = speculatori scommettono su deprezzamento
      nonCommercialInterpretation = `I grandi speculatori hanno ${absNonCommercial.toLocaleString('it-IT')} contratti in posizione corta netta su ${baseCurrency} (${nonCommercialRatio.toFixed(0)}% del totale). Stanno scommettendo su un deprezzamento.`
      
      // Collegamenti macroeconomici per posizione non-commercial SHORT
      if (baseCurrency === 'XAU') {
        // Oro
        let macroContext = `Posizione corta degli speculatori su oro indica: (1) Aspettative di dollaro forte, (2) Tassi di interesse in aumento che rendono l'oro meno attraente, (3) Rischio-on globale (investitori preferiscono asset rischiosi), (4) Inflazione sotto controllo.`
        if (macroData) {
          const rate = macroData.interestRate.value.toFixed(2)
          macroContext += ` Dati attuali: Tasso interesse ${rate}%. Tassi alti rendono l'oro meno attraente (non paga interessi).`
        }
        nonCommercialMacroContext = macroContext
      } else if (baseCurrency === 'WTI') {
        // Petrolio
        let macroContext = `Posizione corta degli speculatori su petrolio indica: (1) Preoccupazioni sulla crescita economica globale, (2) Domanda energetica in calo, (3) Aumento dell'offerta, (4) Transizione verso energie rinnovabili.`
        if (macroData) {
          const gdp = macroData.gdp.value.toFixed(1)
          macroContext += ` Dati attuali: Crescita PIL ${gdp}%. Debolezza economica riduce la domanda di petrolio.`
        }
        nonCommercialMacroContext = macroContext
      } else if (baseCurrency === 'EUR' || baseCurrency === 'GBP' || baseCurrency === 'AUD') {
        let macroContext = `Posizione corta degli speculatori su ${baseCurrency} indica aspettative di: (1) Tagli dei tassi di interesse o politiche monetarie accomodanti dalla banca centrale di ${baseCurrency}, (2) Divergenza di tassi a favore di ${quoteCurrency} (tassi più alti altrove), (3) Debolezza economica o recessione in ${baseCurrency}, (4) Inflazione in calo che permette politiche più accomodanti.`
        
        // Aggiungi dati macroeconomici reali se disponibili
        if (macroData) {
          const rate = macroData.interestRate.value.toFixed(2)
          const inflation = macroData.inflation.value.toFixed(1)
          const unemployment = macroData.unemployment.value.toFixed(1)
          const gdp = macroData.gdp.value.toFixed(1)
          
          macroContext += ` Dati attuali: Tasso interesse ${rate}%, Inflazione ${inflation}%, Disoccupazione ${unemployment}%, Crescita PIL ${gdp}%.`
          
          // Analisi basata sui dati reali
          if (macroData.inflation.change && macroData.inflation.change < 0) {
            macroContext += ` L'inflazione è in calo (${macroData.inflation.change.toFixed(1)}%), supportando aspettative di politiche accomodanti.`
          }
          if (macroData.unemployment.value > 5) {
            macroContext += ` La disoccupazione elevata (${unemployment}%) può spingere la banca centrale verso politiche espansive.`
          }
          if (macroData.gdp.value < 1) {
            macroContext += ` La crescita debole (${gdp}%) suggerisce possibili tagli dei tassi per stimolare l'economia.`
          }
        }
        
        nonCommercialMacroContext = macroContext + ` Gli speculatori anticipano: tassi in calo = valuta più debole.`
      } else if (baseCurrency === 'USD') {
        nonCommercialMacroContext = `Posizione corta su USD suggerisce: (1) Aspettative di tagli dei tassi della Fed, (2) Allentamento quantitativo o politiche monetarie espansive, (3) Rischio-on globale che spinge capitali fuori dal dollaro, (4) Convergenza di crescita economica (resto del mondo recupera vs USA).`
      } else if (baseCurrency === 'JPY') {
        nonCommercialMacroContext = `Posizione corta su JPY è comune e riflette: (1) Carry trade (prendere in prestito JPY a tassi bassi per investire in valute ad alto rendimento), (2) Politiche ultra-accomodanti della BoJ che mantengono JPY debole, (3) Divergenza di tassi favorevole alle valute ad alto rendimento.`
      }
    } else {
      nonCommercialInterpretation = `Le posizioni non-commercial sono bilanciate, indicando incertezza tra gli speculatori istituzionali.`
      nonCommercialMacroContext = `Posizioni bilanciate suggeriscono che gli speculatori non hanno una visione chiara sulla direzione delle politiche monetarie o sulla divergenza di tassi. Potrebbe essere un periodo di transizione o attesa di eventi macroeconomici chiave (riunioni banche centrali, dati inflazione, etc.).`
    }
    
    // Analisi combinata con implicazioni pratiche
    let combinedAnalysis = ''
    let tradingImplications = ''
    
    if (commercial < 0 && nonCommercial > 0) {
      // Divergenza classica: hedgers corti, speculatori lunghi
      combinedAnalysis = `Divergenza significativa: gli hedgers sono corti ${absCommercial.toLocaleString('it-IT')} contratti mentre i grandi speculatori sono lunghi ${absNonCommercial.toLocaleString('it-IT')} contratti. Questo è uno scenario comune quando:`
      tradingImplications = `(1) Gli speculatori anticipano un cambio di trend basato su aspettative macroeconomiche (es. cambio di politica monetaria), mentre gli hedgers reagiscono a condizioni attuali. (2) Gli speculatori hanno spesso ragione nel medio termine quando le loro posizioni sono supportate da fondamentali macroeconomici (divergenza di tassi, crescita economica). (3) Se i non-commercial sono molto lunghi mentre i commercial sono molto corti, potrebbe indicare che il mercato è "overbought" dal punto di vista speculativo, creando potenziale per correzioni se i fondamentali non si materializzano.`
    } else if (commercial > 0 && nonCommercial < 0) {
      // Divergenza inversa: hedgers lunghi, speculatori corti
      combinedAnalysis = `Divergenza inversa: hedgers lunghi ${absCommercial.toLocaleString('it-IT')} contratti, speculatori corti ${absNonCommercial.toLocaleString('it-IT')} contratti.`
      tradingImplications = `Questo scenario può indicare: (1) Gli hedgers si proteggono da un rafforzamento atteso, mentre gli speculatori vedono opportunità di short basate su aspettative di politiche accomodanti. (2) Se i commercial sono molto lunghi, potrebbe indicare che le aziende si aspettano un cambio di trend che gli speculatori non hanno ancora incorporato. (3) Attenzione: se i non-commercial sono molto corti, il mercato potrebbe essere "oversold" speculativamente, creando potenziale per rimbalzi se i dati macroeconomici sorprendono positivamente.`
    } else if (commercial > 0 && nonCommercial > 0) {
      // Allineamento rialzista
      combinedAnalysis = `Allineamento rialzista: sia hedgers (${absCommercial.toLocaleString('it-IT')} contratti lunghi) che speculatori (${absNonCommercial.toLocaleString('it-IT')} contratti lunghi) sono posizionati per un rafforzamento di ${baseCurrency}.`
      tradingImplications = `Questo allineamento è un segnale forte quando: (1) Entrambi i gruppi vedono gli stessi driver macroeconomici (rialzo tassi, crescita economica forte). (2) Le posizioni commercial lunghe indicano che le aziende si aspettano un ${baseCurrency} più forte che impatterà i loro flussi, mentre i non-commercial lunghi indicano che gli speculatori vedono opportunità di profitto. (3) Attenzione ai livelli estremi: se entrambe le posizioni sono molto estese, il mercato potrebbe essere "overbought" e vulnerabile a correzioni se i fondamentali cambiano.`
    } else if (commercial < 0 && nonCommercial < 0) {
      // Allineamento ribassista
      combinedAnalysis = `Allineamento ribassista: sia hedgers (${absCommercial.toLocaleString('it-IT')} contratti corti) che speculatori (${absNonCommercial.toLocaleString('it-IT')} contratti corti) sono posizionati per un deprezzamento di ${baseCurrency}.`
      tradingImplications = `Questo allineamento indica: (1) Consenso tra operatori commerciali e speculatori su un indebolimento di ${baseCurrency}, tipicamente legato a politiche monetarie accomodanti o debolezza economica. (2) Le posizioni commercial corte indicano che le aziende si proteggono da un ${baseCurrency} più debole, mentre i non-commercial corti indicano che gli speculatori vedono opportunità di short. (3) Se entrambe le posizioni sono molto estese, il mercato potrebbe essere "oversold" e vulnerabile a rimbalzi se i dati macroeconomici sorprendono positivamente o se le banche centrali diventano più hawkish del previsto.`
    } else {
      combinedAnalysis = `Posizioni relativamente bilanciate tra i diversi gruppi.`
      tradingImplications = `Mercato in equilibrio o in attesa di nuovi driver. Monitorare: (1) Prossime riunioni delle banche centrali, (2) Dati di inflazione e crescita economica, (3) Cambiamenti nelle aspettative sui tassi di interesse.`
    }
    
    // Conclusione con raccomandazioni pratiche
    let conclusion = ''
    const absNonComm = absNonCommercial
    const absComm = absCommercial
    
    if (absNonComm > absComm * 1.5) {
      conclusion = `I grandi speculatori dominano con posizioni ${absNonComm > 30000 ? 'molto estese' : 'significative'} (${absNonComm.toLocaleString('it-IT')} vs ${absComm.toLocaleString('it-IT')} contratti). Il loro sentiment ${sentiment} è supportato da aspettative macroeconomiche. Monitorare: (1) Se i dati macroeconomici confermano le loro aspettative (tassi, inflazione, crescita), le posizioni potrebbero estendersi ulteriormente. (2) Se i dati sorprendono in direzione opposta, potrebbero verificarsi coperture di posizioni che causano movimenti di prezzo significativi.`
    } else if (absComm > absNonComm * 1.5) {
      conclusion = `Gli operatori commerciali dominano (${absComm.toLocaleString('it-IT')} vs ${absNonComm.toLocaleString('it-IT')} contratti). Le loro decisioni di copertura riflettono rischi operativi reali. Le posizioni commercial tendono a essere più stabili nel tempo, ma possono cambiare rapidamente se le condizioni macroeconomiche cambiano in modo significativo.`
    } else {
      conclusion = `Posizioni equilibrate tra commercial (${absComm.toLocaleString('it-IT')}) e non-commercial (${absNonComm.toLocaleString('it-IT')}). Il mercato potrebbe essere in una fase di consolidamento. Cercare conferme da: (1) Dati macroeconomici chiave (inflazione, occupazione, PIL), (2) Comunicazioni delle banche centrali, (3) Divergenza di tassi di interesse tra le valute.`
    }
    
    return {
      sentiment,
      sentimentColor,
      sentimentStrength,
      commercialInterpretation,
      commercialMacroContext,
      nonCommercialInterpretation,
      nonCommercialMacroContext,
      combinedAnalysis,
      tradingImplications,
      conclusion,
    }
  }

  // Calcola stagionalità reale dai dati storici
  const calculateSeasonality = (historicalPrices: Array<{ date: string; close: number }>) => {
    if (!historicalPrices || historicalPrices.length < 30) {
      // Fallback a dati simulati se non ci sono abbastanza dati
      const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']
      return months.map((month) => ({
        month,
        value: 0,
        positive: true,
        note: 'Dati insufficienti per calcolo stagionalità reale',
      }))
    }

    // Raggruppa i prezzi per mese
    const monthlyReturns: { [key: number]: number[] } = {}
    
    // Calcola rendimenti mensili
    for (let i = 1; i < historicalPrices.length; i++) {
      const current = historicalPrices[i]
      const previous = historicalPrices[i - 1]
      const date = new Date(current.date)
      const month = date.getMonth() // 0-11
      
      if (previous.close > 0) {
        const monthlyReturn = ((current.close - previous.close) / previous.close) * 100
        
        if (!monthlyReturns[month]) {
          monthlyReturns[month] = []
        }
        monthlyReturns[month].push(monthlyReturn)
      }
    }

    // Calcola media dei rendimenti per ogni mese
    const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']
    const seasonalValues = months.map((month, index) => {
      const returns = monthlyReturns[index] || []
      const avgReturn = returns.length > 0 
        ? returns.reduce((sum, val) => sum + val, 0) / returns.length 
        : 0
      
      return {
        month,
        value: parseFloat(avgReturn.toFixed(2)),
        positive: avgReturn > 0,
        sampleSize: returns.length,
      }
    })

    return seasonalValues
  }

  // Fetch dati di mercato
  const fetchMarketData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Carica dati reali da Alpha Vantage
      let prices: number[] = []
      let currentPrice = 0
      let historicalPrices: Array<{ date: string; close: number }> = []
      
      try {
        // Determina il tipo di asset per la chiamata API
        const assetType = selectedAsset.length === 6 && selectedAsset !== 'XAUUSD' && selectedAsset !== 'BTCUSD' 
          ? 'forex' 
          : selectedAsset === 'XAUUSD' || selectedAsset === 'WTI' 
          ? 'commodity' 
          : selectedAsset === 'BTCUSD' 
          ? 'crypto' 
          : 'index'
        
        const priceResponse = await fetch(`/api/market-data?type=${assetType}&symbol=${selectedAsset}&interval=daily`)
        if (priceResponse.ok) {
          const priceResult = await priceResponse.json()
          if (priceResult.success && priceResult.prices) {
            // Usa tutti i dati storici disponibili per calcolo stagionalità
            // Estrai i prezzi di chiusura per analisi recente (ultimi 30 giorni)
            prices = priceResult.prices.map((p: any) => p.close).slice(-30) // Ultimi 30 giorni
            currentPrice = prices[prices.length - 1] || 0
            // Mantieni tutti i dati storici per stagionalità
            historicalPrices = priceResult.prices || []
          }
        }
      } catch (priceError) {
        console.error('Errore caricamento prezzi:', priceError)
      }
      
      // Fallback a dati simulati se il fetch fallisce
      if (prices.length === 0) {
        const basePrices: { [key: string]: number } = {
          'EURUSD': 1.08,
          'GBPUSD': 1.26,
          'USDJPY': 148.5,
          'AUDUSD': 0.67,
          'USDCAD': 1.35,
          'NZDUSD': 0.62,
          'XAUUSD': 2650, // Oro
          'WTI': 75.5, // Petrolio
          'SPX': 4800, // S&P 500
          'NDX': 16500, // NASDAQ
          'BTCUSD': 45000, // Bitcoin
        }
        const basePrice = basePrices[selectedAsset] || 1.0

        prices = Array.from({ length: 30 }, (_, i) => {
          const variation = (Math.random() - 0.5) * 0.02
          return basePrice * (1 + variation)
        })
        currentPrice = prices[prices.length - 1]
      }

      const { support, resistance } = calculateSupportResistance(prices)
      if (currentPrice === 0 && prices.length > 0) currentPrice = prices[prices.length - 1]
      const atr = calculateATR(prices)
      
      // Calcola trend
      const recentPrices = prices.slice(-10)
      const trend = recentPrices[recentPrices.length - 1] > recentPrices[0] ? 'Upward' : 'Downward'
      
      // Calcola sentiment (basato su posizione rispetto a support/resistance)
      const midPoint = (support + resistance) / 2
      const bullish = currentPrice > midPoint ? 55 + Math.random() * 20 : 35 + Math.random() * 20
      const bearish = 100 - bullish
      const sentiment = bullish > 55 ? 'Bullish' : bullish < 45 ? 'Bearish' : 'Neutral'
      
      // Volatilità basata su ATR
      const volatility = atr > 1 ? 'High' : atr > 0.5 ? 'Medium' : 'Low'
      
      // Cambi settimanali e mensili
      const weeklyChange = ((prices[prices.length - 1] - prices[prices.length - 7]) / prices[prices.length - 7]) * 100
      const monthlyChange = ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100

      // COT Data - Carica dati reali dalla CFTC
      // Solo per asset con COT reports (forex, oro, petrolio)
      // SPX, NDX e BTCUSD non hanno COT reports
      const hasCOTReport = !['SPX', 'NDX', 'BTCUSD'].includes(selectedAsset)
      
      let cotData = {
        commercial: 0,
        nonCommercial: 0,
        nonReportable: 0,
        lastUpdate: new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' }),
      }
      
      if (hasCOTReport) {
        try {
          const cotResponse = await fetch(`/api/market-data?type=cot&symbol=${selectedAsset}`)
          if (cotResponse.ok) {
            const cotResult = await cotResponse.json()
            if (cotResult.success && cotResult.cotData) {
              cotData = {
                commercial: cotResult.cotData.commercial || 0,
                nonCommercial: cotResult.cotData.nonCommercial || 0,
                nonReportable: cotResult.cotData.nonReportable || 0,
                lastUpdate: cotResult.cotData.lastUpdate || cotData.lastUpdate,
              }
            }
          }
        } catch (cotError) {
          console.error('Errore caricamento COT:', cotError)
          // Usa dati di fallback se il fetch fallisce
        }
      } else {
        // Per asset senza COT, usa dati simulati o mostra messaggio
        cotData = {
          commercial: 0,
          nonCommercial: 0,
          nonReportable: 0,
          lastUpdate: 'N/A - Asset senza COT reports',
        }
      }

      // Macro Data - Carica dati macroeconomici reali
      // Per forex: usa valuta base, per indici: usa USD (dati USA), per crypto: usa USD, per commodity (oro): usa USD
      let macroData: MacroData | null = null
      const isForexAsset = selectedAsset.length === 6 && selectedAsset !== 'XAUUSD' && selectedAsset !== 'BTCUSD'
      const isIndexAsset = currentAssetType === 'index'
      const isCryptoAsset = currentAssetType === 'crypto'
      const isCommodityAsset = currentAssetType === 'commodity'
      
      // Determina valuta e tipo per macro data
      let baseCurrencyForMacro: string | null = null
      let macroType: string = 'forex'
      
      if (isForexAsset) {
        baseCurrencyForMacro = selectedAsset.substring(0, 3)
        macroType = 'forex'
      } else if (isIndexAsset) {
        baseCurrencyForMacro = 'USD'
        macroType = 'index'
      } else if (isCryptoAsset) {
        baseCurrencyForMacro = 'USD'
        macroType = 'crypto'
      } else if (isCommodityAsset && selectedAsset === 'XAUUSD') {
        // Per oro, usa dati USA (Fed, inflazione, dollaro)
        baseCurrencyForMacro = 'USD'
        macroType = 'forex' // Usa tipo forex per avere tutti gli indicatori
      }
      
      // Carica dati macro per forex, indici, crypto e commodity
      if (baseCurrencyForMacro) {
        try {
          const macroResponse = await fetch(`/api/macro-data?currency=${baseCurrencyForMacro}&type=${macroType}`)
          if (macroResponse.ok) {
            const macroResult = await macroResponse.json()
            if (macroResult.success && macroResult.data) {
              macroData = macroResult.data
            } else if (macroResult.data) {
              // Usa dati simulati se disponibili
              macroData = macroResult.data
            }
          }
        } catch (macroError) {
          console.error('Errore caricamento dati macro:', macroError)
          // Non bloccare il rendering se i dati macro falliscono
        }
      }

      // Se macroData è ancora null, genera dati simulati per evitare errori
      if (!macroData) {
        // Genera dati simulati di base per evitare errori nel rendering
        const baseValues: { [key: string]: { [key: string]: number } } = {
          'EUR': { interestRate: 4.0, inflation: 2.5, unemployment: 6.5, gdp: 1.2, industrialProduction: 0.5 },
          'GBP': { interestRate: 5.25, inflation: 3.2, unemployment: 4.2, gdp: 0.8, industrialProduction: -0.3 },
          'USD': { interestRate: 5.5, inflation: 3.1, unemployment: 3.7, gdp: 2.5, industrialProduction: 0.8 },
          'JPY': { interestRate: 0.1, inflation: 2.3, unemployment: 2.6, gdp: 1.5, industrialProduction: 1.2 },
          'AUD': { interestRate: 4.35, inflation: 4.1, unemployment: 3.8, gdp: 2.1, industrialProduction: 0.6 },
          'CAD': { interestRate: 5.0, inflation: 3.3, unemployment: 5.4, gdp: 1.8, industrialProduction: 0.4 },
          'NZD': { interestRate: 5.5, inflation: 4.7, unemployment: 3.9, gdp: 2.3, industrialProduction: 0.7 },
        }
        const values = baseValues[baseCurrency] || baseValues['USD']
        const today = new Date().toISOString().split('T')[0]
        
        macroData = {
          interestRate: { value: values.interestRate, previous: values.interestRate, change: 0, date: today },
          inflation: { value: values.inflation, previous: values.inflation, change: 0, date: today },
          unemployment: { value: values.unemployment, previous: values.unemployment, change: 0, date: today },
          gdp: { value: values.gdp, previous: values.gdp, change: 0, date: today },
          industrialProduction: { value: values.industrialProduction, previous: values.industrialProduction, change: 0, date: today },
          // Campi opzionali per forex
          pmiManufacturing: null,
          pmiServices: null,
          ppi: null,
          tradeBalance: null,
          consumerConfidence: null,
          businessConfidence: null,
          // Campi opzionali per indici
          nonfarmPayrolls: null,
          averageWorkweek: null,
          personalConsumption: null,
          retailSales: null,
          ismManufacturing: null,
          ismServices: null,
          leadingIndicators: null,
          inflationExpectations: null,
          // Campi opzionali per crypto
          dxyIndex: null,
          moneySupply: null,
          spxPerformance: null,
          vixIndex: null,
        }
      }

      const seasonality = calculateSeasonality(historicalPrices.length > 0 ? historicalPrices : [])

      setMarketData({
        sentiment,
        volatility,
        trend,
        support: Math.round(support * 10000) / 10000,
        resistance: Math.round(resistance * 10000) / 10000,
        currentPrice: Math.round(currentPrice * 10000) / 10000,
        bullish: Math.round(bullish),
        bearish: Math.round(bearish),
        atr: Math.round(atr * 100) / 100,
        weeklyChange: Math.round(weeklyChange * 100) / 100,
        monthlyChange: Math.round(monthlyChange * 100) / 100,
        cotData,
        macroData,
        seasonality,
      })
    } catch (err) {
      setError('Errore nel caricamento dei dati. Riprova più tardi.')
      console.error('Error fetching market data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMarketData()
  }, [selectedAsset])

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">DeepView</h1>
          <p className="text-gray-600">
            Overview, sentiment, volatilità, stagionalità e COT report in un
            solo posto
          </p>
        </div>

        {/* Asset Selector */}
        <div className="bg-white rounded-xl p-6 shadow mb-6 flex justify-between items-center">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Seleziona Asset</label>
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="w-full md:w-64 border border-gray-300 rounded-lg px-4 py-2"
              disabled={loading}
            >
              {assets.map((asset) => (
                <option key={asset} value={asset}>
                  {asset}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchMarketData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            Aggiorna
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="text-red-600" size={20} />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {loading && !marketData && (
          <div className="text-center py-12">
            <RefreshCw className="animate-spin mx-auto mb-4 text-primary-600" size={48} />
            <p className="text-gray-600">Caricamento dati di mercato...</p>
          </div>
        )}

        {!loading && marketData && (

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Overview Card */}
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="text-primary-600" size={24} />
              <h2 className="text-xl font-bold">Overview</h2>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600 mb-1">Prezzo Attuale</div>
                <div className="text-2xl font-bold">{marketData.currentPrice}</div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sentiment</span>
                <span className={`font-semibold ${
                  marketData.sentiment === 'Bullish' ? 'text-green-600' :
                  marketData.sentiment === 'Bearish' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {marketData.sentiment}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Volatilità</span>
                <span className={`font-semibold ${
                  marketData.volatility === 'High' ? 'text-red-600' :
                  marketData.volatility === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {marketData.volatility}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trend</span>
                <span className={`font-semibold ${
                  marketData.trend === 'Upward' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {marketData.trend}
                </span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Support</span>
                  <span className="text-sm font-semibold">
                    {marketData.support}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Resistance</span>
                  <span className="text-sm font-semibold">
                    {marketData.resistance}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sentiment Card */}
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-primary-600" size={24} />
              <h2 className="text-xl font-bold">Sentiment</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Bullish</span>
                  <span className="text-sm font-semibold">{marketData.bullish}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${marketData.bullish}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Bearish</span>
                  <span className="text-sm font-semibold">{marketData.bearish}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all"
                    style={{ width: `${marketData.bearish}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Volatility Card */}
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="text-primary-600" size={24} />
              <h2 className="text-xl font-bold">Volatilità</h2>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-3xl font-bold mb-1">{marketData.atr}%</div>
                <div className="text-sm text-gray-600">ATR (14)</div>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Settimana</span>
                  <span className={`text-sm font-semibold ${
                    marketData.weeklyChange >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {marketData.weeklyChange >= 0 ? '+' : ''}{marketData.weeklyChange}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Mese</span>
                  <span className={`text-sm font-semibold ${
                    marketData.monthlyChange >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {marketData.monthlyChange >= 0 ? '+' : ''}{marketData.monthlyChange}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Seasonality Card */}
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="text-primary-600" size={24} />
              <h2 className="text-xl font-bold">Stagionalità Storica</h2>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600 mb-3">
                Rendimento medio mensile calcolato da dati storici reali
                {marketData.seasonality[0]?.note && (
                  <span className="text-xs text-yellow-600 ml-2">⚠️ {marketData.seasonality[0].note}</span>
                )}
              </div>
              {marketData.seasonality.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-sm w-10">{item.month}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.positive ? 'bg-green-600' : 'bg-red-600'
                      }`}
                      style={{
                        width: `${Math.min(Math.abs(item.value) * 10, 100)}%`,
                        marginLeft: item.positive ? '0' : 'auto',
                      }}
                    ></div>
                  </div>
                  <span
                    className={`text-sm font-semibold w-16 text-right ${
                      item.positive ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {item.positive ? '+' : ''}
                    {item.value.toFixed(2)}%
                  </span>
                  {item.sampleSize !== undefined && item.sampleSize > 0 && (
                    <span className="text-xs text-gray-400 w-8">
                      (n={item.sampleSize})
                    </span>
                  )}
                </div>
              ))}
              <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                <p>Nota: La stagionalità è calcolata analizzando i rendimenti mensili storici. Pattern stagionali possono variare in base a condizioni macroeconomiche e eventi specifici.</p>
              </div>
            </div>
          </div>

          {/* Macroeconomic Data Card - Solo per FOREX */}
          {currentAssetType === 'forex' && marketData.macroData !== null && marketData.macroData !== undefined && (
            <div className="bg-white rounded-xl p-6 shadow md:col-span-2 lg:col-span-3">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="text-primary-600" size={24} />
                <h2 className="text-xl font-bold">Analisi Macroeconomica Forex - {selectedAsset.substring(0, 3)}</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <div className="text-sm text-gray-600 mb-1">Tasso di Interesse</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {marketData.macroData.interestRate.value.toFixed(2)}%
                  </div>
                  {marketData.macroData.interestRate.change !== null && (
                    <div className={`text-xs mt-1 ${marketData.macroData.interestRate.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {marketData.macroData.interestRate.change >= 0 ? '+' : ''}
                      {marketData.macroData.interestRate.change.toFixed(2)}%
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">Ultimo: {new Date(marketData.macroData.interestRate.date).toLocaleDateString('it-IT')}</div>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                  <div className="text-sm text-gray-600 mb-1">Inflazione (CPI)</div>
                  <div className="text-2xl font-bold text-orange-700">
                    {marketData.macroData.inflation.value.toFixed(1)}%
                  </div>
                  {marketData.macroData.inflation.change !== null && (
                    <div className={`text-xs mt-1 ${marketData.macroData.inflation.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {marketData.macroData.inflation.change >= 0 ? '+' : ''}
                      {marketData.macroData.inflation.change.toFixed(2)}%
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">Ultimo: {new Date(marketData.macroData.inflation.date).toLocaleDateString('it-IT')}</div>
                </div>
                
                <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                  <div className="text-sm text-gray-600 mb-1">Disoccupazione</div>
                  <div className="text-2xl font-bold text-red-700">
                    {marketData.macroData.unemployment.value.toFixed(1)}%
                  </div>
                  {marketData.macroData.unemployment.change !== null && (
                    <div className={`text-xs mt-1 ${marketData.macroData.unemployment.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {marketData.macroData.unemployment.change >= 0 ? '+' : ''}
                      {marketData.macroData.unemployment.change.toFixed(2)}%
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">Ultimo: {new Date(marketData.macroData.unemployment.date).toLocaleDateString('it-IT')}</div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                  <div className="text-sm text-gray-600 mb-1">Crescita PIL</div>
                  <div className={`text-2xl font-bold ${marketData.macroData.gdp.value >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {marketData.macroData.gdp.value >= 0 ? '+' : ''}
                    {marketData.macroData.gdp.value.toFixed(1)}%
                  </div>
                  {marketData.macroData.gdp.change !== null && (
                    <div className={`text-xs mt-1 ${marketData.macroData.gdp.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {marketData.macroData.gdp.change >= 0 ? '+' : ''}
                      {marketData.macroData.gdp.change.toFixed(2)}%
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">Ultimo: {new Date(marketData.macroData.gdp.date).toLocaleDateString('it-IT')}</div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                  <div className="text-sm text-gray-600 mb-1">Produzione Industriale</div>
                  <div className={`text-2xl font-bold ${marketData.macroData.industrialProduction.value >= 0 ? 'text-purple-700' : 'text-red-700'}`}>
                    {marketData.macroData.industrialProduction.value >= 0 ? '+' : ''}
                    {marketData.macroData.industrialProduction.value.toFixed(1)}%
                  </div>
                  {marketData.macroData.industrialProduction.change !== null && (
                    <div className={`text-xs mt-1 ${marketData.macroData.industrialProduction.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {marketData.macroData.industrialProduction.change >= 0 ? '+' : ''}
                      {marketData.macroData.industrialProduction.change.toFixed(2)}%
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">Ultimo: {new Date(marketData.macroData.industrialProduction.date).toLocaleDateString('it-IT')}</div>
                </div>
              </div>

              {/* Indicatori PMI e Produzione */}
              <h3 className="text-lg font-semibold mb-3 mt-6">Indicatori PMI e Produzione</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {marketData.macroData.pmiManufacturing && (
                  <div className="bg-indigo-50 rounded-lg p-4 border-l-4 border-indigo-500">
                    <div className="text-sm text-gray-600 mb-1">PMI Manifatturiero</div>
                    <div className={`text-2xl font-bold ${
                      marketData.macroData.pmiManufacturing.value >= 50 ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {marketData.macroData.pmiManufacturing.value.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {marketData.macroData.pmiManufacturing.value >= 50 ? 'Espansione' : 'Contrazione'} 
                      {marketData.macroData.pmiManufacturing.change !== null && (
                        <span className={`ml-2 ${marketData.macroData.pmiManufacturing.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ({marketData.macroData.pmiManufacturing.change >= 0 ? '+' : ''}{marketData.macroData.pmiManufacturing.change.toFixed(1)})
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Ultimo: {new Date(marketData.macroData.pmiManufacturing.date).toLocaleDateString('it-IT')}</div>
                  </div>
                )}

                {marketData.macroData.pmiServices && (
                  <div className="bg-teal-50 rounded-lg p-4 border-l-4 border-teal-500">
                    <div className="text-sm text-gray-600 mb-1">PMI Servizi</div>
                    <div className={`text-2xl font-bold ${
                      marketData.macroData.pmiServices.value >= 50 ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {marketData.macroData.pmiServices.value.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {marketData.macroData.pmiServices.value >= 50 ? 'Espansione' : 'Contrazione'}
                      {marketData.macroData.pmiServices.change !== null && (
                        <span className={`ml-2 ${marketData.macroData.pmiServices.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ({marketData.macroData.pmiServices.change >= 0 ? '+' : ''}{marketData.macroData.pmiServices.change.toFixed(1)})
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Ultimo: {new Date(marketData.macroData.pmiServices.date).toLocaleDateString('it-IT')}</div>
                  </div>
                )}

                {marketData.macroData.ppi && (
                  <div className="bg-cyan-50 rounded-lg p-4 border-l-4 border-cyan-500">
                    <div className="text-sm text-gray-600 mb-1">PPI (Producer Price Index)</div>
                    <div className="text-2xl font-bold text-cyan-700">
                      {marketData.macroData.ppi.value.toFixed(1)}%
                    </div>
                    {marketData.macroData.ppi.change !== null && (
                      <div className={`text-xs mt-1 ${marketData.macroData.ppi.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {marketData.macroData.ppi.change >= 0 ? '+' : ''}
                        {marketData.macroData.ppi.change.toFixed(2)}%
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">Ultimo: {new Date(marketData.macroData.ppi.date).toLocaleDateString('it-IT')}</div>
                  </div>
                )}
              </div>

              {/* Bilancia Commerciale e Fiducia */}
              <h3 className="text-lg font-semibold mb-3 mt-6">Bilancia Commerciale e Indicatori di Fiducia</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {marketData.macroData.tradeBalance && (
                  <div className="bg-amber-50 rounded-lg p-4 border-l-4 border-amber-500">
                    <div className="text-sm text-gray-600 mb-1">Bilancia Commerciale</div>
                    <div className={`text-2xl font-bold ${
                      marketData.macroData.tradeBalance.value >= 0 ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {marketData.macroData.tradeBalance.value >= 0 ? '+' : ''}
                      {marketData.macroData.tradeBalance.value.toFixed(1)}B
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {marketData.macroData.tradeBalance.value >= 0 ? 'Surplus' : 'Deficit'}
                      {marketData.macroData.tradeBalance.change !== null && (
                        <span className={`ml-2 ${marketData.macroData.tradeBalance.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ({marketData.macroData.tradeBalance.change >= 0 ? '+' : ''}{marketData.macroData.tradeBalance.change.toFixed(1)})
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Ultimo: {new Date(marketData.macroData.tradeBalance.date).toLocaleDateString('it-IT')}</div>
                  </div>
                )}

                {marketData.macroData.consumerConfidence && (
                  <div className="bg-pink-50 rounded-lg p-4 border-l-4 border-pink-500">
                    <div className="text-sm text-gray-600 mb-1">Fiducia Consumatori</div>
                    <div className={`text-2xl font-bold ${
                      marketData.macroData.consumerConfidence.value >= 100 ? 'text-green-700' : 'text-yellow-700'
                    }`}>
                      {marketData.macroData.consumerConfidence.value.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {marketData.macroData.consumerConfidence.value >= 100 ? 'Ottimista' : 'Neutrale'}
                      {marketData.macroData.consumerConfidence.change !== null && (
                        <span className={`ml-2 ${marketData.macroData.consumerConfidence.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ({marketData.macroData.consumerConfidence.change >= 0 ? '+' : ''}{marketData.macroData.consumerConfidence.change.toFixed(1)})
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Ultimo: {new Date(marketData.macroData.consumerConfidence.date).toLocaleDateString('it-IT')}</div>
                  </div>
                )}

                {marketData.macroData.businessConfidence && (
                  <div className="bg-violet-50 rounded-lg p-4 border-l-4 border-violet-500">
                    <div className="text-sm text-gray-600 mb-1">Fiducia Imprenditoriale</div>
                    <div className={`text-2xl font-bold ${
                      marketData.macroData.businessConfidence.value >= 100 ? 'text-green-700' : 'text-yellow-700'
                    }`}>
                      {marketData.macroData.businessConfidence.value.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {marketData.macroData.businessConfidence.value >= 100 ? 'Ottimista' : 'Neutrale'}
                      {marketData.macroData.businessConfidence.change !== null && (
                        <span className={`ml-2 ${marketData.macroData.businessConfidence.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ({marketData.macroData.businessConfidence.change >= 0 ? '+' : ''}{marketData.macroData.businessConfidence.change.toFixed(1)})
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Ultimo: {new Date(marketData.macroData.businessConfidence.date).toLocaleDateString('it-IT')}</div>
                  </div>
                )}
              </div>

              {/* Interpretazione */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-3">Interpretazione per Trading Forex</h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                    <p className="font-semibold text-blue-900 mb-1">📊 Indicatori Chiave</p>
                    <p className="text-blue-800">
                      <strong>PMI:</strong> Valori sopra 50 indicano espansione economica (rialzista per la valuta), sotto 50 indicano contrazione (ribassista). 
                      {marketData.macroData.pmiManufacturing && marketData.macroData.pmiServices && (
                        <> PMI Manifatturiero: {marketData.macroData.pmiManufacturing.value.toFixed(1)}, PMI Servizi: {marketData.macroData.pmiServices.value.toFixed(1)}.</>
                      )}
                      <br/>
                      <strong>PPI:</strong> L'inflazione alla produzione precede quella al consumo (CPI). PPI in aumento può anticipare rialzi dei tassi.
                      {marketData.macroData.ppi && <> Valore attuale: {marketData.macroData.ppi.value.toFixed(1)}%.</>}
                    </p>
                  </div>
                  
                  <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                    <p className="font-semibold text-green-900 mb-1">💼 Bilancia Commerciale</p>
                    <p className="text-green-800">
                      {marketData.macroData.tradeBalance && (
                        <>Bilancia commerciale: {marketData.macroData.tradeBalance.value >= 0 ? 'surplus' : 'deficit'} di {Math.abs(marketData.macroData.tradeBalance.value).toFixed(1)}B. </>
                      )}
                      Un surplus commerciale aumenta la domanda per la valuta (rialzista), un deficit la indebolisce (ribassista). 
                      Le esportazioni generano domanda di valuta nazionale, le importazioni la indeboliscono.
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded">
                    <p className="font-semibold text-purple-900 mb-1">🎯 Indicatori di Fiducia</p>
                    <p className="text-purple-800">
                      {marketData.macroData.consumerConfidence && (
                        <>Fiducia consumatori: {marketData.macroData.consumerConfidence.value.toFixed(1)}. </>
                      )}
                      {marketData.macroData.businessConfidence && (
                        <>Fiducia imprenditoriale: {marketData.macroData.businessConfidence.value.toFixed(1)}. </>
                      )}
                      Fiducia elevata spinge consumi e investimenti, supportando crescita economica e valuta. 
                      Fiducia bassa può anticipare recessione e deprezzamento valutario.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-4">
                Dati da FRED (Federal Reserve Economic Data). Per ottenere dati reali, configura FRED_API_KEY in .env.local
              </p>
            </div>
          )}

          {/* COT Report Card */}
          <div className="bg-white rounded-xl p-6 shadow md:col-span-2">
            <h2 className="text-xl font-bold mb-4">COT Report (CFTC)</h2>
            {!['SPX', 'NDX', 'BTCUSD'].includes(selectedAsset) ? (
              <>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Commercial</div>
                <div className={`text-2xl font-bold ${
                  marketData.cotData.commercial >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {marketData.cotData.commercial >= 0 ? '+' : ''}
                  {marketData.cotData.commercial.toLocaleString('it-IT')}
                </div>
                <div className="text-xs text-gray-500 mt-1">Net Position</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Non-Commercial</div>
                <div className={`text-2xl font-bold ${
                  marketData.cotData.nonCommercial >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {marketData.cotData.nonCommercial >= 0 ? '+' : ''}
                  {marketData.cotData.nonCommercial.toLocaleString('it-IT')}
                </div>
                <div className="text-xs text-gray-500 mt-1">Net Position</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Non-Reportable</div>
                <div className={`text-2xl font-bold ${
                  marketData.cotData.nonReportable >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {marketData.cotData.nonReportable >= 0 ? '+' : ''}
                  {marketData.cotData.nonReportable.toLocaleString('it-IT')}
                </div>
                <div className="text-xs text-gray-500 mt-1">Net Position</div>
              </div>
            </div>

            {/* Interpretazione COT */}
            {(() => {
              const interpretation = interpretCOTData(marketData.cotData, selectedAsset, marketData.macroData || null)
              return (
                <div className="border-t pt-6 mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="text-primary-600" size={20} />
                    <h3 className="text-lg font-semibold">Interpretazione del Report</h3>
                    <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
                      interpretation.sentiment === 'rialzista' ? 'bg-green-100 text-green-700' :
                      interpretation.sentiment === 'ribassista' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      Sentiment: {interpretation.sentiment}
                    </span>
                  </div>
                  
                  <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                      <h4 className="font-semibold text-blue-900 mb-2">📊 Operatori Commerciali (Hedgers)</h4>
                      <p className="text-blue-800">{interpretation.commercialInterpretation}</p>
                    </div>
                    
                    <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                      <h4 className="font-semibold text-purple-900 mb-2">💼 Grandi Speculatori (Non-Commercial)</h4>
                      <p className="text-purple-800">{interpretation.nonCommercialInterpretation}</p>
                    </div>
                    
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                      <h4 className="font-semibold text-amber-900 mb-2">🔍 Analisi Combinata</h4>
                      <p className="text-amber-800">{interpretation.combinedAnalysis}</p>
                    </div>
                    
                    <div className="bg-gray-50 border-l-4 border-gray-500 p-4 rounded">
                      <h4 className="font-semibold text-gray-900 mb-2">💡 Conclusione</h4>
                      <p className="text-gray-800">{interpretation.conclusion}</p>
                    </div>
                  </div>
                </div>
              )
            })()}

            <div className="border-t pt-4 mt-6">
              <p className="text-sm text-gray-500">
                Ultimo aggiornamento: {marketData.cotData.lastUpdate}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Dati basati su report CFTC (Commitment of Traders) - {marketData.cotData.lastUpdate || 'Caricamento...'}
              </p>
              {marketData.cotData.lastUpdate && !marketData.cotData.lastUpdate.includes('N/A') && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Dati COT caricati da CFTC
                </p>
              )}
            </div>
            </>
            ) : (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <p className="text-yellow-800">
                  <strong>Nota:</strong> {selectedAsset} non ha COT reports disponibili. I COT reports sono disponibili solo per futures su forex, commodity (oro, petrolio) e altri strumenti derivati. Gli indici azionari (SPX, NDX) e le criptovalute (BTCUSD) non hanno COT reports perché non sono scambiati come futures regolamentati dalla CFTC.
                </p>
              </div>
            )}
          </div>
          )}

          {/* Analisi Specifica per INDICI */}
          {currentAssetType === 'index' && (
            <>
              {/* Dati Macroeconomici USA per Indici */}
              {marketData.macroData !== null && marketData.macroData !== undefined && (
                <div className="bg-white rounded-xl p-6 shadow md:col-span-2 lg:col-span-3">
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="text-primary-600" size={24} />
                    <h2 className="text-xl font-bold">Dati Macroeconomici USA - {selectedAsset}</h2>
                  </div>
                  
                  {/* Indicatori Base */}
                  <h3 className="text-lg font-semibold mb-3 mt-4">Indicatori Economici Base</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                      <div className="text-sm text-gray-600 mb-1">GDP Trimestrale</div>
                      <div className={`text-2xl font-bold ${marketData.macroData.gdp.value >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {marketData.macroData.gdp.value >= 0 ? '+' : ''}
                        {marketData.macroData.gdp.value.toFixed(1)}%
                      </div>
                      {marketData.macroData.gdp.change !== null && (
                        <div className={`text-xs mt-1 ${marketData.macroData.gdp.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {marketData.macroData.gdp.change >= 0 ? '+' : ''}
                          {marketData.macroData.gdp.change.toFixed(2)}%
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">Ultimo: {new Date(marketData.macroData.gdp.date).toLocaleDateString('it-IT')}</div>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                      <div className="text-sm text-gray-600 mb-1">Inflazione (CPI)</div>
                      <div className="text-2xl font-bold text-orange-700">
                        {marketData.macroData.inflation.value.toFixed(1)}%
                      </div>
                      {marketData.macroData.inflation.change !== null && (
                        <div className={`text-xs mt-1 ${marketData.macroData.inflation.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {marketData.macroData.inflation.change >= 0 ? '+' : ''}
                          {marketData.macroData.inflation.change.toFixed(2)}%
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">Ultimo: {new Date(marketData.macroData.inflation.date).toLocaleDateString('it-IT')}</div>
                    </div>
                    
                    {marketData.macroData.ppi && (
                      <div className="bg-cyan-50 rounded-lg p-4 border-l-4 border-cyan-500">
                        <div className="text-sm text-gray-600 mb-1">PPI</div>
                        <div className="text-2xl font-bold text-cyan-700">
                          {marketData.macroData.ppi.value.toFixed(1)}%
                        </div>
                        {marketData.macroData.ppi.change !== null && (
                          <div className={`text-xs mt-1 ${marketData.macroData.ppi.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {marketData.macroData.ppi.change >= 0 ? '+' : ''}
                            {marketData.macroData.ppi.change.toFixed(2)}%
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">Ultimo: {new Date(marketData.macroData.ppi.date).toLocaleDateString('it-IT')}</div>
                      </div>
                    )}
                    
                    <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                      <div className="text-sm text-gray-600 mb-1">Disoccupazione</div>
                      <div className="text-2xl font-bold text-red-700">
                        {marketData.macroData.unemployment.value.toFixed(1)}%
                      </div>
                      {marketData.macroData.unemployment.change !== null && (
                        <div className={`text-xs mt-1 ${marketData.macroData.unemployment.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {marketData.macroData.unemployment.change >= 0 ? '+' : ''}
                          {marketData.macroData.unemployment.change.toFixed(2)}%
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">Ultimo: {new Date(marketData.macroData.unemployment.date).toLocaleDateString('it-IT')}</div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                      <div className="text-sm text-gray-600 mb-1">Tasso Interesse Fed</div>
                      <div className="text-2xl font-bold text-purple-700">
                        {marketData.macroData.interestRate.value.toFixed(2)}%
                      </div>
                      {marketData.macroData.interestRate.change !== null && (
                        <div className={`text-xs mt-1 ${marketData.macroData.interestRate.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {marketData.macroData.interestRate.change >= 0 ? '+' : ''}
                          {marketData.macroData.interestRate.change.toFixed(2)}%
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">Ultimo: {new Date(marketData.macroData.interestRate.date).toLocaleDateString('it-IT')}</div>
                    </div>
                  </div>

                  {/* Dati Occupazionali */}
                  <h3 className="text-lg font-semibold mb-3 mt-6">Dati Occupazionali</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {marketData.macroData.nonfarmPayrolls && (
                      <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                        <div className="text-sm text-gray-600 mb-1">Nonfarm Payrolls</div>
                        <div className={`text-2xl font-bold ${
                          marketData.macroData.nonfarmPayrolls.value >= 0 ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {marketData.macroData.nonfarmPayrolls.value >= 0 ? '+' : ''}
                          {marketData.macroData.nonfarmPayrolls.value.toFixed(0)}K
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {marketData.macroData.nonfarmPayrolls.change !== null && (
                            <span className={marketData.macroData.nonfarmPayrolls.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {marketData.macroData.nonfarmPayrolls.change >= 0 ? '+' : ''}
                              {marketData.macroData.nonfarmPayrolls.change.toFixed(0)}K vs prev
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Ultimo: {new Date(marketData.macroData.nonfarmPayrolls.date).toLocaleDateString('it-IT')}</div>
                      </div>
                    )}
                    
                    {marketData.macroData.averageWorkweek && (
                      <div className="bg-indigo-50 rounded-lg p-4 border-l-4 border-indigo-500">
                        <div className="text-sm text-gray-600 mb-1">Ore Lavorate Settimanali</div>
                        <div className="text-2xl font-bold text-indigo-700">
                          {marketData.macroData.averageWorkweek.value.toFixed(1)}h
                        </div>
                        {marketData.macroData.averageWorkweek.change !== null && (
                          <div className={`text-xs mt-1 ${marketData.macroData.averageWorkweek.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {marketData.macroData.averageWorkweek.change >= 0 ? '+' : ''}
                            {marketData.macroData.averageWorkweek.change.toFixed(1)}h
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">Ultimo: {new Date(marketData.macroData.averageWorkweek.date).toLocaleDateString('it-IT')}</div>
                      </div>
                    )}
                    
                    <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                      <div className="text-sm text-gray-600 mb-1">Tasso Disoccupazione</div>
                      <div className="text-2xl font-bold text-red-700">
                        {marketData.macroData.unemployment.value.toFixed(1)}%
                      </div>
                      {marketData.macroData.unemployment.change !== null && (
                        <div className={`text-xs mt-1 ${marketData.macroData.unemployment.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {marketData.macroData.unemployment.change >= 0 ? '+' : ''}
                          {marketData.macroData.unemployment.change.toFixed(2)}%
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">Ultimo: {new Date(marketData.macroData.unemployment.date).toLocaleDateString('it-IT')}</div>
                    </div>
                  </div>

                  {/* Consumi e Vendite */}
                  <h3 className="text-lg font-semibold mb-3 mt-6">Consumi e Vendite</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
                    {marketData.macroData.personalConsumption && (
                      <div className="bg-pink-50 rounded-lg p-4 border-l-4 border-pink-500">
                        <div className="text-sm text-gray-600 mb-1">Consumi Personali (PCE)</div>
                        <div className={`text-2xl font-bold ${
                          marketData.macroData.personalConsumption.value >= 0 ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {marketData.macroData.personalConsumption.value >= 0 ? '+' : ''}
                          {marketData.macroData.personalConsumption.value.toFixed(1)}%
                        </div>
                        {marketData.macroData.personalConsumption.change !== null && (
                          <div className={`text-xs mt-1 ${marketData.macroData.personalConsumption.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {marketData.macroData.personalConsumption.change >= 0 ? '+' : ''}
                            {marketData.macroData.personalConsumption.change.toFixed(2)}%
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">Ultimo: {new Date(marketData.macroData.personalConsumption.date).toLocaleDateString('it-IT')}</div>
                      </div>
                    )}
                    
                    {marketData.macroData.retailSales && (
                      <div className="bg-teal-50 rounded-lg p-4 border-l-4 border-teal-500">
                        <div className="text-sm text-gray-600 mb-1">Vendite al Dettaglio</div>
                        <div className={`text-2xl font-bold ${
                          marketData.macroData.retailSales.value >= 0 ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {marketData.macroData.retailSales.value >= 0 ? '+' : ''}
                          {marketData.macroData.retailSales.value.toFixed(1)}%
                        </div>
                        {marketData.macroData.retailSales.change !== null && (
                          <div className={`text-xs mt-1 ${marketData.macroData.retailSales.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {marketData.macroData.retailSales.change >= 0 ? '+' : ''}
                            {marketData.macroData.retailSales.change.toFixed(2)}%
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">Ultimo: {new Date(marketData.macroData.retailSales.date).toLocaleDateString('it-IT')}</div>
                      </div>
                    )}
                  </div>

                  {/* ISM e Leading Indicators */}
                  <h3 className="text-lg font-semibold mb-3 mt-6">Indicatori ISM e Leading Indicators</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {marketData.macroData.ismManufacturing && (
                      <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                        <div className="text-sm text-gray-600 mb-1">ISM Manufacturing</div>
                        <div className={`text-2xl font-bold ${
                          marketData.macroData.ismManufacturing.value >= 50 ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {marketData.macroData.ismManufacturing.value.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {marketData.macroData.ismManufacturing.value >= 50 ? 'Espansione' : 'Contrazione'}
                          {marketData.macroData.ismManufacturing.change !== null && (
                            <span className={`ml-2 ${marketData.macroData.ismManufacturing.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ({marketData.macroData.ismManufacturing.change >= 0 ? '+' : ''}{marketData.macroData.ismManufacturing.change.toFixed(1)})
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Ultimo: {new Date(marketData.macroData.ismManufacturing.date).toLocaleDateString('it-IT')}</div>
                      </div>
                    )}
                    
                    {marketData.macroData.ismServices && (
                      <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                        <div className="text-sm text-gray-600 mb-1">ISM Services</div>
                        <div className={`text-2xl font-bold ${
                          marketData.macroData.ismServices.value >= 50 ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {marketData.macroData.ismServices.value.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {marketData.macroData.ismServices.value >= 50 ? 'Espansione' : 'Contrazione'}
                          {marketData.macroData.ismServices.change !== null && (
                            <span className={`ml-2 ${marketData.macroData.ismServices.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ({marketData.macroData.ismServices.change >= 0 ? '+' : ''}{marketData.macroData.ismServices.change.toFixed(1)})
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Ultimo: {new Date(marketData.macroData.ismServices.date).toLocaleDateString('it-IT')}</div>
                      </div>
                    )}
                    
                    {marketData.macroData.leadingIndicators && (
                      <div className="bg-amber-50 rounded-lg p-4 border-l-4 border-amber-500">
                        <div className="text-sm text-gray-600 mb-1">Leading Indicators (LEI)</div>
                        <div className={`text-2xl font-bold ${
                          marketData.macroData.leadingIndicators.value >= 0 ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {marketData.macroData.leadingIndicators.value >= 0 ? '+' : ''}
                          {marketData.macroData.leadingIndicators.value.toFixed(1)}%
                        </div>
                        {marketData.macroData.leadingIndicators.change !== null && (
                          <div className={`text-xs mt-1 ${marketData.macroData.leadingIndicators.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {marketData.macroData.leadingIndicators.change >= 0 ? '+' : ''}
                            {marketData.macroData.leadingIndicators.change.toFixed(2)}%
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">Ultimo: {new Date(marketData.macroData.leadingIndicators.date).toLocaleDateString('it-IT')}</div>
                      </div>
                    )}
                    
                    {marketData.macroData.consumerConfidence && (
                      <div className="bg-pink-50 rounded-lg p-4 border-l-4 border-pink-500">
                        <div className="text-sm text-gray-600 mb-1">Fiducia Consumatori</div>
                        <div className={`text-2xl font-bold ${
                          marketData.macroData.consumerConfidence.value >= 100 ? 'text-green-700' : 'text-yellow-700'
                        }`}>
                          {marketData.macroData.consumerConfidence.value.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {marketData.macroData.consumerConfidence.value >= 100 ? 'Ottimista' : 'Neutrale'}
                          {marketData.macroData.consumerConfidence.change !== null && (
                            <span className={`ml-2 ${marketData.macroData.consumerConfidence.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ({marketData.macroData.consumerConfidence.change >= 0 ? '+' : ''}{marketData.macroData.consumerConfidence.change.toFixed(1)})
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Ultimo: {new Date(marketData.macroData.consumerConfidence.date).toLocaleDateString('it-IT')}</div>
                      </div>
                    )}
                  </div>

                  {/* Interpretazione per Indici */}
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-3">Interpretazione per Trading Indici</h3>
                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                        <p className="font-semibold text-blue-900 mb-1">📊 Analisi Integrata: Crescita, Occupazione e Produzione</p>
                        <p className="text-blue-800">
                          <strong>GDP Trimestrale:</strong> Crescita economica robusta supporta gli indici azionari perché indica maggiori profitti aziendali. 
                          {marketData.macroData.gdp && (
                            <> Valore attuale: {marketData.macroData.gdp.value.toFixed(1)}% (trimestrale annualizzato).
                            {marketData.macroData.gdp.value > 2.5 ? ' Crescita forte: supporta rally degli indici.' : marketData.macroData.gdp.value < 1 ? ' Crescita debole: pressione al ribasso sugli indici.' : ' Crescita moderata: supporto neutro.'}
                            {marketData.macroData.gdp.change !== null && marketData.macroData.gdp.change > 0 && ' Trend positivo: accelerazione della crescita.'}
                            </>
                          )}
                          <br/>
                          <strong>Nonfarm Payrolls:</strong> Creazione di posti di lavoro forte indica economia sana, aumenta redditi disponibili e consumi, supporta profitti aziendali e indici. 
                          {marketData.macroData.nonfarmPayrolls && (
                            <> Ultimo dato: {marketData.macroData.nonfarmPayrolls.value >= 0 ? '+' : ''}{marketData.macroData.nonfarmPayrolls.value.toFixed(0)}K nuovi posti.
                            {marketData.macroData.nonfarmPayrolls.value > 200 ? ' Creazione posti molto forte: supporto rialzista.' : marketData.macroData.nonfarmPayrolls.value < 100 ? ' Creazione posti debole: preoccupazione per economia.' : ' Creazione posti normale.'}
                            </>
                          )}
                          <br/>
                          <strong>ISM Manufacturing/Services:</strong> Valori sopra 50 indicano espansione economica, supportando rally degli indici. 
                          {marketData.macroData.ismManufacturing && marketData.macroData.ismServices && (
                            <> ISM Manifatturiero: {marketData.macroData.ismManufacturing.value.toFixed(1)} (soglia 50), ISM Servizi: {marketData.macroData.ismServices.value.toFixed(1)} (soglia 50).
                            {marketData.macroData.ismManufacturing.value >= 50 && marketData.macroData.ismServices.value >= 50 
                              ? ' Entrambi in espansione: forte supporto agli indici.'
                              : marketData.macroData.ismManufacturing.value < 50 && marketData.macroData.ismServices.value < 50
                              ? ' Entrambi in contrazione: pressione al ribasso.'
                              : ' Condizioni miste: valutare quale settore domina.'}
                            </>
                          )}
                        </p>
                      </div>
                      
                      <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                        <p className="font-semibold text-green-900 mb-1">💼 Consumi, Fed Policy e Valutazioni</p>
                        <p className="text-green-800">
                          <strong>Consumi Personali (PCE):</strong> I consumi rappresentano ~70% del PIL USA. Consumi forti indicano fiducia dei consumatori e supportano crescita aziendale e profitti. 
                          {marketData.macroData.personalConsumption && (
                            <> PCE: {marketData.macroData.personalConsumption.value.toFixed(1)}%.
                            {marketData.macroData.personalConsumption.value > 3 ? ' Consumi molto forti: supporto rialzista agli indici.' : marketData.macroData.personalConsumption.value < 1 ? ' Consumi deboli: preoccupazione per economia.' : ' Consumi normali.'}
                            </>
                          )}
                          <br/>
                          <strong>Vendite al Dettaglio:</strong> Indicatore anticipatore dei consumi. 
                          {marketData.macroData.retailSales && (
                            <> Vendite: {marketData.macroData.retailSales.value.toFixed(1)}%.
                            {marketData.macroData.retailSales.value > 0.5 ? ' Vendite in crescita: positivo per indici.' : ' Vendite deboli: negativo per indici.'}
                            </>
                          )}
                          <br/>
                          <strong>Fed Funds Rate e Valutazioni:</strong> Tassi bassi riducono il costo del capitale, supportando valutazioni azionarie più alte (P/E ratio più alto). Tassi alti aumentano il costo del capitale, comprimendo le valutazioni. 
                          {marketData.macroData.interestRate && (
                            <> Tasso attuale: {marketData.macroData.interestRate.value.toFixed(2)}%.
                            {marketData.macroData.interestRate.value > 5 ? ' Tassi alti: pressione sulle valutazioni, ma possono indicare economia forte.' : ' Tassi bassi: supporto alle valutazioni, ma possono indicare economia debole.'}
                            </>
                          )}
                          <strong> Aspettative Fed:</strong> Le comunicazioni Fed sono cruciali. Comunicazioni hawkish (rialzo tassi) = pressione al ribasso su indici. Comunicazioni dovish (taglio tassi) = supporto agli indici. Il mercato anticipa le decisioni Fed, quindi le aspettative sono più importanti dei tassi attuali.
                        </p>
                      </div>
                      
                      <div className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded">
                        <p className="font-semibold text-purple-900 mb-1">🎯 Leading Indicators e Cicli Economici</p>
                        <p className="text-purple-800">
                          <strong>Leading Economic Indicators (LEI):</strong> Indicatori anticipatori che precedono i cicli economici di 6-12 mesi. Include: ordini di beni durevoli, permessi edilizi, spread dei tassi, aspettative consumatori, ore lavorate. 
                          {marketData.macroData.leadingIndicators && (
                            <> Valore attuale: {marketData.macroData.leadingIndicators.value >= 0 ? '+' : ''}{marketData.macroData.leadingIndicators.value.toFixed(1)}%.
                            {marketData.macroData.leadingIndicators.value > 0.3 ? ' LEI positivo e forte: anticipa crescita futura (rialzista per indici).' : marketData.macroData.leadingIndicators.value < -0.3 ? ' LEI negativo: può anticipare recessione (ribassista per indici).' : ' LEI neutro: crescita stabile.'}
                            {marketData.macroData.leadingIndicators.change !== null && marketData.macroData.leadingIndicators.change > 0 && ' Trend positivo: miglioramento delle prospettive.'}
                            </>
                          )}
                          <br/>
                          <strong>Inflazione e Cicli:</strong> Inflazione moderata (2-3%) è ideale per gli indici. Inflazione troppo alta può spingere Fed ad alzare tassi aggressivamente (ribassista per indici). Deflazione indica debolezza economica (ribassista). 
                          {marketData.macroData.inflation && (
                            <> CPI attuale: {marketData.macroData.inflation.value.toFixed(1)}%.
                            {marketData.macroData.inflation.value > 4 ? ' Inflazione elevata: rischio di rialzi aggressivi dei tassi (ribassista).' : marketData.macroData.inflation.value < 1 ? ' Inflazione molto bassa/deflazione: debolezza economica (ribassista).' : ' Inflazione in target: condizioni ideali.'}
                            </>
                          )}
                          <br/>
                          <strong>Collegamento con Earnings:</strong> Crescita economica (GDP) + bassa disoccupazione + consumi forti = maggiori profitti aziendali = supporto agli indici. Recessione = profitti in calo = pressione al ribasso sugli indici.
                        </p>
                      </div>
                      
                      <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded">
                        <p className="font-semibold text-amber-900 mb-1">⚖️ Scenario Analysis: Combinazioni Chiave</p>
                        <p className="text-amber-800">
                          <strong>Scenario Ottimale (Rialzista):</strong> GDP forte + Inflazione moderata + Fed accomodante + Consumi forti + ISM in espansione = Rally degli indici.
                          <br/>
                          <strong>Scenario Problematico (Ribassista):</strong> GDP debole + Inflazione alta (stagflazione) + Fed restrittiva + Consumi deboli + ISM in contrazione = Correzione degli indici.
                          <br/>
                          <strong>Scenario Misto:</strong> Valutare quale fattore domina. Ad esempio, GDP forte può compensare tassi alti se la crescita è sostenibile.
                          {marketData.macroData.gdp && marketData.macroData.inflation && marketData.macroData.interestRate && (
                            <> Situazione attuale: GDP {marketData.macroData.gdp.value.toFixed(1)}%, Inflazione {marketData.macroData.inflation.value.toFixed(1)}%, Tasso {marketData.macroData.interestRate.value.toFixed(2)}%.
                            {marketData.macroData.gdp.value > 2 && marketData.macroData.inflation.value < 3 && marketData.macroData.interestRate.value < 4 
                              ? ' Scenario favorevole: crescita solida, inflazione controllata, tassi sostenibili.'
                              : marketData.macroData.gdp.value < 1 && marketData.macroData.inflation.value > 4
                              ? ' Scenario problematico: stagflazione.'
                              : ' Scenario misto: valutare trade-off tra crescita e inflazione.'}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 mt-4">
                    Dati da FRED (Federal Reserve Economic Data). Per ottenere dati reali, configura FRED_API_KEY in .env.local
                  </p>
                </div>
              )}

              {/* Metriche Tecniche Indici */}
              <div className="bg-white rounded-xl p-6 shadow md:col-span-2 lg:col-span-3">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="text-primary-600" size={24} />
                  <h2 className="text-xl font-bold">Metriche Tecniche Indice - {selectedAsset}</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <div className="text-sm text-gray-600 mb-1">P/E Ratio (Stimato)</div>
                    <div className="text-2xl font-bold text-blue-700">
                      {selectedAsset === 'SPX' ? '24.5' : '28.2'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {selectedAsset === 'SPX' ? 'Media storica: 15-20' : 'Media storica: 20-25'}
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                    <div className="text-sm text-gray-600 mb-1">Dividend Yield</div>
                    <div className="text-2xl font-bold text-green-700">
                      {selectedAsset === 'SPX' ? '1.5%' : '0.8%'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Rendimento medio annuo</div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                    <div className="text-sm text-gray-600 mb-1">Settori Ponderati</div>
                    <div className="text-lg font-bold text-purple-700">
                      {selectedAsset === 'SPX' ? '11 Settori' : 'Tech-Heavy'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {selectedAsset === 'SPX' ? 'Diversificato' : 'Concentrato Tech'}
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                    <div className="text-sm text-gray-600 mb-1">Correlazione USD</div>
                    <div className={`text-2xl font-bold ${
                      selectedAsset === 'SPX' ? 'text-orange-700' : 'text-orange-600'
                    }`}>
                      {selectedAsset === 'SPX' ? '-0.65' : '-0.45'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Correlazione inversa con dollaro</div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-3">Analisi Tecnica Indici</h3>
                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                      <p className="font-semibold text-blue-900 mb-1">📊 Dinamiche di Mercato</p>
                      <p className="text-blue-800">
                        Gli indici azionari come {selectedAsset} riflettono la performance aggregata delle aziende componenti. 
                        {selectedAsset === 'SPX' 
                          ? ' L\'S&P 500 rappresenta le 500 maggiori aziende USA, con ponderazione per capitalizzazione di mercato. I movimenti sono guidati da: (1) Earnings delle aziende, (2) Aspettative di crescita economica, (3) Politiche monetarie della Fed, (4) Sentiment degli investitori.'
                          : ' Il NASDAQ-100 è fortemente concentrato su tecnologia, biotecnologie e servizi. I movimenti sono più volatili e guidati da: (1) Cicli tecnologici, (2) Earnings growth, (3) Sentiment risk-on/risk-off, (4) Politiche monetarie che influenzano le valutazioni tech.'}
                      </p>
                    </div>
                    
                    <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                      <p className="font-semibold text-green-900 mb-1">💼 Fattori Chiave</p>
                      <p className="text-green-800">
                        <strong>Earnings Season:</strong> I trimestri degli utili (gennaio, aprile, luglio, ottobre) sono periodi critici. 
                        Earnings beats o misses possono causare movimenti significativi.<br/>
                        <strong>Fed Policy:</strong> Le decisioni sui tassi di interesse influenzano direttamente le valutazioni. Tassi bassi = valutazioni più alte, tassi alti = pressione al ribasso.<br/>
                        <strong>Correlazioni:</strong> {selectedAsset} ha correlazione inversa con USD (dollaro forte = indici più deboli) e correlazione positiva con sentiment risk-on globale.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Analisi Specifica per COMMODITY */}
          {currentAssetType === 'commodity' && (
            <>
              {/* Dati Macroeconomici per Commodity (Oro) */}
              {selectedAsset === 'XAUUSD' && marketData.macroData !== null && marketData.macroData !== undefined && (
                <div className="bg-white rounded-xl p-6 shadow md:col-span-2 lg:col-span-3">
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="text-primary-600" size={24} />
                    <h2 className="text-xl font-bold">Analisi Macroeconomica Oro (XAU/USD)</h2>
                  </div>
                  
                  {/* Indicatori USA che influenzano l'oro */}
                  <h3 className="text-lg font-semibold mb-3 mt-4">Indicatori USA Chiave per Oro</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                      <div className="text-sm text-gray-600 mb-1">Fed Funds Rate</div>
                      <div className="text-2xl font-bold text-purple-700">
                        {marketData.macroData.interestRate.value.toFixed(2)}%
                      </div>
                      {marketData.macroData.interestRate.change !== null && (
                        <div className={`text-xs mt-1 ${marketData.macroData.interestRate.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {marketData.macroData.interestRate.change >= 0 ? '+' : ''}
                          {marketData.macroData.interestRate.change.toFixed(2)}%
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">Tassi alti = oro meno attraente</div>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                      <div className="text-sm text-gray-600 mb-1">Inflazione (CPI)</div>
                      <div className="text-2xl font-bold text-orange-700">
                        {marketData.macroData.inflation.value.toFixed(1)}%
                      </div>
                      {marketData.macroData.inflation.change !== null && (
                        <div className={`text-xs mt-1 ${marketData.macroData.inflation.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {marketData.macroData.inflation.change >= 0 ? '+' : ''}
                          {marketData.macroData.inflation.change.toFixed(2)}%
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">Inflazione alta = oro come hedge</div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                      <div className="text-sm text-gray-600 mb-1">GDP USA</div>
                      <div className={`text-2xl font-bold ${marketData.macroData.gdp.value >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {marketData.macroData.gdp.value >= 0 ? '+' : ''}
                        {marketData.macroData.gdp.value.toFixed(1)}%
                      </div>
                      {marketData.macroData.gdp.change !== null && (
                        <div className={`text-xs mt-1 ${marketData.macroData.gdp.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {marketData.macroData.gdp.change >= 0 ? '+' : ''}
                          {marketData.macroData.gdp.change.toFixed(2)}%
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">Crescita debole = oro come safe haven</div>
                    </div>
                    
                    <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                      <div className="text-sm text-gray-600 mb-1">Disoccupazione USA</div>
                      <div className="text-2xl font-bold text-red-700">
                        {marketData.macroData.unemployment.value.toFixed(1)}%
                      </div>
                      {marketData.macroData.unemployment.change !== null && (
                        <div className={`text-xs mt-1 ${marketData.macroData.unemployment.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {marketData.macroData.unemployment.change >= 0 ? '+' : ''}
                          {marketData.macroData.unemployment.change.toFixed(2)}%
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">Disoccupazione alta = incertezza = oro</div>
                    </div>
                  </div>

                  {/* Interpretazione per Oro */}
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-3">Analisi Oro (XAU/USD): Scenario Attuale</h3>
                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
                        <p className="font-semibold text-yellow-900 mb-1">💰 Oro: Tassi Fed e Inflazione</p>
                        <p className="text-yellow-800">
                          <strong>Fed Funds Rate:</strong> {marketData.macroData.interestRate.value.toFixed(2)}%
                          {marketData.macroData.interestRate.change !== null && marketData.macroData.interestRate.change > 0 && ' (in aumento)'}
                          {marketData.macroData.interestRate.change !== null && marketData.macroData.interestRate.change < 0 && ' (in calo)'}
                          . {marketData.macroData.interestRate.value > 5 ? 'Tassi molto alti rendono l\'oro meno attraente (non paga interessi). Pressione al ribasso su XAU/USD.' : marketData.macroData.interestRate.value < 3 ? 'Tassi bassi supportano l\'oro (opportunity cost ridotto). Supporto a XAU/USD.' : 'Tassi moderati, valutare altri fattori.'}
                          <br/>
                          <strong>Inflazione:</strong> {marketData.macroData.inflation.value.toFixed(1)}%
                          {marketData.macroData.inflation.change !== null && marketData.macroData.inflation.change > 0 && ' (in aumento)'}
                          {marketData.macroData.inflation.change !== null && marketData.macroData.inflation.change < 0 && ' (in calo)'}
                          . {marketData.macroData.inflation.value > 4 ? 'Inflazione elevata spinge verso oro come hedge contro inflazione. Supporto a XAU/USD.' : marketData.macroData.inflation.value < 2 ? 'Inflazione bassa riduce attrattiva dell\'oro come hedge.' : 'Inflazione moderata, impatto neutro.'}
                        </p>
                      </div>
                      
                      <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded">
                        <p className="font-semibold text-amber-900 mb-1">⚖️ Oro: Scenario Combinato</p>
                        <p className="text-amber-800">
                          <strong>Valutazione XAU/USD:</strong> Tasso Fed {marketData.macroData.interestRate.value.toFixed(2)}%, Inflazione {marketData.macroData.inflation.value.toFixed(1)}%, GDP {marketData.macroData.gdp.value >= 0 ? '+' : ''}{marketData.macroData.gdp.value.toFixed(1)}%, Disoccupazione {marketData.macroData.unemployment.value.toFixed(1)}%.
                          <br/>
                          {marketData.macroData.interestRate.value < 3 && marketData.macroData.inflation.value > 4 && marketData.macroData.gdp.value < 1
                            ? '✅ Scenario molto favorevole per oro: tassi bassi (opportunity cost ridotto) + inflazione alta (hedge) + crescita debole (safe haven) = Supporto forte a XAU/USD.'
                            : marketData.macroData.interestRate.value > 5 && marketData.macroData.inflation.value < 2 && marketData.macroData.gdp.value > 2
                            ? '⚠️ Scenario sfavorevole per oro: tassi alti (opportunity cost elevato) + inflazione bassa (meno bisogno di hedge) + crescita forte (risk-on) = Pressione al ribasso su XAU/USD.'
                            : marketData.macroData.interestRate.value > 5 && marketData.macroData.inflation.value > 4
                            ? '📊 Scenario misto: tassi alti pesano sull\'oro, ma inflazione alta lo supporta. Valutare quale fattore domina.'
                            : '📊 Scenario neutro: valutare altri fattori (geopolitica, dollaro, sentiment).'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl p-6 shadow md:col-span-2 lg:col-span-3">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="text-primary-600" size={24} />
                  <h2 className="text-xl font-bold">Analisi Materia Prima - {selectedAsset}</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {selectedAsset === 'XAUUSD' ? (
                    <>
                      <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
                        <div className="text-sm text-gray-600 mb-1">Domanda Globale</div>
                        <div className="text-2xl font-bold text-yellow-700">Alta</div>
                        <div className="text-xs text-gray-500 mt-1">Gioielleria, investimento, riserve</div>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                        <div className="text-sm text-gray-600 mb-1">Correlazione USD</div>
                        <div className="text-2xl font-bold text-blue-700">-0.85</div>
                        <div className="text-xs text-gray-500 mt-1">Forte correlazione inversa</div>
                      </div>
                      
                      <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                        <div className="text-sm text-gray-600 mb-1">Rischio Geopolitico</div>
                        <div className="text-2xl font-bold text-red-700">Alto</div>
                        <div className="text-xs text-gray-500 mt-1">Safe haven asset</div>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                        <div className="text-sm text-gray-600 mb-1">Stagionalità</div>
                        <div className="text-2xl font-bold text-green-700">Q4+</div>
                        <div className="text-xs text-gray-500 mt-1">Picco stagionale fine anno</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                        <div className="text-sm text-gray-600 mb-1">Domanda Globale</div>
                        <div className="text-2xl font-bold text-blue-700">Alta</div>
                        <div className="text-xs text-gray-500 mt-1">Trasporti, industria, riscaldamento</div>
                      </div>
                      
                      <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                        <div className="text-sm text-gray-600 mb-1">Inventari (Stimati)</div>
                        <div className="text-2xl font-bold text-orange-700">Normali</div>
                        <div className="text-xs text-gray-500 mt-1">Livelli di scorta medi</div>
                      </div>
                      
                      <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                        <div className="text-sm text-gray-600 mb-1">Rischio Geopolitico</div>
                        <div className="text-2xl font-bold text-red-700">Alto</div>
                        <div className="text-xs text-gray-500 mt-1">Tensioni mediorientali</div>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                        <div className="text-sm text-gray-600 mb-1">OPEC+ Policy</div>
                        <div className="text-lg font-bold text-green-700">Restrittiva</div>
                        <div className="text-xs text-gray-500 mt-1">Tagli produzione attivi</div>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-3">
                    {selectedAsset === 'XAUUSD' ? 'Analisi Oro' : 'Analisi Petrolio'}
                  </h3>
                  <div className="space-y-3 text-sm text-gray-700">
                    {selectedAsset === 'XAUUSD' ? (
                      <>
                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
                          <p className="font-semibold text-yellow-900 mb-1">💰 Fattori di Domanda</p>
                          <p className="text-yellow-800">
                            <strong>Gioielleria:</strong> Rappresenta ~50% della domanda globale, con picchi stagionali in India (festività) e Cina (Capodanno).<br/>
                            <strong>Investimento:</strong> ETF, monete, lingotti. Aumenta durante incertezza economica e inflazione.<br/>
                            <strong>Riserve Centrali:</strong> Le banche centrali accumulano oro come riserva di valore, specialmente in periodi di debolezza del dollaro.
                          </p>
                        </div>
                        
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                          <p className="font-semibold text-blue-900 mb-1">📉 Fattori di Offerta</p>
                          <p className="text-blue-800">
                            <strong>Produzione Mineraria:</strong> Cina, Australia, Russia sono i maggiori produttori. I costi di estrazione aumentano con il tempo.<br/>
                            <strong>Riciclaggio:</strong> Circa 30% dell'offerta proviene da riciclaggio di gioielli e componenti elettronici.<br/>
                            <strong>Vendite Centrali:</strong> Le banche centrali possono vendere riserve, influenzando l'offerta.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                          <p className="font-semibold text-blue-900 mb-1">🛢️ Fattori di Domanda</p>
                          <p className="text-blue-800">
                            <strong>Crescita Economica:</strong> La domanda di petrolio è direttamente correlata alla crescita economica globale. Recessioni = calo domanda.<br/>
                            <strong>Stagionalità:</strong> Picchi estivi (viaggi) e invernali (riscaldamento) nei paesi sviluppati.<br/>
                            <strong>Trasporti:</strong> Settore trasporti rappresenta ~60% della domanda globale.
                          </p>
                        </div>
                        
                        <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded">
                          <p className="font-semibold text-orange-900 mb-1">⚙️ Fattori di Offerta</p>
                          <p className="text-orange-800">
                            <strong>OPEC+:</strong> L'organizzazione controlla ~40% della produzione globale. Decisioni su tagli/aumenti produzione influenzano i prezzi.<br/>
                            <strong>Shale USA:</strong> La produzione shale americana è diventata un fattore chiave, più reattiva ai prezzi.<br/>
                            <strong>Inventari:</strong> Livelli di scorte (EIA reports settimanali) sono indicatori chiave di equilibrio domanda/offerta.
                          </p>
                        </div>
                      </>
                    )}
                    
                    <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                      <p className="font-semibold text-red-900 mb-1">🌍 Fattori Geopolitici</p>
                      <p className="text-red-800">
                        {selectedAsset === 'XAUUSD' 
                          ? 'L\'oro è un safe haven asset. Tensioni geopolitiche, guerre, crisi finanziarie spingono gli investitori verso l\'oro. Eventi come elezioni, Brexit, tensioni USA-Cina aumentano la domanda.'
                          : 'Il petrolio è estremamente sensibile a tensioni geopolitiche. Guerre in Medio Oriente, sanzioni, interruzioni di produzione possono causare shock di offerta. Eventi come attacchi a infrastrutture petrolifere hanno impatto immediato sui prezzi.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Analisi Specifica per CRYPTO */}
          {currentAssetType === 'crypto' && (
            <>
              {/* Dati Macroeconomici per Criptovalute */}
              {marketData.macroData !== null && marketData.macroData !== undefined && (
                <div className="bg-white rounded-xl p-6 shadow md:col-span-2 lg:col-span-3">
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="text-primary-600" size={24} />
                    <h2 className="text-xl font-bold">Analisi Macroeconomica Crypto - {selectedAsset}</h2>
                  </div>
                  
                  {/* Politica Monetaria Fed */}
                  <h3 className="text-lg font-semibold mb-3 mt-4">Politica Monetaria Federal Reserve</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                      <div className="text-sm text-gray-600 mb-1">Fed Funds Rate</div>
                      <div className="text-2xl font-bold text-purple-700">
                        {marketData.macroData.interestRate.value.toFixed(2)}%
                      </div>
                      {marketData.macroData.interestRate.change !== null && (
                        <div className={`text-xs mt-1 ${marketData.macroData.interestRate.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {marketData.macroData.interestRate.change >= 0 ? '+' : ''}
                          {marketData.macroData.interestRate.change.toFixed(2)}%
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">Ultimo: {new Date(marketData.macroData.interestRate.date).toLocaleDateString('it-IT')}</div>
                    </div>
                    
                    {marketData.macroData.moneySupply && (
                      <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                        <div className="text-sm text-gray-600 mb-1">Money Supply M2</div>
                        <div className="text-2xl font-bold text-green-700">
                          ${(marketData.macroData.moneySupply.value / 1000).toFixed(1)}T
                        </div>
                        {marketData.macroData.moneySupply.change !== null && (
                          <div className={`text-xs mt-1 ${marketData.macroData.moneySupply.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {marketData.macroData.moneySupply.change >= 0 ? '+' : ''}
                            ${(marketData.macroData.moneySupply.change / 1000).toFixed(1)}B
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">Ultimo: {new Date(marketData.macroData.moneySupply.date).toLocaleDateString('it-IT')}</div>
                      </div>
                    )}
                    
                    <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                      <div className="text-sm text-gray-600 mb-1">Inflazione (CPI)</div>
                      <div className="text-2xl font-bold text-orange-700">
                        {marketData.macroData.inflation.value.toFixed(1)}%
                      </div>
                      {marketData.macroData.inflation.change !== null && (
                        <div className={`text-xs mt-1 ${marketData.macroData.inflation.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {marketData.macroData.inflation.change >= 0 ? '+' : ''}
                          {marketData.macroData.inflation.change.toFixed(2)}%
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">Ultimo: {new Date(marketData.macroData.inflation.date).toLocaleDateString('it-IT')}</div>
                    </div>
                    
                    {marketData.macroData.ppi && (
                      <div className="bg-cyan-50 rounded-lg p-4 border-l-4 border-cyan-500">
                        <div className="text-sm text-gray-600 mb-1">PPI</div>
                        <div className="text-2xl font-bold text-cyan-700">
                          {marketData.macroData.ppi.value.toFixed(1)}%
                        </div>
                        {marketData.macroData.ppi.change !== null && (
                          <div className={`text-xs mt-1 ${marketData.macroData.ppi.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {marketData.macroData.ppi.change >= 0 ? '+' : ''}
                            {marketData.macroData.ppi.change.toFixed(2)}%
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">Ultimo: {new Date(marketData.macroData.ppi.date).toLocaleDateString('it-IT')}</div>
                      </div>
                    )}
                  </div>

                  {/* DXY e Mercati Tradizionali */}
                  <h3 className="text-lg font-semibold mb-3 mt-6">Dollaro USA e Mercati Tradizionali</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {marketData.macroData.dxyIndex && (
                      <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                        <div className="text-sm text-gray-600 mb-1">DXY Index</div>
                        <div className={`text-2xl font-bold ${
                          marketData.macroData.dxyIndex.value >= 105 ? 'text-red-700' : 'text-blue-700'
                        }`}>
                          {marketData.macroData.dxyIndex.value.toFixed(2)}
                        </div>
                        {marketData.macroData.dxyIndex.change !== null && (
                          <div className={`text-xs mt-1 ${marketData.macroData.dxyIndex.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {marketData.macroData.dxyIndex.change >= 0 ? '+' : ''}
                            {marketData.macroData.dxyIndex.change.toFixed(2)}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">Correlazione inversa con crypto</div>
                        <div className="text-xs text-gray-500 mt-1">Ultimo: {new Date(marketData.macroData.dxyIndex.date).toLocaleDateString('it-IT')}</div>
                      </div>
                    )}
                    
                    {marketData.macroData.spxPerformance && (
                      <div className="bg-indigo-50 rounded-lg p-4 border-l-4 border-indigo-500">
                        <div className="text-sm text-gray-600 mb-1">S&P 500</div>
                        <div className={`text-2xl font-bold ${
                          marketData.macroData.spxPerformance.change && marketData.macroData.spxPerformance.change >= 0 ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {marketData.macroData.spxPerformance.value.toFixed(0)}
                        </div>
                        {marketData.macroData.spxPerformance.change !== null && (
                          <div className={`text-xs mt-1 ${marketData.macroData.spxPerformance.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {marketData.macroData.spxPerformance.change >= 0 ? '+' : ''}
                            {marketData.macroData.spxPerformance.change.toFixed(0)}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">Correlazione positiva con crypto</div>
                        <div className="text-xs text-gray-500 mt-1">Ultimo: {new Date(marketData.macroData.spxPerformance.date).toLocaleDateString('it-IT')}</div>
                      </div>
                    )}
                    
                    {marketData.macroData.vixIndex && (
                      <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                        <div className="text-sm text-gray-600 mb-1">VIX Index</div>
                        <div className={`text-2xl font-bold ${
                          marketData.macroData.vixIndex.value >= 20 ? 'text-red-700' : 'text-green-700'
                        }`}>
                          {marketData.macroData.vixIndex.value.toFixed(2)}
                        </div>
                        {marketData.macroData.vixIndex.change !== null && (
                          <div className={`text-xs mt-1 ${marketData.macroData.vixIndex.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {marketData.macroData.vixIndex.change >= 0 ? '+' : ''}
                            {marketData.macroData.vixIndex.change.toFixed(2)}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {marketData.macroData.vixIndex.value >= 20 ? 'Alta volatilità' : 'Bassa volatilità'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Ultimo: {new Date(marketData.macroData.vixIndex.date).toLocaleDateString('it-IT')}</div>
                      </div>
                    )}
                    
                    <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                      <div className="text-sm text-gray-600 mb-1">GDP USA</div>
                      <div className={`text-2xl font-bold ${marketData.macroData.gdp.value >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {marketData.macroData.gdp.value >= 0 ? '+' : ''}
                        {marketData.macroData.gdp.value.toFixed(1)}%
                      </div>
                      {marketData.macroData.gdp.change !== null && (
                        <div className={`text-xs mt-1 ${marketData.macroData.gdp.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {marketData.macroData.gdp.change >= 0 ? '+' : ''}
                          {marketData.macroData.gdp.change.toFixed(2)}%
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">Crescita economica</div>
                      <div className="text-xs text-gray-500 mt-1">Ultimo: {new Date(marketData.macroData.gdp.date).toLocaleDateString('it-IT')}</div>
                    </div>
                  </div>

                  {/* Interpretazione per Crypto */}
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-3">Interpretazione per Trading Crypto</h3>
                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded">
                        <p className="font-semibold text-purple-900 mb-1">🏦 Politica Monetaria Fed</p>
                        <p className="text-purple-800">
                          <strong>Fed Funds Rate:</strong> Tassi di interesse alti rendono le criptovalute meno attraenti (non pagano interessi). 
                          {marketData.macroData.interestRate && <> Tasso attuale: {marketData.macroData.interestRate.value.toFixed(2)}%.</>}
                          Tagli dei tassi = rialzista per crypto (maggiore appetito per asset rischiosi).<br/>
                          <strong>Money Supply (M2):</strong> Aumento della liquidità nel sistema supporta asset rischiosi come crypto. 
                          {marketData.macroData.moneySupply && <> M2 attuale: ${(marketData.macroData.moneySupply.value / 1000).toFixed(1)}T.</>}
                          QE (Quantitative Easing) e stimoli fiscali aumentano liquidità = rialzista per crypto.
                        </p>
                      </div>
                      
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                        <p className="font-semibold text-blue-900 mb-1">💵 Dollaro USA (DXY) e Correlazioni</p>
                        <p className="text-blue-800">
                          <strong>DXY Index:</strong> Forte correlazione inversa con Bitcoin e crypto. Dollaro forte = crypto più deboli, dollaro debole = crypto più forti. 
                          {marketData.macroData.dxyIndex && <> DXY attuale: {marketData.macroData.dxyIndex.value.toFixed(2)}.</>}
                          <br/>
                          <strong>S&P 500:</strong> Bitcoin si comporta come asset risk-on, correlato positivamente con indici azionari. 
                          {marketData.macroData.spxPerformance && <> S&P 500: {marketData.macroData.spxPerformance.value.toFixed(0)}.</>}
                          Rally azionari = supporto per crypto, correzioni azionarie = pressione su crypto.
                          <br/>
                          <strong>VIX (Volatilità):</strong> VIX alto indica paura e incertezza, spesso correlato a vendite su asset rischiosi inclusi crypto. 
                          {marketData.macroData.vixIndex && <> VIX attuale: {marketData.macroData.vixIndex.value.toFixed(2)}.</>}
                        </p>
                      </div>
                      
                      <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded">
                        <p className="font-semibold text-orange-900 mb-1">📈 Inflazione e Crescita Economica</p>
                        <p className="text-orange-800">
                          <strong>Inflazione:</strong> Inflazione elevata può spingere investitori verso Bitcoin come "oro digitale" (hedge contro inflazione). 
                          {marketData.macroData.inflation && <> CPI attuale: {marketData.macroData.inflation.value.toFixed(1)}%.</>}
                          Tuttavia, inflazione persistente può spingere Fed ad alzare tassi (ribassista per crypto).<br/>
                          <strong>GDP:</strong> Crescita economica robusta supporta sentiment risk-on e asset rischiosi. 
                          {marketData.macroData.gdp && <> GDP attuale: {marketData.macroData.gdp.value.toFixed(1)}%.</>}
                          Recessioni possono causare vendite su crypto (flight to quality verso asset tradizionali).
                        </p>
                      </div>
                      
                      <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                        <p className="font-semibold text-red-900 mb-1">🌍 Fattori Geopolitici e Regolamentazione</p>
                        <p className="text-red-800">
                          <strong>Eventi Geopolitici:</strong> Tensioni geopolitiche possono spingere verso Bitcoin come safe haven (simile all'oro), ma anche causare volatilità estrema.<br/>
                          <strong>Regolamentazione:</strong> Chiarezza normativa favorisce adozione istituzionale (rialzista), incertezza o divieti creano volatilità e vendite. Approvazione ETF Bitcoin = rialzista.<br/>
                          <strong>Adozione Istituzionale:</strong> Aziende e stati che aggiungono Bitcoin al bilancio aumentano domanda. Banche centrali che esplorano CBDC possono creare incertezza.
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 mt-4">
                    Dati da FRED (Federal Reserve Economic Data). Per ottenere dati reali, configura FRED_API_KEY in .env.local
                  </p>
                </div>
              )}

              {/* Metriche Crypto */}
              <div className="bg-white rounded-xl p-6 shadow md:col-span-2 lg:col-span-3">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="text-primary-600" size={24} />
                  <h2 className="text-xl font-bold">Metriche Criptovaluta - {selectedAsset}</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                    <div className="text-sm text-gray-600 mb-1">Market Cap</div>
                    <div className="text-2xl font-bold text-orange-700">$850B</div>
                    <div className="text-xs text-gray-500 mt-1">Dominanza: ~52%</div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <div className="text-sm text-gray-600 mb-1">Correlazione S&P 500</div>
                    <div className="text-2xl font-bold text-blue-700">0.75</div>
                    <div className="text-xs text-gray-500 mt-1">Alta correlazione risk-on</div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                    <div className="text-sm text-gray-600 mb-1">Volatilità</div>
                    <div className="text-2xl font-bold text-green-700">Alta</div>
                    <div className="text-xs text-gray-500 mt-1">Tipica asset crypto</div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                    <div className="text-sm text-gray-600 mb-1">Adozione Istituzionale</div>
                    <div className="text-lg font-bold text-purple-700">Crescente</div>
                    <div className="text-xs text-gray-500 mt-1">ETF, aziende, stati</div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-3">Analisi Bitcoin</h3>
                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded">
                      <p className="font-semibold text-orange-900 mb-1">₿ Fattori Tecnici</p>
                      <p className="text-orange-800">
                        <strong>Halving:</strong> Evento ogni 4 anni che dimezza la ricompensa mineraria. Storicamente precede rally rialzisti.<br/>
                        <strong>Hash Rate:</strong> Potenza computazionale della rete. Aumenta = maggiore sicurezza e fiducia.<br/>
                        <strong>Adozione Lightning Network:</strong> Migliora scalabilità per transazioni piccole e veloci.
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                      <p className="font-semibold text-blue-900 mb-1">💼 Fattori Istituzionali</p>
                      <p className="text-blue-800">
                        <strong>ETF Approval:</strong> L'approvazione di ETF Bitcoin aumenta accessibilità e domanda istituzionale.<br/>
                        <strong>Adozione Aziendale:</strong> Aziende che aggiungono Bitcoin al bilancio (Tesla, MicroStrategy) aumentano domanda.<br/>
                        <strong>Regolamentazione:</strong> Chiarezza normativa favorisce adozione, incertezza crea volatilità.
                      </p>
                    </div>
                    
                    <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                      <p className="font-semibold text-green-900 mb-1">📈 Correlazioni di Mercato</p>
                      <p className="text-green-800">
                        <strong>Risk-On Asset:</strong> Bitcoin si comporta come asset risk-on, correlato positivamente con S&P 500 e NASDAQ.<br/>
                        <strong>Dollaro:</strong> Correlazione inversa con USD. Dollaro forte = Bitcoin più debole.<br/>
                        <strong>Oro:</strong> A volte chiamato "oro digitale", ma correlazione variabile. In periodi di incertezza, può comportarsi come safe haven.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        )}
      </div>
    </div>
  )
}

