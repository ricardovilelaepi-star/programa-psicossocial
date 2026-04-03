'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { href: '/dashboard', label: 'Painel', icon: '📊' },
  { href: '/dashboard/setores', label: 'Setores', icon: '🏢' },
  { href: '/dashboard/questionarios', label: 'Questionários', icon: '📋' },
  { href: '/dashboard/resultados', label: 'Resultados', icon: '📈' },
  { href: '/dashboard/pgr', label: 'PGR', icon: '📄' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside style={{
      width: '240px',
      minHeight: '100vh',
      backgroundColor: '#1e293b',
      color: '#fff',
      padding: '20px 0',
      position: 'fixed',
      left: 0,
      top: 0,
    }}>
      <div style={{ padding: '0 20px', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
          🧠 PsicoGestão
        </h2>
        <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>
          Riscos Psicossociais - NR-1
        </p>
      </div>
      <nav>
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 20px',
                color: isActive ? '#fff' : '#cbd5e1',
                backgroundColor: isActive ? '#334155' : 'transparent',
                textDecoration: 'none',
                fontSize: '14px',
                borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
