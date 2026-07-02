import { useNavigate } from 'react-router-dom';
import { Icon } from './Icon';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export function Header({ title, subtitle, showBack, rightAction }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '16px 20px 12px',
      paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
      backgroundColor: 'var(--bg)',
      gap: 12,
      flexShrink: 0,
    }}>
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          style={{
            width: 36, height: 36,
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--foreground)',
            backgroundColor: 'var(--surface)',
            flexShrink: 0,
          }}
        >
          <Icon name="arrow-left" size={18} />
        </button>
      )}
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--foreground)', lineHeight: 1.2 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{subtitle}</p>
        )}
      </div>
      {rightAction && <div style={{ flexShrink: 0 }}>{rightAction}</div>}
    </div>
  );
}
