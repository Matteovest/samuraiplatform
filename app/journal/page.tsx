'use client'

import { useState, useMemo } from 'react'
import { Plus, Upload, Filter, Download, TrendingUp, TrendingDown, X, Calculator, BarChart3, PieChart, LineChart, Target } from 'lucide-react'
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ReferenceLine } from 'recharts'

interface Trade {
  id: number
  date: string
  asset: string
  type: 'BUY' | 'SELL'
  entry: number
  exit: number
  profit: number
  status: 'win' | 'loss'
  entryTime?: string // Opzionale: ora di entrata
  exitTime?: string // Opzionale: ora di uscita
}

export default function JournalPage() {
  const [trades, setTrades] = useState<Trade[]>([
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
  const [showSimulator, setShowSimulator] = useState(false)
  const [newTrade, setNewTrade] = useState({
    date: new Date().toISOString().split('T')[0],
    asset: 'EURUSD',
    type: 'BUY',
    entry: '',
    exit: '',
    entryTime: '',
    exitTime: '',
  })
  
  // Simulator state
  const [simulator, setSimulator] = useState({
    initialCapital: 10000,
    riskPerTrade: 1,
    winRate: 50,
    avgWin: 100,
    avgLoss: 50,
    numTrades: 100,
  })
  
  const [monteCarloRuns, setMonteCarloRuns] = useState(1000)
  const [showMonteCarlo, setShowMonteCarlo] = useState(false)
  const [customLossThreshold, setCustomLossThreshold] = useState(-20)

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
    
    // Calcola capitale nel tempo
    let runningCapital = 10000 // Capitale iniziale
    const equityCurve = filtered
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(trade => {
        runningCapital += trade.profit
        return {
          date: trade.date,
          equity: runningCapital,
          profit: trade.profit,
        }
      })
    
    // Calcola max drawdown
    let peak = 10000
    let maxDrawdown = 0
    equityCurve.forEach(point => {
      if (point.equity > peak) peak = point.equity
      const drawdown = ((peak - point.equity) / peak) * 100
      if (drawdown > maxDrawdown) maxDrawdown = drawdown
    })
    
    // Calcola Sharpe Ratio (semplificato)
    const returns = equityCurve.map((point, i) => {
      if (i === 0) return 0
      return ((point.equity - equityCurve[i - 1].equity) / equityCurve[i - 1].equity) * 100
    }).filter(r => r !== 0)
    
    const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0
    const stdDev = returns.length > 0 
      ? Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length)
      : 0
    const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev).toFixed(2) : '0'
    
    // Distribuzione per asset
    const assetDistribution = filtered.reduce((acc: any, trade) => {
      acc[trade.asset] = (acc[trade.asset] || 0) + Math.abs(trade.profit)
      return acc
    }, {})
    
    // Distribuzione per tipo
    const typeDistribution = filtered.reduce((acc: any, trade) => {
      acc[trade.type] = (acc[trade.type] || 0) + 1
      return acc
    }, {})
    
    // Analisi per giorno della settimana
    const dayOfWeekStats = filtered.reduce((acc: any, trade) => {
      const date = new Date(trade.date)
      const dayName = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'][date.getDay()]
      if (!acc[dayName]) {
        acc[dayName] = { profit: 0, count: 0, wins: 0 }
      }
      acc[dayName].profit += trade.profit
      acc[dayName].count += 1
      if (trade.status === 'win') acc[dayName].wins += 1
      return acc
    }, {})
    
    // Analisi per giorno del mese (1-31)
    const dayOfMonthStats = filtered.reduce((acc: any, trade) => {
      const day = new Date(trade.date).getDate()
      if (!acc[day]) {
        acc[day] = { profit: 0, count: 0, wins: 0 }
      }
      acc[day].profit += trade.profit
      acc[day].count += 1
      if (trade.status === 'win') acc[day].wins += 1
      return acc
    }, {})
    
    // Analisi per settimana del mese (1-4)
    const weekOfMonthStats = filtered.reduce((acc: any, trade) => {
      const date = new Date(trade.date)
      const week = Math.ceil(date.getDate() / 7)
      const weekKey = `Settimana ${week}`
      if (!acc[weekKey]) {
        acc[weekKey] = { profit: 0, count: 0, wins: 0 }
      }
      acc[weekKey].profit += trade.profit
      acc[weekKey].count += 1
      if (trade.status === 'win') acc[weekKey].wins += 1
      return acc
    }, {})
    
    // Analisi per mese
    const monthStats = filtered.reduce((acc: any, trade) => {
      const date = new Date(trade.date)
      const monthName = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 
                         'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'][date.getMonth()]
      if (!acc[monthName]) {
        acc[monthName] = { profit: 0, count: 0, wins: 0 }
      }
      acc[monthName].profit += trade.profit
      acc[monthName].count += 1
      if (trade.status === 'win') acc[monthName].wins += 1
      return acc
    }, {})
    
    // Analisi Long vs Short
    const longTrades = filtered.filter(t => t.type === 'BUY')
    const shortTrades = filtered.filter(t => t.type === 'SELL')
    const longWins = longTrades.filter(t => t.status === 'win')
    const shortWins = shortTrades.filter(t => t.status === 'win')
    const longWinRate = longTrades.length > 0 ? ((longWins.length / longTrades.length) * 100).toFixed(1) : '0'
    const shortWinRate = shortTrades.length > 0 ? ((shortWins.length / shortTrades.length) * 100).toFixed(1) : '0'
    
    // Trade per giorno
    const tradesPerDay = filtered.reduce((acc: any, trade) => {
      acc[trade.date] = (acc[trade.date] || 0) + 1
      return acc
    }, {})
    const avgTradesPerDay = Object.keys(tradesPerDay).length > 0
      ? (filtered.length / Object.keys(tradesPerDay).length).toFixed(2)
      : '0'
    
    // Trade per settimana
    const tradesPerWeek = filtered.reduce((acc: any, trade) => {
      const date = new Date(trade.date)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay()) // Inizio settimana (domenica)
      const weekKey = weekStart.toISOString().split('T')[0]
      acc[weekKey] = (acc[weekKey] || 0) + 1
      return acc
    }, {})
    const avgTradesPerWeek = Object.keys(tradesPerWeek).length > 0
      ? (filtered.length / Object.keys(tradesPerWeek).length).toFixed(2)
      : '0'
    
    // Tempo di permanenza a mercato (se disponibile entryTime e exitTime)
    const holdingTimes: number[] = []
    filtered.forEach(trade => {
      if (trade.entryTime && trade.exitTime) {
        try {
          const entry = new Date(`${trade.date}T${trade.entryTime}:00`)
          let exit = new Date(`${trade.date}T${trade.exitTime}:00`)
          
          // Se exit è prima di entry, probabilmente è il giorno dopo
          if (exit < entry) {
            exit = new Date(exit.getTime() + 24 * 60 * 60 * 1000)
          }
          
          const hours = (exit.getTime() - entry.getTime()) / (1000 * 60 * 60)
          if (hours > 0 && hours < 168) { // Max 7 giorni
            holdingTimes.push(hours)
          }
        } catch (e) {
          // Ignora errori di parsing date
        }
      }
    })
    const avgHoldingTime = holdingTimes.length > 0
      ? (holdingTimes.reduce((a, b) => a + b, 0) / holdingTimes.length).toFixed(2)
      : null
    
    const totalProfit = filtered.reduce((sum, t) => sum + t.profit, 0)
    const totalWins = wins.reduce((sum, t) => sum + t.profit, 0)
    const totalLosses = Math.abs(losses.reduce((sum, t) => sum + t.profit, 0))
    
    return {
      totalTrades: filtered.length,
      winRate: filtered.length > 0 
        ? ((wins.length / filtered.length) * 100).toFixed(1)
        : '0',
      totalProfit,
      avgWin: wins.length > 0
        ? (wins.reduce((sum, t) => sum + t.profit, 0) / wins.length).toFixed(2)
        : '0',
      avgLoss: losses.length > 0
        ? (losses.reduce((sum, t) => sum + t.profit, 0) / losses.length).toFixed(2)
        : '0',
      profitFactor: totalLosses > 0 ? (totalWins / totalLosses).toFixed(2) : '0',
      maxDrawdown: maxDrawdown.toFixed(2),
      sharpeRatio,
      equityCurve,
      assetDistribution: Object.entries(assetDistribution).map(([name, value]) => ({
        name,
        value: Number(value),
      })),
      typeDistribution: Object.entries(typeDistribution).map(([name, value]) => ({
        name,
        value: Number(value),
      })),
      winLossDistribution: [
        { name: 'Wins', value: wins.length, color: '#10b981' },
        { name: 'Losses', value: losses.length, color: '#ef4444' },
      ],
      // Nuove statistiche
      dayOfWeekStats: Object.entries(dayOfWeekStats)
        .map(([name, data]: [string, any]) => ({
          name,
          profit: data.profit,
          count: data.count,
          winRate: data.count > 0 ? ((data.wins / data.count) * 100).toFixed(1) : '0',
          avgProfit: data.count > 0 ? (data.profit / data.count).toFixed(2) : '0',
          dayOrder: ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'].indexOf(name),
        }))
        .sort((a, b) => {
          // Ordina per giorno della settimana (Lunedì=0, Domenica=6)
          if (a.dayOrder === -1) return 1
          if (b.dayOrder === -1) return -1
          return a.dayOrder - b.dayOrder
        })
        .map(({ dayOrder, ...rest }) => rest), // Rimuovi dayOrder dal risultato finale
      dayOfMonthStats: Object.entries(dayOfMonthStats).map(([day, data]: [string, any]) => ({
        day: parseInt(day),
        profit: data.profit,
        count: data.count,
        winRate: data.count > 0 ? ((data.wins / data.count) * 100).toFixed(1) : '0',
      })).sort((a, b) => a.day - b.day),
      weekOfMonthStats: Object.entries(weekOfMonthStats).map(([name, data]: [string, any]) => ({
        name,
        profit: data.profit,
        count: data.count,
        winRate: data.count > 0 ? ((data.wins / data.count) * 100).toFixed(1) : '0',
      })),
      monthStats: Object.entries(monthStats).map(([name, data]: [string, any]) => ({
        name,
        profit: data.profit,
        count: data.count,
        winRate: data.count > 0 ? ((data.wins / data.count) * 100).toFixed(1) : '0',
      })),
      longShortStats: {
        longCount: longTrades.length,
        shortCount: shortTrades.length,
        longWinRate,
        shortWinRate,
        longProfit: longTrades.reduce((sum, t) => sum + t.profit, 0),
        shortProfit: shortTrades.reduce((sum, t) => sum + t.profit, 0),
      },
      avgTradesPerDay,
      avgTradesPerWeek,
      avgHoldingTime,
    }
  }, [filteredTrades])
  
  // Simula performance futura
  const simulatePerformance = useMemo(() => {
    const { initialCapital, riskPerTrade, winRate, avgWin, avgLoss, numTrades } = simulator
    let capital = initialCapital
    const simulation = []
    
    for (let i = 0; i < numTrades; i++) {
      const isWin = Math.random() * 100 < winRate
      const riskAmount = (capital * riskPerTrade) / 100
      const profit = isWin 
        ? (riskAmount * (avgWin / avgLoss))
        : -riskAmount
      
      capital += profit
      simulation.push({
        trade: i + 1,
        capital: Math.max(0, capital),
        profit,
        isWin,
      })
    }
    
    const finalCapital = capital
    const totalReturn = ((finalCapital - initialCapital) / initialCapital) * 100
    
    return {
      simulation,
      finalCapital: finalCapital.toFixed(2),
      totalReturn: totalReturn.toFixed(2),
      totalProfit: (finalCapital - initialCapital).toFixed(2),
    }
  }, [simulator])
  
  // Analisi Monte Carlo
  const monteCarloAnalysis = useMemo(() => {
    if (!showMonteCarlo) return null
    
    const { initialCapital, riskPerTrade, winRate, avgWin, avgLoss, numTrades } = simulator
    const simulations: Array<{
      equityCurve: Array<{ trade: number; capital: number }>
      finalReturn: number
      finalCapital: number
      winRate: number
      totalWins: number
      totalLosses: number
      totalProfit: number
      totalLoss: number
      profitFactor: number
      avgWin: number
      avgLoss: number
      maxDrawdown: number
      riskReward: number
    }> = []
    
    // Esegui N simulazioni
    for (let run = 0; run < monteCarloRuns; run++) {
      let capital = initialCapital
      const equityCurve: Array<{ trade: number; capital: number }> = []
      let totalWins = 0
      let totalLosses = 0
      let totalProfit = 0
      let totalLoss = 0
      let peak = initialCapital
      let maxDrawdown = 0
      
      for (let i = 0; i < numTrades; i++) {
        const isWin = Math.random() * 100 < winRate
        const riskAmount = (capital * riskPerTrade) / 100
        const profit = isWin 
          ? (riskAmount * (avgWin / avgLoss))
          : -riskAmount
        
        capital += profit
        capital = Math.max(0, capital) // Non può andare sotto zero
        
        if (isWin) {
          totalWins++
          totalProfit += profit
        } else {
          totalLosses++
          totalLoss += Math.abs(profit)
        }
        
        // Calcola drawdown
        if (capital > peak) peak = capital
        const drawdown = ((peak - capital) / peak) * 100
        if (drawdown > maxDrawdown) maxDrawdown = drawdown
        
        equityCurve.push({
          trade: i + 1,
          capital: capital,
        })
      }
      
      const finalReturn = ((capital - initialCapital) / initialCapital) * 100
      const actualWinRate = numTrades > 0 ? (totalWins / numTrades) * 100 : 0
      const actualAvgWin = totalWins > 0 ? totalProfit / totalWins : 0
      const actualAvgLoss = totalLosses > 0 ? totalLoss / totalLosses : 0
      const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : 0
      const riskReward = actualAvgLoss > 0 ? actualAvgWin / actualAvgLoss : 0
      
      simulations.push({
        equityCurve,
        finalReturn,
        finalCapital: capital,
        winRate: actualWinRate,
        totalWins,
        totalLosses,
        totalProfit,
        totalLoss,
        profitFactor,
        avgWin: actualAvgWin,
        avgLoss: actualAvgLoss,
        maxDrawdown,
        riskReward,
      })
    }
    
    // Calcola statistiche aggregate
    const finalReturns = simulations.map(s => s.finalReturn)
    finalReturns.sort((a, b) => a - b)
    
    const avgReturn = finalReturns.reduce((a, b) => a + b, 0) / finalReturns.length
    const medianReturn = finalReturns[Math.floor(finalReturns.length / 2)]
    const percentile5 = finalReturns[Math.floor(finalReturns.length * 0.05)]
    const percentile25 = finalReturns[Math.floor(finalReturns.length * 0.25)]
    const percentile75 = finalReturns[Math.floor(finalReturns.length * 0.75)]
    const percentile95 = finalReturns[Math.floor(finalReturns.length * 0.95)]
    
    // Statistiche aggregate per winrate, profit factor, RR
    const avgWinRate = simulations.reduce((sum, s) => sum + s.winRate, 0) / simulations.length
    const avgProfitFactor = simulations.reduce((sum, s) => sum + s.profitFactor, 0) / simulations.length
    const avgRiskReward = simulations.reduce((sum, s) => sum + s.riskReward, 0) / simulations.length
    const avgMaxDrawdown = simulations.reduce((sum, s) => sum + s.maxDrawdown, 0) / simulations.length
    
    // Calcola probabilità di profitto
    const profitableRuns = finalReturns.filter(r => r > 0).length
    const profitProbability = (profitableRuns / finalReturns.length) * 100
    
    // Calcola probabilità di perdita personalizzata
    const customLossRuns = finalReturns.filter(r => r < customLossThreshold).length
    const customLossProbability = (customLossRuns / finalReturns.length) * 100
    
    // Prepara dati per grafico - mostra tutte le simulazioni (sample di max 50 per performance)
    const sampleSize = Math.min(50, simulations.length)
    const sampledSimulations = simulations.slice(0, sampleSize)
    
    // Crea dati per grafico - ogni punto contiene tutte le simulazioni a quel trade
    const chartData = Array(numTrades).fill(0).map((_, tradeIndex) => {
      const dataPoint: any = { trade: tradeIndex + 1 }
      
      // Aggiungi capitale per ogni simulazione campionata
      sampledSimulations.forEach((sim, simIndex) => {
        if (sim.equityCurve[tradeIndex]) {
          dataPoint[`sim${simIndex}`] = sim.equityCurve[tradeIndex].capital
        }
      })
      
      // Calcola percentili per questo trade
      const capitalsAtTrade = simulations.map(s => s.equityCurve[tradeIndex]?.capital || initialCapital)
      capitalsAtTrade.sort((a, b) => a - b)
      dataPoint.percentile5 = capitalsAtTrade[Math.floor(capitalsAtTrade.length * 0.05)]
      dataPoint.percentile25 = capitalsAtTrade[Math.floor(capitalsAtTrade.length * 0.25)]
      dataPoint.median = capitalsAtTrade[Math.floor(capitalsAtTrade.length * 0.5)]
      dataPoint.percentile75 = capitalsAtTrade[Math.floor(capitalsAtTrade.length * 0.75)]
      dataPoint.percentile95 = capitalsAtTrade[Math.floor(capitalsAtTrade.length * 0.95)]
      dataPoint.avg = capitalsAtTrade.reduce((a, b) => a + b, 0) / capitalsAtTrade.length
      
      return dataPoint
    })
    
    return {
      simulations,
      chartData,
      avgReturn: avgReturn.toFixed(2),
      medianReturn: medianReturn.toFixed(2),
      percentile5: percentile5.toFixed(2),
      percentile25: percentile25.toFixed(2),
      percentile75: percentile75.toFixed(2),
      percentile95: percentile95.toFixed(2),
      profitProbability: profitProbability.toFixed(1),
      customLossProbability: customLossProbability.toFixed(1),
      avgWinRate: avgWinRate.toFixed(2),
      avgProfitFactor: avgProfitFactor.toFixed(2),
      avgRiskReward: avgRiskReward.toFixed(2),
      avgMaxDrawdown: avgMaxDrawdown.toFixed(2),
      minReturn: Math.min(...finalReturns).toFixed(2),
      maxReturn: Math.max(...finalReturns).toFixed(2),
    }
  }, [simulator, monteCarloRuns, showMonteCarlo, customLossThreshold])

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

    const trade: Trade = {
      id: trades.length > 0 ? Math.max(...trades.map(t => t.id)) + 1 : 1,
      date: newTrade.date,
      asset: newTrade.asset,
      type: newTrade.type as 'BUY' | 'SELL',
      entry: entry,
      exit: exit,
      profit: profit,
      status: profit > 0 ? 'win' : 'loss',
      entryTime: newTrade.entryTime || undefined,
      exitTime: newTrade.exitTime || undefined,
    }

    setTrades([trade, ...trades])
    setShowAddModal(false)
    setNewTrade({
      date: new Date().toISOString().split('T')[0],
      asset: 'EURUSD',
      type: 'BUY',
      entry: '',
      exit: '',
      entryTime: '',
      exitTime: '',
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
        
        // Estrai ore se disponibili (formato: YYYY.MM.DD HH:MM:SS)
        const timeParts = time.split(' ')
        let entryTime: string | undefined = undefined
        let exitTime: string | undefined = undefined
        if (timeParts.length > 1) {
          const timeStr = timeParts[1]
          if (timeStr.match(/^\d{2}:\d{2}:\d{2}$/)) {
            entryTime = timeStr.substring(0, 5) // HH:MM
            exitTime = timeStr.substring(0, 5) // Usa stessa ora se non disponibile separatamente
          }
        }
        
        return {
          id: trades.length + index + 1,
          date: dateStr,
          asset: symbol || 'EURUSD',
          type: tradeType,
          entry: entryPrice,
          exit: exitPrice,
          profit: Math.round(totalProfit * 100) / 100,
          status: totalProfit > 0 ? 'win' : 'loss',
          entryTime,
          exitTime,
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
        
        // Estrai ore se disponibili
        const timeParts = time.split(' ')
        let entryTime: string | undefined = undefined
        let exitTime: string | undefined = undefined
        if (timeParts.length > 1) {
          const timeStr = timeParts[1]
          if (timeStr.match(/^\d{2}:\d{2}/)) {
            entryTime = timeStr.substring(0, 5) // HH:MM
            exitTime = timeStr.substring(0, 5)
          }
        }
        
        return {
          id: trades.length + index + 1,
          date: dateStr,
          asset: symbol || 'EURUSD',
          type: tradeType,
          entry: entryPrice,
          exit: exitPrice,
          profit: Math.round(totalProfit * 100) / 100,
          status: totalProfit > 0 ? 'win' : 'loss',
          entryTime,
          exitTime,
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
                const parts = line.split(',')
                const [date, asset, type, entry, exit, profit, status, entryTime, exitTime] = parts
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
                  entryTime: entryTime?.trim() || undefined,
                  exitTime: exitTime?.trim() || undefined,
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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              {stats.totalProfit.toFixed(2)}€
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-sm text-gray-600 mb-1">Profit Factor</div>
            <div className="text-3xl font-bold">
              {stats.profitFactor}
            </div>
          </div>
        </div>
        
        {/* Advanced Statistics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-sm text-gray-600 mb-1">Avg Win</div>
            <div className="text-2xl font-bold text-green-600">
              +{stats.avgWin}€
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-sm text-gray-600 mb-1">Avg Loss</div>
            <div className="text-2xl font-bold text-red-600">
              {stats.avgLoss}€
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-sm text-gray-600 mb-1">Max Drawdown</div>
            <div className="text-2xl font-bold text-orange-600">
              {stats.maxDrawdown}%
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-sm text-gray-600 mb-1">Sharpe Ratio</div>
            <div className="text-2xl font-bold">
              {stats.sharpeRatio}
            </div>
          </div>
        </div>
        
        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Equity Curve */}
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="flex items-center gap-2 mb-4">
              <LineChart className="text-primary-600" size={24} />
              <h2 className="text-xl font-bold">Andamento Capitale</h2>
            </div>
            {stats.equityCurve.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={stats.equityCurve}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 13, fill: '#374151', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                    style={{ fontSize: '13px', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 13, fill: '#374151', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                    style={{ fontSize: '13px', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`${value.toFixed(2)}€`, 'Capitale']}
                    labelFormatter={(label) => `Data: ${label}`}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      padding: '8px 12px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="equity" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={false}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                Nessun dato disponibile
              </div>
            )}
          </div>
          
          {/* Win/Loss Distribution Pie */}
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="text-primary-600" size={24} />
              <h2 className="text-xl font-bold">Distribuzione Win/Loss</h2>
            </div>
            {stats.winLossDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={stats.winLossDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    style={{ fontSize: '14px', fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 500 }}
                  >
                    {stats.winLossDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      padding: '8px 12px'
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                Nessun dato disponibile
              </div>
            )}
          </div>
          
          {/* Asset Distribution Pie */}
          {stats.assetDistribution.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="text-primary-600" size={24} />
                <h2 className="text-xl font-bold">Distribuzione per Asset</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={stats.assetDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    style={{ fontSize: '14px', fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 500 }}
                  >
                    {stats.assetDistribution.map((entry, index) => {
                      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    })}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => `${value.toFixed(2)}€`}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      padding: '8px 12px'
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          )}
          
          {/* Type Distribution Bar */}
          {stats.typeDistribution.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="text-primary-600" size={24} />
                <h2 className="text-xl font-bold">Distribuzione per Tipo</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.typeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 14, fill: '#374151', fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 500 }}
                    style={{ fontSize: '14px', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 14, fill: '#374151', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                    style={{ fontSize: '14px', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      padding: '8px 12px'
                    }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        
        {/* Advanced Time Analysis */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Day of Week Profitability */}
          {stats.dayOfWeekStats.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow">
              <h2 className="text-xl font-bold mb-4">Profittabilità per Giorno della Settimana</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.dayOfWeekStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 14, fill: '#374151', fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 500 }}
                    style={{ fontSize: '14px', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 14, fill: '#374151', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                    style={{ fontSize: '14px', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                  />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      if (name === 'profit') return [`${value.toFixed(2)}€`, 'Profitto']
                      if (name === 'count') return [value, 'Numero Trade']
                      return [value, name]
                    }}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      padding: '8px 12px'
                    }}
                  />
                  <Bar dataKey="profit" fill="#3b82f6" name="profit" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                {stats.dayOfWeekStats.map((day: any) => (
                  <div key={day.name} className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium">{day.name}:</span>
                    <span className={day.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {day.profit >= 0 ? '+' : ''}{day.profit.toFixed(2)}€ ({day.count} trade, WR: {day.winRate}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Week of Month Profitability */}
          {stats.weekOfMonthStats.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow">
              <h2 className="text-xl font-bold mb-4">Profittabilità per Settimana del Mese</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.weekOfMonthStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 14, fill: '#374151', fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 500 }}
                    style={{ fontSize: '14px', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 14, fill: '#374151', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                    style={{ fontSize: '14px', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`${value.toFixed(2)}€`, 'Profitto']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      padding: '8px 12px'
                    }}
                  />
                  <Bar dataKey="profit" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2 text-sm">
                {stats.weekOfMonthStats.map((week: any) => (
                  <div key={week.name} className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium">{week.name}:</span>
                    <span className={week.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {week.profit >= 0 ? '+' : ''}{week.profit.toFixed(2)}€ ({week.count} trade, WR: {week.winRate}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Month Profitability */}
          {stats.monthStats.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow">
              <h2 className="text-xl font-bold mb-4">Profittabilità per Mese</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.monthStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 13, fill: '#374151', fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 500 }}
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    style={{ fontSize: '13px', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 14, fill: '#374151', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                    style={{ fontSize: '14px', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`${value.toFixed(2)}€`, 'Profitto']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      padding: '8px 12px'
                    }}
                  />
                  <Bar dataKey="profit" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          
          {/* Day of Month Profitability */}
          {stats.dayOfMonthStats.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow">
              <h2 className="text-xl font-bold mb-4">Profittabilità per Giorno del Mese</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.dayOfMonthStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 13, fill: '#374151', fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 500 }}
                    style={{ fontSize: '13px', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 14, fill: '#374151', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                    style={{ fontSize: '14px', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`${value.toFixed(2)}€`, 'Profitto']}
                    labelFormatter={(label) => `Giorno ${label}`}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      padding: '8px 12px'
                    }}
                  />
                  <Bar dataKey="profit" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        
        {/* Long/Short Analysis */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow">
            <h2 className="text-xl font-bold mb-4">Analisi Long vs Short</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Trade Long (BUY)</div>
                <div className="text-3xl font-bold text-blue-700">{stats.longShortStats.longCount}</div>
                <div className="text-sm text-gray-600 mt-2">
                  Win Rate: <span className="font-semibold">{stats.longShortStats.longWinRate}%</span>
                </div>
                <div className={`text-sm mt-1 ${stats.longShortStats.longProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Profitto: {stats.longShortStats.longProfit >= 0 ? '+' : ''}{stats.longShortStats.longProfit.toFixed(2)}€
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Trade Short (SELL)</div>
                <div className="text-3xl font-bold text-red-700">{stats.longShortStats.shortCount}</div>
                <div className="text-sm text-gray-600 mt-2">
                  Win Rate: <span className="font-semibold">{stats.longShortStats.shortWinRate}%</span>
                </div>
                <div className={`text-sm mt-1 ${stats.longShortStats.shortProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Profitto: {stats.longShortStats.shortProfit >= 0 ? '+' : ''}{stats.longShortStats.shortProfit.toFixed(2)}€
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { name: 'Long', count: stats.longShortStats.longCount, winRate: parseFloat(stats.longShortStats.longWinRate) },
                { name: 'Short', count: stats.longShortStats.shortCount, winRate: parseFloat(stats.longShortStats.shortWinRate) },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 14, fill: '#374151', fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 500 }}
                  style={{ fontSize: '14px', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                />
                <YAxis 
                  yAxisId="left" 
                  tick={{ fontSize: 13, fill: '#374151', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                  style={{ fontSize: '13px', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  tick={{ fontSize: 13, fill: '#374151', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                  style={{ fontSize: '13px', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    padding: '8px 12px'
                  }}
                />
                <Bar yAxisId="left" dataKey="count" fill="#3b82f6" name="Numero Trade" radius={[8, 8, 0, 0]} />
                <Bar yAxisId="right" dataKey="winRate" fill="#10b981" name="Win Rate %" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Trading Frequency & Holding Time */}
          <div className="bg-white rounded-xl p-6 shadow">
            <h2 className="text-xl font-bold mb-4">Frequenza Trading & Tempo Permanenza</h2>
            <div className="space-y-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Media Trade per Giorno</div>
                <div className="text-3xl font-bold text-purple-700">{stats.avgTradesPerDay}</div>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Media Trade per Settimana</div>
                <div className="text-3xl font-bold text-indigo-700">{stats.avgTradesPerWeek}</div>
              </div>
              {stats.avgHoldingTime !== null ? (
                <div className="bg-cyan-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Tempo Medio Permanenza</div>
                  <div className="text-3xl font-bold text-cyan-700">
                    {parseFloat(stats.avgHoldingTime) < 24 
                      ? `${stats.avgHoldingTime} ore`
                      : `${(parseFloat(stats.avgHoldingTime) / 24).toFixed(1)} giorni`}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Tempo Medio Permanenza</div>
                  <div className="text-lg text-gray-500">Non disponibile (inserisci entry/exit time)</div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Simulator Section */}
        <div className="bg-white rounded-xl p-6 shadow mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calculator className="text-primary-600" size={24} />
              <h2 className="text-xl font-bold">Simulatore Performance</h2>
            </div>
            <button
              onClick={() => setShowSimulator(!showSimulator)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
            >
              <Target size={20} />
              {showSimulator ? 'Nascondi' : 'Mostra'} Simulatore
            </button>
          </div>
          
          {showSimulator && (
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Capitale Iniziale (€)</label>
                  <input
                    type="number"
                    value={simulator.initialCapital}
                    onChange={(e) => setSimulator({ ...simulator, initialCapital: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Rischio per Trade (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={simulator.riskPerTrade}
                    onChange={(e) => setSimulator({ ...simulator, riskPerTrade: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Win Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={simulator.winRate}
                    onChange={(e) => setSimulator({ ...simulator, winRate: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Media Win (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={simulator.avgWin}
                    onChange={(e) => setSimulator({ ...simulator, avgWin: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Media Loss (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={simulator.avgLoss}
                    onChange={(e) => setSimulator({ ...simulator, avgLoss: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Numero Trade</label>
                  <input
                    type="number"
                    value={simulator.numTrades}
                    onChange={(e) => setSimulator({ ...simulator, numTrades: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Risultati Simulazione</h3>
                <div className="space-y-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Capitale Finale</div>
                    <div className="text-2xl font-bold text-blue-700">
                      {simulatePerformance.finalCapital}€
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Profitto Totale</div>
                    <div className={`text-2xl font-bold ${parseFloat(simulatePerformance.totalProfit) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {parseFloat(simulatePerformance.totalProfit) >= 0 ? '+' : ''}
                      {simulatePerformance.totalProfit}€
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Rendimento Totale</div>
                    <div className={`text-2xl font-bold ${parseFloat(simulatePerformance.totalReturn) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {parseFloat(simulatePerformance.totalReturn) >= 0 ? '+' : ''}
                      {simulatePerformance.totalReturn}%
                    </div>
                  </div>
                </div>
                
                {simulatePerformance.simulation.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-md font-semibold mb-3">Andamento Simulato</h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <RechartsLineChart data={simulatePerformance.simulation}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="trade" 
                          tick={{ fontSize: 13, fill: '#374151', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                          style={{ fontSize: '13px', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                        />
                        <YAxis 
                          tick={{ fontSize: 13, fill: '#374151', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                          style={{ fontSize: '13px', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                        />
                        <Tooltip 
                          formatter={(value: any) => [`${value.toFixed(2)}€`, 'Capitale']}
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                            padding: '8px 12px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="capital" 
                          stroke="#8b5cf6" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Analisi Monte Carlo */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Analisi Monte Carlo</h3>
              <button
                onClick={() => setShowMonteCarlo(!showMonteCarlo)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm"
              >
                {showMonteCarlo ? 'Nascondi' : 'Mostra'} Monte Carlo
              </button>
            </div>
            
            {showMonteCarlo && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium">Numero Simulazioni:</label>
                    <input
                      type="number"
                      min="100"
                      max="10000"
                      step="100"
                      value={monteCarloRuns}
                      onChange={(e) => setMonteCarloRuns(parseInt(e.target.value) || 1000)}
                      className="border border-gray-300 rounded-lg px-3 py-1 w-32"
                    />
                    <span className="text-sm text-gray-500">(più simulazioni = maggiore precisione)</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium">Soglia Perdita (%):</label>
                    <input
                      type="number"
                      min="-100"
                      max="0"
                      step="1"
                      value={customLossThreshold}
                      onChange={(e) => setCustomLossThreshold(parseFloat(e.target.value) || -20)}
                      className="border border-gray-300 rounded-lg px-3 py-1 w-32"
                    />
                    <span className="text-sm text-gray-500">(probabilità di perdere più di questo valore)</span>
                  </div>
                </div>
                
                {monteCarloAnalysis && (
                  <>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">Rendimento Medio</div>
                        <div className={`text-2xl font-bold ${parseFloat(monteCarloAnalysis.avgReturn) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {monteCarloAnalysis.avgReturn >= 0 ? '+' : ''}{monteCarloAnalysis.avgReturn}%
                        </div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">Win Rate Medio</div>
                        <div className="text-2xl font-bold text-purple-700">
                          {monteCarloAnalysis.avgWinRate}%
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">Profit Factor Medio</div>
                        <div className="text-2xl font-bold text-green-700">
                          {monteCarloAnalysis.avgProfitFactor}
                        </div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">Risk/Reward Medio</div>
                        <div className="text-2xl font-bold text-orange-700">
                          {monteCarloAnalysis.avgRiskReward}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-indigo-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">Rendimento Mediano</div>
                        <div className={`text-2xl font-bold ${parseFloat(monteCarloAnalysis.medianReturn) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {monteCarloAnalysis.medianReturn >= 0 ? '+' : ''}{monteCarloAnalysis.medianReturn}%
                        </div>
                      </div>
                      <div className="bg-cyan-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">Max Drawdown Medio</div>
                        <div className="text-2xl font-bold text-cyan-700">
                          {monteCarloAnalysis.avgMaxDrawdown}%
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">Probabilità Profitto</div>
                        <div className="text-2xl font-bold text-green-700">
                          {monteCarloAnalysis.profitProbability}%
                        </div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1">Probabilità Perdita &lt;{customLossThreshold}%</div>
                        <div className="text-2xl font-bold text-red-700">
                          {monteCarloAnalysis.customLossProbability}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold mb-3">Percentili di Rendimento</h4>
                      <div className="grid grid-cols-5 gap-2 text-sm">
                        <div>
                          <div className="text-gray-600">5° Percentile</div>
                          <div className={`font-bold ${parseFloat(monteCarloAnalysis.percentile5) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {monteCarloAnalysis.percentile5}%
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">25° Percentile</div>
                          <div className={`font-bold ${parseFloat(monteCarloAnalysis.percentile25) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {monteCarloAnalysis.percentile25}%
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Mediana (50°)</div>
                          <div className={`font-bold ${parseFloat(monteCarloAnalysis.medianReturn) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {monteCarloAnalysis.medianReturn}%
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">75° Percentile</div>
                          <div className={`font-bold ${parseFloat(monteCarloAnalysis.percentile75) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {monteCarloAnalysis.percentile75}%
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">95° Percentile</div>
                          <div className={`font-bold ${parseFloat(monteCarloAnalysis.percentile95) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {monteCarloAnalysis.percentile95}%
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-gray-500">
                        Range: {monteCarloAnalysis.minReturn}% (peggiore) a {monteCarloAnalysis.maxReturn}% (migliore)
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold mb-3">Equity Curves - Simulazioni Monte Carlo</h4>
                      <ResponsiveContainer width="100%" height={400}>
                        <RechartsLineChart data={monteCarloAnalysis.chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="trade" 
                            tick={{ fontSize: 12, fill: '#374151', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                            label={{ value: 'Numero Trade', position: 'insideBottom', offset: -5, style: { fontSize: '13px', fontFamily: 'system-ui, -apple-system, sans-serif' } }}
                          />
                          <YAxis 
                            tick={{ fontSize: 12, fill: '#374151', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                            label={{ value: 'Capitale (€)', angle: -90, position: 'insideLeft', style: { fontSize: '13px', fontFamily: 'system-ui, -apple-system, sans-serif' } }}
                          />
                          <Tooltip 
                            formatter={(value: any) => [`${value.toFixed(2)}€`, 'Capitale']}
                            labelFormatter={(label) => `Trade: ${label}`}
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e5e7eb', 
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontFamily: 'system-ui, -apple-system, sans-serif',
                              padding: '8px 12px'
                            }}
                          />
                          <Legend 
                            wrapperStyle={{ fontSize: '12px', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                          />
                          {/* Mostra tutte le simulazioni campionate (max 50) */}
                          {Array(Math.min(50, monteCarloRuns)).fill(0).map((_, i) => (
                            <Line 
                              key={`sim${i}`}
                              type="monotone" 
                              dataKey={`sim${i}`} 
                              stroke="#e0e7ff" 
                              strokeWidth={0.5}
                              dot={false}
                              hide={true}
                            />
                          ))}
                          {/* Percentili */}
                          <Line 
                            type="monotone" 
                            dataKey="percentile5" 
                            stroke="#ef4444" 
                            strokeWidth={1.5}
                            strokeDasharray="5 5"
                            dot={false}
                            name="5° Percentile"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="percentile25" 
                            stroke="#f59e0b" 
                            strokeWidth={1.5}
                            strokeDasharray="3 3"
                            dot={false}
                            name="25° Percentile"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="median" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            dot={false}
                            name="Mediana (50°)"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="percentile75" 
                            stroke="#10b981" 
                            strokeWidth={1.5}
                            strokeDasharray="3 3"
                            dot={false}
                            name="75° Percentile"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="percentile95" 
                            stroke="#8b5cf6" 
                            strokeWidth={1.5}
                            strokeDasharray="5 5"
                            dot={false}
                            name="95° Percentile"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="avg" 
                            stroke="#1f2937" 
                            strokeWidth={2.5}
                            dot={false}
                            name="Media"
                          />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                      <div className="mt-3 text-xs text-gray-500">
                        Il grafico mostra tutte le {monteCarloRuns} simulazioni Monte Carlo (linee grigie chiare) con i percentili e la media. 
                        Ogni simulazione ha il suo winrate, profit factor e risk/reward calcolati dinamicamente.
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
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
                ['Data', 'Asset', 'Tipo', 'Entry', 'Exit', 'Profit/Loss', 'Status', 'Entry Time', 'Exit Time'],
                ...trades.map(t => [t.date, t.asset, t.type, t.entry, t.exit, t.profit, t.status, t.entryTime || '', t.exitTime || ''])
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Entry Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Exit Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {trade.entryTime || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {trade.exitTime || '-'}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Ora Entry (opzionale)</label>
                  <input
                    type="time"
                    value={newTrade.entryTime || ''}
                    onChange={(e) => setNewTrade({ ...newTrade, entryTime: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ora Exit (opzionale)</label>
                  <input
                    type="time"
                    value={newTrade.exitTime || ''}
                    onChange={(e) => setNewTrade({ ...newTrade, exitTime: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
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

