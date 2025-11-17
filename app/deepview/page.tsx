'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, BarChart3, Activity, Globe } from 'lucide-react'

export default function DeepViewPage() {
  const [selectedAsset, setSelectedAsset] = useState('EURUSD')

  const assets = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD']

  const overview = {
    sentiment: 'Bullish',
    volatility: 'Medium',
    trend: 'Upward',
    support: 1.0800,
    resistance: 1.0900,
  }

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
        <div className="bg-white rounded-xl p-6 shadow mb-6">
          <label className="block text-sm font-medium mb-2">Seleziona Asset</label>
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="w-full md:w-64 border border-gray-300 rounded-lg px-4 py-2"
          >
            {assets.map((asset) => (
              <option key={asset} value={asset}>
                {asset}
              </option>
            ))}
          </select>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Overview Card */}
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="text-primary-600" size={24} />
              <h2 className="text-xl font-bold">Overview</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Sentiment</span>
                <span className="font-semibold text-green-600">
                  {overview.sentiment}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Volatilità</span>
                <span className="font-semibold">{overview.volatility}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trend</span>
                <span className="font-semibold text-green-600">
                  {overview.trend}
                </span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Support</span>
                  <span className="text-sm font-semibold">
                    {overview.support}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Resistance</span>
                  <span className="text-sm font-semibold">
                    {overview.resistance}
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
                  <span className="text-sm font-semibold">65%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: '65%' }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Bearish</span>
                  <span className="text-sm font-semibold">35%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{ width: '35%' }}
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
                <div className="text-3xl font-bold mb-1">0.85%</div>
                <div className="text-sm text-gray-600">ATR (14)</div>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Settimana</span>
                  <span className="text-sm font-semibold text-green-600">
                    +0.3%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Mese</span>
                  <span className="text-sm font-semibold text-green-600">
                    +1.2%
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
              {[
                { month: 'Gen', value: 0.5, positive: true },
                { month: 'Feb', value: 0.3, positive: true },
                { month: 'Mar', value: -0.2, positive: false },
                { month: 'Apr', value: 0.8, positive: true },
              ].map((item, index) => (
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
            <h2 className="text-xl font-bold mb-4">COT Report</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Commercial</div>
                <div className="text-2xl font-bold">-45,234</div>
                <div className="text-xs text-gray-500 mt-1">Net Position</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Non-Commercial</div>
                <div className="text-2xl font-bold text-green-600">+52,189</div>
                <div className="text-xs text-gray-500 mt-1">Net Position</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Non-Reportable</div>
                <div className="text-2xl font-bold text-red-600">-6,955</div>
                <div className="text-xs text-gray-500 mt-1">Net Position</div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Ultimo aggiornamento: 16 Gennaio 2024
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

