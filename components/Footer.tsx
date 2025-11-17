import Link from 'next/link'
import { Instagram, Youtube, Mail, MessageCircle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">Samurai Platform</h3>
            <p className="text-gray-400">
              Piattaforma di backtest e analisi per trader professionisti.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Sezioni</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/" className="hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/backtest" className="hover:text-white transition">
                  Backtest
                </Link>
              </li>
              <li>
                <Link href="/journal" className="hover:text-white transition">
                  Journal
                </Link>
              </li>
              <li>
                <Link href="/deepview" className="hover:text-white transition">
                  DeepView
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Altro</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/community" className="hover:text-white transition">
                  Community
                </Link>
              </li>
              <li>
                <Link href="/affiliates" className="hover:text-white transition">
                  Affilliati
                </Link>
              </li>
              <li>
                <Link href="/indicators" className="hover:text-white transition">
                  Lista indicatori
                </Link>
              </li>
              <li>
                <Link href="/assets" className="hover:text-white transition">
                  Lista asset
                </Link>
              </li>
              <li>
                <Link href="/university" className="hover:text-white transition">
                  University
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Informative</h4>
            <ul className="space-y-2 text-gray-400 mb-6">
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Termini e condizioni
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  Privacy & Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition">
                  Blog
                </Link>
              </li>
            </ul>
            <h4 className="font-semibold mb-4">Social</h4>
            <div className="flex space-x-4">
              <a
                href="https://discord.gg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition"
                title="Discord"
              >
                <MessageCircle size={24} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition"
                title="Instagram"
              >
                <Instagram size={24} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition"
                title="YouTube"
              >
                <Youtube size={24} />
              </a>
              <a
                href="mailto:support@samuraiplatform.ai"
                className="text-gray-400 hover:text-white transition"
                title="Email"
              >
                <Mail size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>© 2025 Samurai Platform. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}

