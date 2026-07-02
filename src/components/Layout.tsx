import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from './Icon';

const TABS = [
  { path: '/home', icon: 'calendar' as const, label: 'Calendario' },
  { path: '/today', icon: 'list' as const, label: 'Hoje' },
  { path: '/insights', icon: 'chart' as const, label: 'Insights' },
  { path: '/settings', icon: 'settings' as const, label: 'Config' },
];

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {children}
      </div>
      <nav style={{
        display: 'flex',
        borderTop: '1px solid var(--border)',
        backgroundColor: 'var(--bg)',
        paddingBottom: 'env(safe-area-inset-bottom, 8px)',
        flexShrink: 0,
      }}>
        {TABS.map(tab => {
          const active = location.pathname === tab.path || location.pathname.startsWith(tab.path + '/');
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                padding: '10px 4px 8px',
                color: active ? 'var(--primary-dark)' : 'var(--muted)',
                transition: 'color 0.15s',
              }}
            >
              <Icon name={tab.icon} size={22} strokeWidth={active ? 2 : 1.5} />
              <span style={{
                fontSize: 10,
                fontWeight: active ? 600 : 400,
                letterSpacing: 0.2,
              }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
