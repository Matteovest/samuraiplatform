import Link from 'next/link'
import { ArrowRight, Gift, Headphones, MessageSquare, Users, GraduationCap } from 'lucide-react'

export default function CTA() {
  const benefits = [
    {
      icon: Gift,
      title: 'Prova gratuita',
      description: 'Prova gratuita senza limiti di tempo e senza necessità della carta di credito, che stai aspettando?',
    },
    {
      icon: Headphones,
      title: 'Supporto sempre disponibile',
      description: 'Supporto sempre disponibile, via social come instagram e discord e via mail all\'indirizzo support@samuraiplatform.ai',
    },
    {
      icon: MessageSquare,
      title: 'Fatti sentire',
      description: 'Vorresti una nuova funzionalità? un nuovo indicatore? Proponilo nel server discord, se sarà possibile lo svilupperemo',
    },
    {
      icon: Users,
      title: 'Community di trader',
      description: 'Community con oltre 1000 membri con cui dialogare, scambiare pareri e condividere opinioni o meglio ancora le sessioni e track record di Samurai Platform',
    },
    {
      icon: GraduationCap,
      title: 'Portale di formazione',
      description: 'Formazione gratuita con contenuti pratici. Zero teoria inutile, solo quello che ti serve.',
    },
  ]

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Organizza il tuo trading come un professionista
          </h2>
          <p className="text-xl text-gray-600 mb-4">
            Non è un altro abbonamento.
          </p>
          <p className="text-xl text-gray-600">
            È l'unico strumento di cui hai bisogno.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-6 border border-primary-100">
            <h3 className="font-semibold text-lg mb-2">Tutto in un unico posto</h3>
            <p className="text-sm text-gray-600">
              Backtest, Journal e analisi in una sola piattaforma
            </p>
          </div>
          <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-6 border border-primary-100">
            <h3 className="font-semibold text-lg mb-2">Interfaccia intuitiva</h3>
            <p className="text-sm text-gray-600">
              Facile da usare, potente nelle funzionalità
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition"
              >
                <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="text-primary-600" size={24} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

