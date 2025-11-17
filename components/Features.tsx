'use client'

import { BarChart3, BookOpen, TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function Features() {
  const features = [
    {
      icon: BarChart3,
      title: '#1 Backtester',
      description:
        'Qui puoi mettere alla prova le tue idee, piazzare ordini, spostare stop e target... tutto come faresti davvero, ma senza rischiare un centesimo. È il tuo campo di allenamento.',
      stats: [
        { label: 'Indicatori', value: '110+' },
        { label: 'Asset List', value: '45+' },
      ],
    },
    {
      icon: BookOpen,
      title: 'Journal automatico',
      description:
        'Importa i tuoi trade in automatico o inseriscili manualmente in pochi clic. Analizza la tua operatività con statistiche dettagliate, panoramiche complete e la possibilità di rivedere ogni trade direttamente sul grafico di TradingView.',
      stats: [
        { label: 'Piattaforme disponibili', value: '10' },
        { label: 'Analytics charts', value: '25+' },
      ],
    },
    {
      icon: TrendingUp,
      title: 'Deepview',
      description:
        'Quando il grafico non basta, puoi usare DeepView: overview, sentiment, volatilità, stagionalità e COT report in un solo posto. Così hai il quadro completo prima di cliccare Buy o Sell.',
      stats: [
        { label: 'Asset List', value: '55+' },
        { label: 'Macro Tools', value: '15+' },
      ],
    },
  ]

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4">
          Scopri le funzionalità
          <br />
          di Samurai Platform
        </h2>

        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition"
              >
                <div className="bg-primary-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                  <Icon className="text-primary-600" size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <div className="flex gap-6 mb-6">
                  {feature.stats.map((stat, statIndex) => (
                    <div key={statIndex}>
                      <div className="text-2xl font-bold text-primary-600">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <Link
                  href={
                    feature.title === '#1 Backtester'
                      ? '/backtest'
                      : feature.title === 'Journal automatico'
                      ? '/journal'
                      : '/deepview'
                  }
                  className="text-primary-600 font-semibold flex items-center gap-2 hover:gap-4 transition"
                >
                  Scopri di più
                  <ArrowRight size={16} />
                </Link>
              </div>
            )
          })}
        </div>

        <div className="mt-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-12 text-white text-center">
          <h3 className="text-3xl font-bold mb-4">
            Tutto ciò di cui hai bisogno
          </h3>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Se ti senti bloccato nel tuo percorso da trader, Samurai Platform ti aiuta
            a fare ordine, capire dove stai sbagliando e migliorare ogni aspetto
            della tua operatività. Tutto in un unico posto, con strumenti
            pensati per farti risparmiare tempo ed evitare i soliti errori.
          </p>
          <div className="flex gap-8 justify-center mb-8">
            <div>
              <div className="text-3xl font-bold">1K+</div>
              <div className="text-primary-100">Trader attivi</div>
            </div>
            <div>
              <div className="text-3xl font-bold">5/5</div>
              <div className="text-primary-100">Trustpilot</div>
            </div>
          </div>
          <Link
            href="/backtest"
            className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Inizia subito
          </Link>
        </div>
      </div>
    </section>
  )
}

