'use client'

import { useState, useMemo } from 'react'
import { Plus, Upload, Filter, Download, TrendingUp, TrendingDown, X } from 'lucide-react'

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

  const [filters, setFilters] = useState({
    asset: 'Tutti gli asset',
    status: 'Tutti i risultati',
    date: '',
  })

  const [showAddModal, setShowAddModal] = useState(false)
  const [newTrade, setNewTrade] = useState({
    date: new Date().toISOString().split('T')[0],
    asset: 'EURUSD',
    type: 'BUY',
    entry: '',
    exit: '',
  })

  // Filtra i trade
  const filteredTrades = useMemo(() => {
    return trades.filter(trade => {
      if (filters.asset !== 'Tutti gli asset' && trade.asset !== filters.asset) return false
      if (filters.status !== 'Tutti i risultati' && trade.status !== filters.status.toLowerCase()) return false
      if (filters.date && trade.date !== filters.date) return false
      return true
    })
  }, [trades, filters])

  const stats = useMemo(() => {
    const filtered = filteredTrades
    const wins = filtered.filter(t => t.status === 'win')
    const losses = filtered.filter(t => t.status === 'loss')
    
    return {
      totalTrades: filtered.length,
      winRate: filtered.length > 0 
        ? ((wins.length / filtered.length) * 100).toFixed(1)
        : '0',
      totalProfit: filtered.reduce((sum, t) => sum + t.profit, 0),
      avgWin: wins.length > 0
        ? (wins.reduce((sum, t) => sum + t.profit, 0) / wins.length).toFixed(2)
        : '0',
      avgLoss: losses.length > 0
        ? (losses.reduce((sum, t) => sum + t.profit, 0) / losses.length).toFixed(2)
        : '0',
    }
  }, [filteredTrades])

  const handleAddTrade = () => {
    if (!newTrade.entry || !newTrade.exit) {
      alert('Inserisci entry e exit!')
      return
    }

    const entry = parseFloat(newTrade.entry)
    const exit = parseFloat(newTrade.exit)
    const profit = newTrade.type === 'BUY' 
      ? Math.round((exit - entry) * 10000) / 100
      : Math.round((entry - exit) * 10000) / 100

    const trade = {
      id: trades.length > 0 ? Math.max(...trades.map(t => t.id)) + 1 : 1,
      date: newTrade.date,
      asset: newTrade.asset,
      type: newTrade.type,
      entry: entry,
      exit: exit,
      profit: profit,
      status: profit > 0 ? 'win' : 'loss',
    }

    setTrades([trade, ...trades])
    setShowAddModal(false)
    setNewTrade({
      date: new Date().toISOString().split('T')[0],
      asset: 'EURUSD',
      type: 'BUY',
      entry: '',
      exit: '',
    })
  }

  const parseMT5CSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim())
    
    // Trova la riga dell'header (di solito contiene "Ticket" o "Time")
    let headerIndex = -1
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes('ticket') || lines[i].toLowerCase().includes('time')) {
        headerIndex = i
        break
      }
    }
    
    if (headerIndex === -1) return []
    
    const headers = lines[headerIndex].split(',').map(h => h.trim().toLowerCase())
    const dataLines = lines.slice(headerIndex + 1)
    
    return dataLines
      .filter(line => line.trim() && !line.toLowerCase().includes('balance') && !line.toLowerCase().includes('closed p/l'))
      .map((line, index) => {
        const values = line.split(',').map(v => v.trim())
        
        // Mappa le colonne MT5
        const getValue = (possibleNames: string[]) => {
          for (const name of possibleNames) {
            const idx = headers.findIndex(h => h.includes(name))
            if (idx >= 0 && values[idx]) return values[idx]
          }
          return ''
        }
        
        const time = getValue(['time', 'data', 'date'])
        const symbol = getValue(['symbol', 'asset', 'instrument'])
        const type = getValue(['type', 'operation'])
        const volume = getValue(['volume', 'size', 'lots'])
        const priceOpen = getValue(['price', 'open', 'entry'])
        const priceClose = getValue(['price.1', 'close', 'exit', 'price_1'])
        const profit = getValue(['profit', 'p/l', 'pl'])
        const swap = getValue(['swap', 'rollover'])
        const commission = getValue(['commission', 'comm'])
        
        // Converti tipo MT5 (0=BUY, 1=SELL) o testo
        let tradeType = 'BUY'
        if (type === '1' || type.toLowerCase().includes('sell') || type.toLowerCase().includes('sell')) {
          tradeType = 'SELL'
        } else if (type === '0' || type.toLowerCase().includes('buy')) {
          tradeType = 'BUY'
        }
        
        // Parse date MT5 (formato: YYYY.MM.DD HH:MM:SS o YYYY-MM-DD)
        let dateStr = time.split(' ')[0].replace(/\./g, '-')
        if (!dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // Prova altri formati
          const dateMatch = time.match(/(\d{4})[.\-](\d{2})[.\-](\d{2})/)
          if (dateMatch) {
            dateStr = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`
          } else {
            dateStr = new Date().toISOString().split('T')[0]
          }
        }
        
        const entryPrice = parseFloat(priceOpen) || 0
        const exitPrice = parseFloat(priceClose) || 0
        const profitValue = parseFloat(profit) || 0
        const swapValue = parseFloat(swap) || 0
        const commValue = parseFloat(commission) || 0
        const totalProfit = profitValue + swapValue + commValue
        
        return {
          id: trades.length + index + 1,
          date: dateStr,
          asset: symbol || 'EURUSD',
          type: tradeType,
          entry: entryPrice,
          exit: exitPrice,
          profit: Math.round(totalProfit * 100) / 100,
          status: totalProfit > 0 ? 'win' : 'loss',
        }
      })
      .filter(trade => trade.entry > 0 && trade.exit > 0)
  }

  const parseMT5HTML = (html: string) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const tables = doc.querySelectorAll('table')
    
    if (tables.length === 0) return []
    
    // Trova la tabella con i trade (di solito la prima o quella con più righe)
    let tradeTable = tables[0]
    for (const table of tables) {
      if (table.rows.length > tradeTable.rows.length) {
        tradeTable = table
      }
    }
    
    const rows = Array.from(tradeTable.rows)
    if (rows.length < 2) return []
    
    // Trova header
    const headerRow = rows[0]
    const headers = Array.from(headerRow.cells).map(cell => cell.textContent?.trim().toLowerCase() || '')
    
    const dataRows = rows.slice(1)
    
    return dataRows
      .filter(row => {
        const text = row.textContent?.toLowerCase() || ''
        return !text.includes('balance') && !text.includes('closed p/l') && !text.includes('total')
      })
      .map((row, index) => {
        const cells = Array.from(row.cells).map(cell => cell.textContent?.trim() || '')
        
        const getValue = (possibleNames: string[]) => {
          for (const name of possibleNames) {
            const idx = headers.findIndex(h => h.includes(name))
            if (idx >= 0 && cells[idx]) return cells[idx]
          }
          return ''
        }
        
        const time = getValue(['time', 'data', 'date'])
        const symbol = getValue(['symbol', 'asset', 'instrument'])
        const type = getValue(['type', 'operation'])
        const priceOpen = getValue(['price', 'open', 'entry'])
        const priceClose = getValue(['price.1', 'close', 'exit', 'price_1', 'price s/l'])
        const profit = getValue(['profit', 'p/l', 'pl'])
        const swap = getValue(['swap', 'rollover'])
        const commission = getValue(['commission', 'comm'])
        
        let tradeType = 'BUY'
        if (type === '1' || type.toLowerCase().includes('sell')) {
          tradeType = 'SELL'
        } else if (type === '0' || type.toLowerCase().includes('buy')) {
          tradeType = 'BUY'
        }
        
        let dateStr = time.split(' ')[0].replace(/\./g, '-')
        if (!dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const dateMatch = time.match(/(\d{4})[.\-](\d{2})[.\-](\d{2})/)
          if (dateMatch) {
            dateStr = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`
          } else {
            dateStr = new Date().toISOString().split('T')[0]
          }
        }
        
        const entryPrice = parseFloat(priceOpen.replace(/[^\d.-]/g, '')) || 0
        const exitPrice = parseFloat(priceClose.replace(/[^\d.-]/g, '')) || 0
        const profitValue = parseFloat(profit.replace(/[^\d.-]/g, '')) || 0
        const swapValue = parseFloat(swap.replace(/[^\d.-]/g, '')) || 0
        const commValue = parseFloat(commission.replace(/[^\d.-]/g, '')) || 0
        const totalProfit = profitValue + swapValue + commValue
        
        return {
          id: trades.length + index + 1,
          date: dateStr,
          asset: symbol || 'EURUSD',
          type: tradeType,
          entry: entryPrice,
          exit: exitPrice,
          profit: Math.round(totalProfit * 100) / 100,
          status: totalProfit > 0 ? 'win' : 'loss',
        }
      })
      .filter(trade => trade.entry > 0 && trade.exit > 0)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv,.html,.htm'
    input.onchange = (e: any) => {
      const file = e.target.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event: any) => {
        const text = event.target.result
        const fileName = file.name.toLowerCase()
        
        let importedTrades: any[] = []
        
        // Determina il tipo di file
        if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
          // File HTML da MT5
          importedTrades = parseMT5HTML(text)
        } else if (fileName.endsWith('.csv')) {
          // Prova prima come CSV MT5, poi come CSV generico
          importedTrades = parseMT5CSV(text)
          
          // Se non ha trovato trade, prova formato CSV generico
          if (importedTrades.length === 0) {
            const lines = text.split('\n').slice(1)
            importedTrades = lines
              .filter((line: string) => line.trim())
              .map((line: string, index: number) => {
                const [date, asset, type, entry, exit, profit, status] = line.split(',')
                if (!date || !asset) return null
                return {
                  id: trades.length + index + 1,
                  date: date.trim(),
                  asset: asset.trim(),
                  type: type?.trim() || 'BUY',
                  entry: parseFloat(entry?.trim() || '0'),
                  exit: parseFloat(exit?.trim() || '0'),
                  profit: parseFloat(profit?.trim() || '0'),
                  status: (status?.trim().toLowerCase() || (parseFloat(profit?.trim() || '0') > 0 ? 'win' : 'loss')),
                }
              })
              .filter((t: any) => t && t.entry > 0 && t.exit > 0)
          }
        }

        if (importedTrades.length === 0) {
          alert('Nessun trade trovato nel file. Assicurati che il file provenga da MetaTrader 5.')
          return
        }

        setTrades([...importedTrades, ...trades])
        alert(`${importedTrades.length} trade importati con successo da MetaTrader 5!`)
      }
      reader.readAsText(file, 'UTF-8')
    }
    input.click()
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
            <button 
              onClick={handleImport}
              className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <Upload size={20} />
              Importa
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
            >
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
            <div className="text-3xl font-bold">
              {trades.length > 0 && parseFloat(stats.avgWin) > 0 && parseFloat(stats.avgLoss) < 0
                ? (Math.abs(parseFloat(stats.avgWin) / parseFloat(stats.avgLoss))).toFixed(2)
                : '1.33'}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow flex items-center gap-4">
          <Filter size={20} className="text-gray-500" />
          <select 
            value={filters.asset}
            onChange={(e) => setFilters({ ...filters, asset: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2"
          >
            <option>Tutti gli asset</option>
            <option>EURUSD</option>
            <option>GBPUSD</option>
            <option>USDJPY</option>
            <option>AUDUSD</option>
            <option>USDCAD</option>
            <option>NZDUSD</option>
          </select>
          <select 
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2"
          >
            <option>Tutti i risultati</option>
            <option>Win</option>
            <option>Loss</option>
          </select>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2"
          />
          {(filters.asset !== 'Tutti gli asset' || filters.status !== 'Tutti i risultati' || filters.date) && (
            <button
              onClick={() => setFilters({ asset: 'Tutti gli asset', status: 'Tutti i risultati', date: '' })}
              className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
            >
              <X size={16} />
              Reset
            </button>
          )}
          <button 
            onClick={() => {
              const csv = [
                ['Data', 'Asset', 'Tipo', 'Entry', 'Exit', 'Profit/Loss', 'Status'],
                ...trades.map(t => [t.date, t.asset, t.type, t.entry, t.exit, t.profit, t.status])
              ].map(row => row.join(',')).join('\n')
              
              const blob = new Blob([csv], { type: 'text/csv' })
              const url = window.URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `trades_${new Date().toISOString().split('T')[0]}.csv`
              a.click()
            }}
            className="ml-auto bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
          >
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
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Nessun trade trovato con i filtri selezionati
                  </td>
                </tr>
              ) : (
                filteredTrades.map((trade) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Aggiungi Trade */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Nuovo Trade</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Data</label>
                <input
                  type="date"
                  value={newTrade.date}
                  onChange={(e) => setNewTrade({ ...newTrade, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Asset</label>
                <select
                  value={newTrade.asset}
                  onChange={(e) => setNewTrade({ ...newTrade, asset: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option>EURUSD</option>
                  <option>GBPUSD</option>
                  <option>USDJPY</option>
                  <option>AUDUSD</option>
                  <option>USDCAD</option>
                  <option>NZDUSD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tipo</label>
                <select
                  value={newTrade.type}
                  onChange={(e) => setNewTrade({ ...newTrade, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option>BUY</option>
                  <option>SELL</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Entry</label>
                <input
                  type="number"
                  step="0.0001"
                  value={newTrade.entry}
                  onChange={(e) => setNewTrade({ ...newTrade, entry: e.target.value })}
                  placeholder="1.0850"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Exit</label>
                <input
                  type="number"
                  step="0.0001"
                  value={newTrade.exit}
                  onChange={(e) => setNewTrade({ ...newTrade, exit: e.target.value })}
                  placeholder="1.0875"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddTrade}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                  Aggiungi
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

