'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import Link from 'next/link'

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(true)

  const plans = [
    {
      name: 'Free Plan',
      price: '€0',
      period: '/Per sempre',
      description: 'Tanto vale provarlo, no? È gratis!',
      features: [
        '1 Sessione di Backtest',
        'Durata Sessione 1 Mese',
        '2 Indicatori Backtest',
        '1 Track Record',
        'Max 20 trades per Track Record',
        'Stagionalità Limitata',
        'COT Report Limitato',
        'Session Comparator',
        'Analytics Complete',
        'Backtest Economic Calendar',
        'Session Sharing',
        'Salvataggio Disegni Backtest',
      ],
      cta: 'Inizia Gratis',
      popular: false,
    },
    {
      name: 'Basic Plan',
      price: '€16,50',
      period: '/Mese',
      description: 'Pagamento annuale',
      savings: 'Risparmia 43,20€ all\'anno!',
      features: [
        '10 Sessioni di Backtest',
        'Durata Sessione 6 Mesi',
        '3 Indicatori Backtest',
        '3 Track Record',
        'Max 100 trades per Track Record',
        'Stagionalità Limitata',
        'COT Report Limitato',
        'Session Comparator',
        'Analytics Complete',
        'Backtest Economic Calendar',
        'Session Sharing',
        'Salvataggio Disegni Backtest',
      ],
      cta: 'Ottieni Ora',
      popular: true,
    },
    {
      name: 'Pro Plan',
      price: '€24,50',
      period: '/Mese',
      description: 'Pagamento annuale',
      savings: 'Risparmia 64,80€ all\'anno!',
      features: [
        'Backtesting illimitato',
        'Durata Sessione illimitata',
        'Indicatori Backtest illimitati',
        'Track Record illimitato',
        'Trades illimitati',
        'Stagionalità Completa',
        'COT Report Completo',
        'Session Comparator',
        'Analytics Complete',
        'Backtest Economic Calendar',
        'Session Sharing',
        'Salvataggio Disegni Backtest',
      ],
      cta: 'Ottieni Ora',
      popular: false,
    },
  ]

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4">
          Migliora il tuo Trading con Samurai Platform
        </h2>
        <p className="text-center text-gray-600 mb-12">
          Ogni piano è pensato per accompagnarti nel tuo percorso
        </p>

        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-lg inline-flex">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2 rounded-md transition ${
                !isYearly
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2 rounded-md transition ${
                isYearly
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl p-8 relative ${
                plan.popular
                  ? 'border-2 border-primary-600 shadow-xl scale-105'
                  : 'border border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    PIÙ POPOLARE
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-2">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-600">{plan.period}</span>
              </div>
              {plan.savings && (
                <p className="text-sm text-green-600 font-semibold mb-4">
                  {plan.savings}
                </p>
              )}
              <p className="text-gray-600 mb-6">{plan.description}</p>
              <div
                className={`block w-full text-center py-3 rounded-lg font-semibold transition mb-6 ${
                  plan.popular
                    ? 'bg-primary-600 text-white'
                    : plan.name === 'Free Plan'
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-primary-600 text-white'
                }`}
              >
                {plan.cta}
              </div>
              <div className="space-y-3">
                <p className="font-semibold mb-3">Include:</p>
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-2">
                    <Check
                      className="text-primary-600 flex-shrink-0 mt-0.5"
                      size={20}
                    />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

