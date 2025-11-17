'use client'

import { useState } from 'react'
import { Play, Pause, Square, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

export default function BacktestPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState('EURUSD')
  const [selectedIndicator, setSelectedIndicator] = useState('')

  const assets = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD']
  const indicators = [
    'RSI',
    'MACD',
    'Bollinger Bands',
    'Moving Average',
    'Stochastic',
    'Fibonacci',
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">#1 Backtester</h1>
          <p className="text-gray-600">
            Metti alla prova le tue idee senza rischiare un centesimo
          </p>
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
                  >
                    <option value="">Nessuno</option>
                    {indicators.map((indicator) => (
                      <option key={indicator} value={indicator}>
                        {indicator}
                      </option>
                    ))}
                  </select>
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
                    onClick={() => setIsRunning(false)}
                    className="bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition"
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
                  <span className="text-gray-600">Win Rate</span>
                  <span className="font-bold text-green-600">65%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Profit Factor</span>
                  <span className="font-bold">1.85</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Trades</span>
                  <span className="font-bold">142</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Drawdown</span>
                  <span className="font-bold text-red-600">-8.5%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow">
              <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <BarChart3 size={64} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Grafico TradingView integrato
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    {selectedAsset} - {selectedIndicator || 'Nessun indicatore'}
                  </p>
                </div>
              </div>

              {/* Trade List */}
              <div className="space-y-2">
                <h3 className="font-semibold mb-2">Trade Recenti</h3>
                {[
                  { type: 'BUY', price: 1.0850, profit: 25, time: '10:30' },
                  { type: 'SELL', price: 1.0820, profit: -15, time: '11:15' },
                  { type: 'BUY', price: 1.0835, profit: 40, time: '12:00' },
                ].map((trade, index) => (
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
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

