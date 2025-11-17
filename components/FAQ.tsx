'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: "Che cos'è Samurai Platform e a cosa serve?",
      answer:
        'Samurai Platform è una piattaforma completa di backtesting e analisi per trader. Ti permette di testare le tue strategie, tenere un journal automatico dei tuoi trade e analizzare il mercato con strumenti avanzati come DeepView.',
    },
    {
      question:
        'Posso usare Samurai Platform anche se non ho ancora una strategia ben definita?',
      answer:
        'Assolutamente sì! Samurai Platform è perfetto anche per chi sta ancora sviluppando la propria strategia. Il backtester ti permette di testare diverse idee e trovare quella che funziona meglio per te.',
    },
    {
      question: 'Posso fare screenshot delle operazioni durante il backtest?',
      answer:
        'Sì, puoi salvare i disegni e fare screenshot durante le sessioni di backtest. Questa funzionalità è disponibile in tutti i piani.',
    },
    {
      question: 'Posso compilare il Journal manualmente?',
      answer:
        'Sì, puoi inserire i trade manualmente in pochi clic oppure importarli automaticamente dalle piattaforme supportate. Hai il controllo completo su come gestire il tuo journal.',
    },
    {
      question: "Cos'è DeepView e a cosa serve?",
      answer:
        'DeepView è uno strumento di analisi avanzata che ti fornisce overview, sentiment, volatilità, stagionalità e COT report in un solo posto. Ti aiuta ad avere il quadro completo del mercato prima di prendere decisioni di trading.',
    },
  ]

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-center text-gray-600 mb-12">
          Serve ancora una mano? Ci pensiamo noi!
        </p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-gray-50 transition"
              >
                <span className="font-semibold text-gray-900">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`text-gray-500 transition-transform ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                  size={20}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 bg-gray-50 text-gray-700">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

