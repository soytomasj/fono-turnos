import { NavLink } from 'react-router-dom'
import { IconCalendar, IconReceipt, IconUsers } from './icons.jsx'

const TABS = [
  { to: '/', label: 'Agenda', icon: IconCalendar, end: true },
  { to: '/pacientes', label: 'Pacientes', icon: IconUsers },
  { to: '/resumen', label: 'Resumen', icon: IconReceipt },
]

export default function Layout({ children }) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-linen/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <NavLink to="/" className="font-display text-[19px] leading-none text-ink">
            fono<span className="text-clay">·</span>turnos
          </NavLink>
          <nav className="hidden gap-1 md:flex">
            {TABS.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.end}
                className={({ isActive }) =>
                  `rounded-full px-4 py-1.5 text-sm font-bold transition ${
                    isActive ? 'bg-teal text-paper shadow-soft' : 'text-muted hover:text-ink'
                  }`
                }
              >
                {t.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-32 pt-6 md:pb-16">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 backdrop-blur-md md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto grid max-w-md grid-cols-3">
          {TABS.map((t) => (
            <NavLink key={t.to} to={t.to} end={t.end} className="flex flex-col items-center gap-0.5 pb-2 pt-2.5">
              {({ isActive }) => (
                <>
                  <t.icon size={22} className={isActive ? 'text-teal' : 'text-muted'} />
                  <span className={`text-[11px] font-bold ${isActive ? 'text-teal-deep' : 'text-muted'}`}>
                    {t.label}
                  </span>
                  <span className={`h-1 w-1 rounded-full ${isActive ? 'bg-clay' : 'bg-transparent'}`} />
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
