import { NextResponse } from 'next/server'

// API Route per fetch dati di mercato reali
// Supporta Alpha Vantage (gratuita) e altre fonti

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol') || 'EURUSD'
  const type = searchParams.get('type') || 'forex' // forex, cot, etc.
  const interval = searchParams.get('interval') || 'daily' // daily, weekly, monthly, intraday

  try {
    if (type === 'forex') {
      const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY
      
      if (!ALPHA_VANTAGE_KEY) {
        return NextResponse.json({
          success: false,
          error: 'API key non configurata. Aggiungi ALPHA_VANTAGE_API_KEY in .env.local o Vercel.',
          data: {
            note: 'Usa dati simulati. Vedi GUIDA_API_ALPHA_VANTAGE.md per configurare.',
            symbol,
            prices: generateSimulatedPrices(symbol),
          },
        })
      }

      // Mappa simboli forex
      const fromSymbol = symbol.substring(0, 3)
      const toSymbol = symbol.substring(3, 6)
      
      let apiUrl = ''
      
      if (interval === 'intraday') {
        // Dati intraday (5min)
        apiUrl = `https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=${fromSymbol}&to_symbol=${toSymbol}&interval=5min&apikey=${ALPHA_VANTAGE_KEY}`
      } else if (interval === 'daily') {
        // Dati giornalieri (consigliato per backtest)
        apiUrl = `https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=${fromSymbol}&to_symbol=${toSymbol}&apikey=${ALPHA_VANTAGE_KEY}`
      } else if (interval === 'weekly') {
        apiUrl = `https://www.alphavantage.co/query?function=FX_WEEKLY&from_symbol=${fromSymbol}&to_symbol=${toSymbol}&apikey=${ALPHA_VANTAGE_KEY}`
      } else if (interval === 'monthly') {
        apiUrl = `https://www.alphavantage.co/query?function=FX_MONTHLY&from_symbol=${fromSymbol}&to_symbol=${toSymbol}&apikey=${ALPHA_VANTAGE_KEY}`
      }

      const response = await fetch(apiUrl, {
        next: { revalidate: 3600 } // Cache per 1 ora
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Controlla errori Alpha Vantage
      if (data['Error Message']) {
        throw new Error(data['Error Message'])
      }
      
      if (data['Note']) {
        // Rate limit raggiunto
        return NextResponse.json({
          success: false,
          error: 'Rate limit Alpha Vantage raggiunto. Riprova più tardi.',
          note: data['Note'],
        }, { status: 429 })
      }
      
      // Converti formato Alpha Vantage in formato standard
      const timeSeriesKey = interval === 'intraday' 
        ? `Time Series FX (5min)`
        : interval === 'daily'
        ? 'Time Series FX (Daily)'
        : interval === 'weekly'
        ? 'Time Series FX (Weekly)'
        : 'Time Series FX (Monthly)'
      
      const timeSeries = data[timeSeriesKey]
      
      if (!timeSeries) {
        return NextResponse.json({
          success: false,
          error: 'Nessun dato disponibile per questo simbolo',
          data,
        })
      }
      
      // Converti in array di OHLCV
      const prices = Object.entries(timeSeries)
        .map(([date, values]: [string, any]) => ({
          date,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      
      return NextResponse.json({
        success: true,
        symbol,
        interval,
        metadata: data['Meta Data'],
        prices,
        count: prices.length,
      })
    }

    if (type === 'cot') {
      // CFTC COT Reports API
      // In produzione useresti: https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm
      return NextResponse.json({
        success: true,
        data: {
          note: 'COT data richiede scraping o API dedicata',
          symbol,
        },
      })
    }

    return NextResponse.json({ success: false, error: 'Tipo non supportato' })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

function generateSimulatedPrices(symbol: string) {
  const basePrices: { [key: string]: number } = {
    EURUSD: 1.08,
    GBPUSD: 1.26,
    USDJPY: 148.5,
    AUDUSD: 0.67,
    USDCAD: 1.35,
    NZDUSD: 0.62,
  }

  const basePrice = basePrices[symbol] || 1.0
  const prices = []

  for (let i = 0; i < 100; i++) {
    const variation = (Math.random() - 0.5) * 0.02
    const price = basePrice * (1 + variation)
    prices.push({
      time: new Date(Date.now() - (100 - i) * 5 * 60 * 1000).toISOString(),
      open: price,
      high: price * (1 + Math.random() * 0.001),
      low: price * (1 - Math.random() * 0.001),
      close: price * (1 + (Math.random() - 0.5) * 0.001),
      volume: Math.floor(Math.random() * 1000000),
    })
  }

  return prices
}

