'use client'

import { Star } from 'lucide-react'

export default function Testimonials() {
  const testimonials = [
    {
      text: 'Piattaforma indispensabile per ogni trader, sia neofita sia avanzato, ti dà una panoramica completa di tutte le statistiche...',
      rating: 5,
    },
    {
      text: 'Piattaforma completa e sopratutto indispensabile per tutti coloro che vogliono testare/sviluppare la propria strategia/metodo di lettura di trading, dal neofita all\'avanzato.',
      rating: 5,
    },
    {
      text: 'Dopo aver testato numerose piattaforme di backtest, posso dire con certezza che questa è la migliore in assoluto...',
      rating: 5,
    },
    {
      text: 'Ho trovato Samurai Platform davvero utile. La piattaforma è semplice da usare e offre molte funzionalità tra cui molti indicatori. L\'interfaccia è chiara e ben organizzata...',
      rating: 5,
    },
    {
      text: 'Finalmente qualcosa di pratico e completo su cui fare backtest in santa pace, con tutti i valori e le statistiche che servono per capire dove andare a migliorare la propria strategia',
      rating: 5,
    },
    {
      text: 'Applicazione bomba! Ottima per chi deve testare la propria strategia di trading !La consiglio a tutti',
      rating: 5,
    },
  ]

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">
          Cosa dicono di noi
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition"
            >
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="text-yellow-400 fill-yellow-400"
                    size={20}
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

