'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, BarChart3, Activity, Globe, RefreshCw, AlertCircle } from 'lucide-react'

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
  seasonality: Array<{ month: string; value: number; positive: boolean }>
}

export default function DeepViewPage() {
  const [selectedAsset, setSelectedAsset] = useState('EURUSD')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [marketData, setMarketData] = useState<MarketData | null>(null)

  const assets = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD']

  // Mappa asset a simboli per API
  const assetToSymbol = (asset: string) => {
    const map: { [key: string]: string } = {
      'EURUSD': 'EUR/USD',
      'GBPUSD': 'GBP/USD',
      'USDJPY': 'USD/JPY',
      'AUDUSD': 'AUD/USD',
      'USDCAD': 'USD/CAD',
      'NZDUSD': 'NZD/USD',
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

  // Calcola stagionalità storica (simulata con dati realistici)
  const calculateSeasonality = (asset: string) => {
    // Dati stagionali realistici per major pairs
    const seasonalData: { [key: string]: number[] } = {
      'EURUSD': [0.2, 0.1, -0.3, 0.5, 0.3, -0.1, -0.2, 0.1, 0.4, 0.2, -0.1, 0.3],
      'GBPUSD': [0.3, 0.2, -0.2, 0.4, 0.1, -0.3, -0.1, 0.2, 0.5, 0.1, -0.2, 0.4],
      'USDJPY': [-0.1, 0.2, 0.3, -0.2, 0.1, 0.4, 0.2, -0.1, 0.3, 0.1, -0.3, 0.2],
      'AUDUSD': [0.4, 0.2, 0.1, -0.2, -0.3, -0.1, 0.2, 0.3, 0.1, 0.4, 0.2, 0.3],
      'USDCAD': [-0.2, -0.1, 0.1, 0.2, 0.3, 0.1, -0.1, -0.2, 0.1, 0.2, 0.1, -0.1],
      'NZDUSD': [0.3, 0.1, 0.2, -0.1, -0.2, 0.1, 0.3, 0.2, 0.1, 0.4, 0.2, 0.3],
    }

    const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']
    const values = seasonalData[asset] || seasonalData['EURUSD']
    
    return months.map((month, index) => ({
      month,
      value: values[index],
      positive: values[index] > 0,
    }))
  }

  // Fetch dati di mercato
  const fetchMarketData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Simula fetch dati reali (in produzione useresti API reali)
      // Per ora usiamo dati realistici calcolati
      
      // Simula prezzi storici per calcoli
      const basePrice = selectedAsset === 'EURUSD' ? 1.08 :
                       selectedAsset === 'GBPUSD' ? 1.26 :
                       selectedAsset === 'USDJPY' ? 148.5 :
                       selectedAsset === 'AUDUSD' ? 0.67 :
                       selectedAsset === 'USDCAD' ? 1.35 : 0.62

      const prices = Array.from({ length: 30 }, (_, i) => {
        const variation = (Math.random() - 0.5) * 0.02
        return basePrice * (1 + variation)
      })

      const { support, resistance } = calculateSupportResistance(prices)
      const currentPrice = prices[prices.length - 1]
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

      // COT Data (simulato - in produzione useresti CFTC API)
      const cotData = {
        commercial: Math.floor((Math.random() - 0.5) * 100000),
        nonCommercial: Math.floor((Math.random() - 0.5) * 100000),
        nonReportable: Math.floor((Math.random() - 0.5) * 20000),
        lastUpdate: new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' }),
      }

      const seasonality = calculateSeasonality(selectedAsset)

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
              <h2 className="text-xl font-bold">Stagionalità</h2>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600 mb-3">
                Performance storica per mese
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
                        width: `${Math.abs(item.value) * 100}%`,
                        marginLeft: item.positive ? '0' : 'auto',
                      }}
                    ></div>
                  </div>
                  <span
                    className={`text-sm font-semibold w-12 text-right ${
                      item.positive ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {item.positive ? '+' : ''}
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* COT Report Card */}
          <div className="bg-white rounded-xl p-6 shadow md:col-span-2">
            <h2 className="text-xl font-bold mb-4">COT Report (CFTC)</h2>
            <div className="grid md:grid-cols-3 gap-4">
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
            <p className="text-sm text-gray-500 mt-4">
              Ultimo aggiornamento: {marketData.cotData.lastUpdate}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Dati basati su report CFTC (Commitment of Traders). In produzione, questi dati verrebbero caricati direttamente dall'API CFTC.
            </p>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}

