'use client'

import { useState } from 'react'
import { Plus, Upload, Filter, Download, TrendingUp, TrendingDown } from 'lucide-react'

export default function JournalPage() {
  const [trades, setTrades] = useState([
    {
      id: 1,
      date: '2024-01-15',
      asset: 'EURUSD',
      type: 'BUY',
      entry: 1.0850,
      exit: 1.0875,
      profit: 25,
      status: 'win',
    },
    {
      id: 2,
      date: '2024-01-15',
      asset: 'GBPUSD',
      type: 'SELL',
      entry: 1.2650,
      exit: 1.2635,
      profit: 15,
      status: 'win',
    },
    {
      id: 3,
      date: '2024-01-14',
      asset: 'USDJPY',
      type: 'BUY',
      entry: 148.50,
      exit: 148.20,
      profit: -30,
      status: 'loss',
    },
  ])

  const stats = {
    totalTrades: trades.length,
    winRate: 66.7,
    totalProfit: 10,
    avgWin: 20,
    avgLoss: -30,
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Journal Automatico</h1>
            <p className="text-gray-600">
              Analizza la tua operatività con statistiche dettagliate
            </p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
              <Upload size={20} />
              Importa
            </button>
            <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2">
              <Plus size={20} />
              Nuovo Trade
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-sm text-gray-600 mb-1">Total Trades</div>
            <div className="text-3xl font-bold">{stats.totalTrades}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-sm text-gray-600 mb-1">Win Rate</div>
            <div className="text-3xl font-bold text-green-600">
              {stats.winRate}%
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-sm text-gray-600 mb-1">Total Profit</div>
            <div
              className={`text-3xl font-bold ${
                stats.totalProfit > 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {stats.totalProfit > 0 ? '+' : ''}
              {stats.totalProfit}€
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-sm text-gray-600 mb-1">Profit Factor</div>
            <div className="text-3xl font-bold">1.33</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow flex items-center gap-4">
          <Filter size={20} className="text-gray-500" />
          <select className="border border-gray-300 rounded-lg px-4 py-2">
            <option>Tutti gli asset</option>
            <option>EURUSD</option>
            <option>GBPUSD</option>
            <option>USDJPY</option>
          </select>
          <select className="border border-gray-300 rounded-lg px-4 py-2">
            <option>Tutti i risultati</option>
            <option>Win</option>
            <option>Loss</option>
          </select>
          <input
            type="date"
            className="border border-gray-300 rounded-lg px-4 py-2"
          />
          <button className="ml-auto bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center gap-2">
            <Download size={20} />
            Esporta
          </button>
        </div>

        {/* Trades Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Asset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Entry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Exit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Profit/Loss
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {trades.map((trade) => (
                <tr key={trade.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {trade.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {trade.asset}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 rounded ${
                        trade.type === 'BUY'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {trade.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {trade.entry}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {trade.exit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div
                      className={`flex items-center gap-1 font-semibold ${
                        trade.profit > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {trade.profit > 0 ? (
                        <TrendingUp size={16} />
                      ) : (
                        <TrendingDown size={16} />
                      )}
                      {trade.profit > 0 ? '+' : ''}
                      {trade.profit}€
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 rounded ${
                        trade.status === 'win'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {trade.status === 'win' ? 'Win' : 'Loss'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

