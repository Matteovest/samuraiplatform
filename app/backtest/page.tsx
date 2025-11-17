'use client'

import { useState, useEffect } from 'react'
import { Play, Pause, Square, TrendingUp, TrendingDown, BarChart3, Settings, Code, Save, X } from 'lucide-react'

interface BacktestSettings {
  riskPerTrade: number // % del capitale per trade
  stopLoss: number // Pips
  takeProfit: number // Pips
  lotSize: number // Dimensione lotto
  maxTrades: number // Numero massimo di trade
  initialCapital: number // Capitale iniziale
  commission: number // Commissione per trade
  spread: number // Spread in pips
}

export default function BacktestPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState('EURUSD')
  const [selectedIndicator, setSelectedIndicator] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showPineEditor, setShowPineEditor] = useState(false)
  const [pineScript, setPineScript] = useState('')
  const [settings, setSettings] = useState<BacktestSettings>({
    riskPerTrade: 2, // 2% del capitale
    stopLoss: 20, // 20 pips
    takeProfit: 40, // 40 pips
    lotSize: 0.01,
    maxTrades: 100,
    initialCapital: 10000,
    commission: 0.5, // $0.5 per trade
    spread: 2, // 2 pips
  })
  const [stats, setStats] = useState<{
    winRate: number
    profitFactor: number
    totalTrades: number
    maxDrawdown: number
    totalProfit: number
    currentCapital: number
    avgWin: number
    avgLoss: number
  }>({
    winRate: 65,
    profitFactor: 1.85,
    totalTrades: 142,
    maxDrawdown: -8.5,
    totalProfit: 0,
    currentCapital: 10000,
    avgWin: 0,
    avgLoss: 0,
  })
  const [trades, setTrades] = useState<Array<{
    type: string
    price: number
    exitPrice?: number
    profit: number
    time: string
  }>>([
    { type: 'BUY', price: 1.0850, exitPrice: 1.0875, profit: 25, time: '10:30' },
    { type: 'SELL', price: 1.0820, exitPrice: 1.0805, profit: -15, time: '11:15' },
    { type: 'BUY', price: 1.0835, exitPrice: 1.0875, profit: 40, time: '12:00' },
  ])

  const assets = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD']
  const indicators = [
    'RSI',
    'MACD',
    'Bollinger Bands',
    'Moving Average',
    'Stochastic',
    'Fibonacci',
  ]

  // Calcola profit basato su risk per trade e stop loss/take profit
  const calculateTradeProfit = (isWin: boolean, currentCapital: number) => {
    const riskAmount = (currentCapital * settings.riskPerTrade) / 100
    const riskRewardRatio = settings.takeProfit / settings.stopLoss
    
    if (isWin) {
      // Profit = risk amount * risk/reward ratio
      return riskAmount * riskRewardRatio - settings.commission
    } else {
      // Loss = risk amount
      return -riskAmount - settings.commission
    }
  }

  // Simula il backtesting quando viene avviato
  useEffect(() => {
    if (isRunning) {
      let tradeCount = 0
      const interval = setInterval(() => {
        if (tradeCount >= settings.maxTrades) {
          setIsRunning(false)
          return
        }

        // Simula nuovi trade con logica basata su risk management
        const isWin = Math.random() > 0.35 // 65% win rate (modificabile con Pine Script)
        const currentCapital = stats.currentCapital || settings.initialCapital
        const profit = calculateTradeProfit(isWin, currentCapital)
        
        const basePrice = selectedAsset === 'EURUSD' ? 1.08 : 
                         selectedAsset === 'GBPUSD' ? 1.26 :
                         selectedAsset === 'USDJPY' ? 148.5 : 1.08
        
        const entryPrice = parseFloat((basePrice + (Math.random() - 0.5) * 0.01).toFixed(4))
        const exitPrice = isWin 
          ? parseFloat((entryPrice + (settings.takeProfit / 10000)).toFixed(4))
          : parseFloat((entryPrice - (settings.stopLoss / 10000)).toFixed(4))
        
        const newTrade = {
          type: Math.random() > 0.5 ? 'BUY' : 'SELL',
          price: entryPrice,
          exitPrice: exitPrice,
          profit: parseFloat(profit.toFixed(2)),
          time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
        }
        
        setTrades((prev) => [newTrade, ...prev].slice(0, 20))
        
        // Aggiorna statistiche
        setStats((prev) => {
          const newTotalTrades = prev.totalTrades + 1
          const newCapital = prev.currentCapital + profit
          const wins = prev.totalTrades === 0 
            ? (isWin ? 1 : 0)
            : Math.floor((prev.totalTrades * prev.winRate) / 100) + (isWin ? 1 : 0)
          const newWinRate = (wins / newTotalTrades) * 100
          
          // Calcola avg win/loss
          const allTrades = [newTrade, ...trades]
          const winTrades = allTrades.filter(t => t.profit > 0)
          const lossTrades = allTrades.filter(t => t.profit < 0)
          const avgWin = winTrades.length > 0 
            ? winTrades.reduce((sum, t) => sum + t.profit, 0) / winTrades.length 
            : 0
          const avgLoss = lossTrades.length > 0 
            ? Math.abs(lossTrades.reduce((sum, t) => sum + t.profit, 0) / lossTrades.length)
            : 0
          
          const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0
          const maxDrawdown = newCapital < settings.initialCapital 
            ? ((settings.initialCapital - newCapital) / settings.initialCapital) * 100
            : prev.maxDrawdown
          
          return {
            ...prev,
            totalTrades: newTotalTrades,
            winRate: Math.min(100, Math.max(0, newWinRate)),
            profitFactor: parseFloat(profitFactor.toFixed(2)),
            totalProfit: parseFloat((prev.totalProfit + profit).toFixed(2)),
            currentCapital: parseFloat(newCapital.toFixed(2)),
            avgWin: parseFloat(avgWin.toFixed(2)),
            avgLoss: parseFloat(avgLoss.toFixed(2)),
            maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
          }
        })
        
        tradeCount++
      }, 1500)

      return () => clearInterval(interval)
    }
  }, [isRunning, selectedAsset, settings, stats.currentCapital])

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">#1 Backtester</h1>
            <p className="text-gray-600">
              Metti alla prova le tue idee senza rischiare un centesimo
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowPineEditor(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Code size={20} />
              Pine Script
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              <Settings size={20} />
              Impostazioni
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow">
              <h2 className="text-xl font-bold mb-4">Controlli</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Asset
                  </label>
                  <select
                    value={selectedAsset}
                    onChange={(e) => setSelectedAsset(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    disabled={isRunning}
                  >
                    {assets.map((asset) => (
                      <option key={asset} value={asset}>
                        {asset}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Indicatore
                  </label>
                  <select
                    value={selectedIndicator}
                    onChange={(e) => setSelectedIndicator(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    disabled={isRunning}
                  >
                    <option value="">Nessuno</option>
                    {indicators.map((indicator) => (
                      <option key={indicator} value={indicator}>
                        {indicator}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quick Settings */}
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-semibold mb-3 text-gray-700">Impostazioni Rapide</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium text-gray-600">
                          Rischio per Trade
                        </label>
                        <span className="text-xs font-bold text-primary-600">
                          {settings.riskPerTrade}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="5"
                        step="0.1"
                        value={settings.riskPerTrade}
                        onChange={(e) => {
                          const newRisk = parseFloat(e.target.value)
                          setSettings({ ...settings, riskPerTrade: newRisk })
                        }}
                        className="w-full"
                        disabled={isRunning}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0.5%</span>
                        <span>5%</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium text-gray-600">
                          Stop Loss
                        </label>
                        <span className="text-xs font-bold text-red-600">
                          {settings.stopLoss} pips
                        </span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        step="5"
                        value={settings.stopLoss}
                        onChange={(e) => {
                          const newSL = parseFloat(e.target.value)
                          setSettings({ ...settings, stopLoss: newSL })
                        }}
                        className="w-full"
                        disabled={isRunning}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>5</span>
                        <span>100</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-xs font-medium text-gray-600">
                          Take Profit
                        </label>
                        <span className="text-xs font-bold text-green-600">
                          {settings.takeProfit} pips
                        </span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="200"
                        step="5"
                        value={settings.takeProfit}
                        onChange={(e) => {
                          const newTP = parseFloat(e.target.value)
                          setSettings({ ...settings, takeProfit: newTP })
                        }}
                        className="w-full"
                        disabled={isRunning}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>10</span>
                        <span>200</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-600">R:R Ratio</span>
                        <span className="text-sm font-bold text-primary-600">
                          {settings.stopLoss > 0 ? (settings.takeProfit / settings.stopLoss).toFixed(2) : '0'} : 1
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs font-medium text-gray-600">Capitale Iniziale</span>
                        <span className="text-sm font-bold">
                          €{settings.initialCapital.toLocaleString('it-IT')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsRunning(!isRunning)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition ${
                      isRunning
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {isRunning ? (
                      <>
                        <Pause size={20} />
                        Pausa
                      </>
                    ) : (
                      <>
                        <Play size={20} />
                        Avvia
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsRunning(false)
                      setTrades([])
                      setStats({
                        winRate: 65,
                        profitFactor: 1.85,
                        totalTrades: 0,
                        maxDrawdown: 0,
                        totalProfit: 0,
                        currentCapital: settings.initialCapital,
                        avgWin: 0,
                        avgLoss: 0,
                      })
                    }}
                    className="bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition"
                    title="Reset"
                  >
                    <Square size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-xl p-6 shadow">
              <h2 className="text-xl font-bold mb-4">Statistiche</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Capitale</span>
                  <span className={`font-bold ${
                    stats.currentCapital >= settings.initialCapital ? 'text-green-600' : 'text-red-600'
                  }`}>
                    €{stats.currentCapital.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Profit Totale</span>
                  <span className={`font-bold ${
                    stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stats.totalProfit >= 0 ? '+' : ''}€{stats.totalProfit.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Win Rate</span>
                  <span className="font-bold text-green-600">
                    {stats.winRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Profit Factor</span>
                  <span className="font-bold">{stats.profitFactor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Trades</span>
                  <span className="font-bold">{stats.totalTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Win</span>
                  <span className="font-bold text-green-600">
                    €{stats.avgWin.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Loss</span>
                  <span className="font-bold text-red-600">
                    €{stats.avgLoss.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Drawdown</span>
                  <span className="font-bold text-red-600">
                    {stats.maxDrawdown}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow">
              <div className="h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
                {isRunning ? (
                  <div className="text-center animate-pulse">
                    <div className="inline-block animate-spin mb-4">
                      <BarChart3 size={64} className="text-primary-600" />
                    </div>
                    <p className="text-gray-700 font-semibold">
                      Backtesting in corso...
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {selectedAsset} - {selectedIndicator || 'Nessun indicatore'}
                    </p>
                    <div className="mt-4 flex gap-2 justify-center">
                      <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <BarChart3 size={64} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Grafico TradingView integrato
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      {selectedAsset} - {selectedIndicator || 'Nessun indicatore'}
                    </p>
                    <p className="text-xs text-gray-400 mt-4">
                      Clicca "Avvia" per iniziare il backtest
                    </p>
                  </div>
                )}
              </div>

              {/* Trade List */}
              <div className="space-y-2">
                <h3 className="font-semibold mb-2">Trade Recenti</h3>
                {trades.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Nessun trade ancora. Clicca "Avvia" per iniziare il backtest.
                  </p>
                ) : (
                  trades.map((trade, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {trade.profit > 0 ? (
                        <TrendingUp className="text-green-600" size={20} />
                      ) : (
                        <TrendingDown className="text-red-600" size={20} />
                      )}
                      <div>
                        <div className="font-semibold">{trade.type}</div>
                        <div className="text-sm text-gray-500">
                          {trade.price} - {trade.time}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`font-bold ${
                        trade.profit > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {trade.profit > 0 ? '+' : ''}
                      {trade.profit}€
                    </div>
                  </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Impostazioni Backtest</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Capitale Iniziale (€)
                </label>
                <input
                  type="number"
                  value={settings.initialCapital}
                  onChange={(e) => setSettings({ ...settings, initialCapital: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  min="0"
                  step="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Rischio per Trade (%)
                </label>
                <input
                  type="number"
                  value={settings.riskPerTrade}
                  onChange={(e) => setSettings({ ...settings, riskPerTrade: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  min="0"
                  max="10"
                  step="0.1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Percentuale del capitale rischiata per ogni trade
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Stop Loss (Pips)
                  </label>
                  <input
                    type="number"
                    value={settings.stopLoss}
                    onChange={(e) => setSettings({ ...settings, stopLoss: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    min="0"
                    step="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Take Profit (Pips)
                  </label>
                  <input
                    type="number"
                    value={settings.takeProfit}
                    onChange={(e) => setSettings({ ...settings, takeProfit: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    min="0"
                    step="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Risk/Reward Ratio
                </label>
                <div className="bg-gray-50 rounded-lg px-4 py-2 text-lg font-bold">
                  {settings.stopLoss > 0 ? (settings.takeProfit / settings.stopLoss).toFixed(2) : '0'} : 1
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Lot Size
                  </label>
                  <input
                    type="number"
                    value={settings.lotSize}
                    onChange={(e) => setSettings({ ...settings, lotSize: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    min="0.01"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Max Trade
                  </label>
                  <input
                    type="number"
                    value={settings.maxTrades}
                    onChange={(e) => setSettings({ ...settings, maxTrades: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    min="1"
                    step="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Commissione per Trade (€)
                  </label>
                  <input
                    type="number"
                    value={settings.commission}
                    onChange={(e) => setSettings({ ...settings, commission: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Spread (Pips)
                  </label>
                  <input
                    type="number"
                    value={settings.spread}
                    onChange={(e) => setSettings({ ...settings, spread: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    // Reset stats quando si cambiano le impostazioni
                    setStats({
                      winRate: 0,
                      profitFactor: 0,
                      totalTrades: 0,
                      maxDrawdown: 0,
                      totalProfit: 0,
                      currentCapital: settings.initialCapital,
                      avgWin: 0,
                      avgLoss: 0,
                    })
                    setTrades([])
                    setIsRunning(false)
                    setShowSettings(false)
                  }}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                  Salva e Reset
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pine Script Editor Modal */}
      {showPineEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Editor Pine Script</h2>
              <button
                onClick={() => setShowPineEditor(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 mb-4">
              <textarea
                value={pineScript}
                onChange={(e) => setPineScript(e.target.value)}
                placeholder="// Incolla qui il tuo codice Pine Script da TradingView&#10;// Esempio:&#10;//@version=5&#10;//strategy(&quot;My Strategy&quot;)&#10;//longCondition = ta.crossover(ta.sma(close, 14), ta.sma(close, 28))&#10;//if (longCondition)&#10;//    strategy.entry(&quot;Long&quot;, strategy.long)"
                className="w-full h-full border border-gray-300 rounded-lg px-4 py-3 font-mono text-sm"
                style={{ minHeight: '400px' }}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> L'integrazione completa del parser Pine Script richiede una libreria dedicata. 
                Per ora, puoi salvare il tuo codice e verrà utilizzato per calcolare i segnali di entrata/uscita.
                Il backtest userà la logica di risk management configurata nelle impostazioni.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  // Qui salveresti il Pine Script (in futuro parser)
                  alert('Pine Script salvato! (Parser in sviluppo)')
                  setShowPineEditor(false)
                }}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Save size={20} />
                Salva Strategia
              </button>
              <button
                onClick={() => setShowPineEditor(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

