'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'
import { LayoutDashboard, TrendingUp, Brain, BookOpen, ShieldCheck, LogOut, BarChart2, NotebookPen, Sun, Moon, Activity, CreditCard } from 'lucide-react'
import { useTheme } from '@/components/ui/ThemeProvider'

const NAV = [
  { href: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/analytics',  icon: BarChart2,        label: 'Analytics' },
  { href: '/checkin',    icon: Activity,         label: 'Daily Check-In' },
  { href: '/trades',     icon: TrendingUp,       label: 'Trades' },
  { href: '/insights',   icon: Brain,            label: 'Insights' },
  { href: '/journal',    icon: BookOpen,         label: 'Journal' },
  { href: '/notebook',   icon: NotebookPen,      label: 'Notebook' },
  { href: '/rules',      icon: ShieldCheck,      label: 'Rules' },
  { href: '/pricing',    icon: CreditCard,       label: 'Upgrade' },
]

export default function Sidebar({ profile }: { profile: Profile | null }) {
  const path = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { theme, toggle } = useTheme()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0, width: '240px',
      background: 'var(--bg-el)', borderRight: '1px solid var(--bdr)',
      display: 'flex', flexDirection: 'column', padding: '24px 0', zIndex: 50,
      transition: 'background 0.25s ease, border-color 0.25s ease',
    }}>
      {/* Logo + theme toggle */}
      <div style={{ padding: '0 20px 28px', borderBottom: '1px solid var(--bdr)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 400, color: 'var(--chalk)' }}>
          DIS<span style={{ color: 'var(--gold)' }}>A</span>pline
        </span>
        <button
          onClick={toggle}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            background: 'none', border: '1px solid var(--bdr)', borderRadius: '6px',
            width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s', flexShrink: 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(201,162,39,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          {theme === 'dark'
            ? <Sun size={13} color="var(--smoke)" />
            : <Moon size={13} color="var(--smoke)" />}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = path === href || path.startsWith(href + '/')
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', borderRadius: '7px', textDecoration: 'none',
              background: active ? 'rgba(201,162,39,0.1)' : 'transparent',
              border: active ? '1px solid rgba(201,162,39,0.18)' : '1px solid transparent',
              transition: 'background 0.2s, border-color 0.2s',
            }}>
              <Icon size={15} color={active ? 'var(--gold)' : 'var(--smoke)'} />
              <span style={{
                fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 300,
                letterSpacing: '0.06em', color: active ? 'var(--chalk)' : 'var(--smoke)',
              }}>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User + sign out */}
      <div style={{ padding: '20px 12px 0', borderTop: '1px solid var(--bdr)' }}>
        {profile && (
          <div style={{ padding: '8px 12px', marginBottom: '8px' }}>
            <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 300, color: 'var(--chalk)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile.full_name || 'Trader'}
            </div>
            <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: '9.5px', fontWeight: 300, color: 'var(--smoke)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile.email}
            </div>
          </div>
        )}
        <button onClick={signOut} style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '9px 12px', borderRadius: '7px', width: '100%',
          background: 'transparent', border: '1px solid transparent',
          cursor: 'pointer', transition: 'background 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(201,162,39,0.08)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <LogOut size={15} color="var(--smoke)" />
          <span style={{ fontFamily: "'Martian Mono', monospace", fontSize: '10.5px', fontWeight: 300, color: 'var(--smoke)', letterSpacing: '0.06em' }}>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
