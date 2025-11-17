'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-primary-50 to-white py-20 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Più di una Piattaforma di Backtest.
          <br />
          <span className="text-primary-600">È dove nasce il tuo edge.</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Smetti di sperare. Inizia a testare.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/backtest"
            className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition flex items-center justify-center gap-2"
          >
            Inizia subito
            <ArrowRight size={20} />
          </Link>
          <Link
            href="/features"
            className="bg-white text-primary-600 border-2 border-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-50 transition"
          >
            Scopri di più
          </Link>
        </div>

        {/* Community Logos */}
        <div className="mt-16">
          <p className="text-sm text-gray-500 mb-6">
            Scelto dalle migliori community di trading
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
              <div
                key={i}
                className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs"
              >
                Logo {i}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

