import { Link } from '@tanstack/react-router'
import { NAV_LINKS } from '@/lib/categories'
import { AuthWidget } from './AuthWidget'

export function SiteHeader() {
  return (
    <header className="mb-8 paint-panel p-4 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-4 z-50 shadow-[5px_5px_0px_#1A1A1A]">
      <Link to="/" className="font-display text-3xl sm:text-4xl text-brick hover:scale-105 transition-transform flex items-center gap-2">
        <span>Office</span><span className="text-mustard">Wala</span>
      </Link>
      
      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
        <nav className="flex gap-2 sm:gap-4 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-bold uppercase tracking-wider px-3 py-1.5 rounded border-2 border-transparent hover:border-ink hover:bg-stone-100 transition-colors whitespace-nowrap [&.active]:border-ink [&.active]:bg-mustard [&.active]:shadow-[2px_2px_0px_#1A1A1A]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        
        <AuthWidget />
      </div>
    </header>
  )
}
