import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Icon } from '../components/Icon';
import { useAuth } from '../stores/useStore';

export function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  function requestNotificationPermission() {
    if ('Notification' in window) {
      Notification.requestPermission().then(perm => {
        if (perm === 'granted') {
          new Notification('Rafaella da Mata Planner', {
            body: 'Notificacoes ativadas! Voce recebera lembretes gentis.',
          });
        }
      });
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Header title="Configuracoes" />

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 40px' }}>
        {/* Profile */}
        <Section title="Perfil">
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '16px', borderRadius: 14,
            backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              backgroundColor: 'var(--primary)', color: '#EEEFE9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 700, flexShrink: 0,
            }}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--foreground)' }}>{user?.name || 'Usuario'}</p>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{user?.email || ''}</p>
            </div>
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Notificacoes">
          <SettingItem
            icon="bell"
            title="Ativar notificacoes"
            subtitle="Lembretes gentis de tarefas e check-in"
            onPress={requestNotificationPermission}
          />
          <SettingItem
            icon="clock"
            title="Horario do check-in"
            subtitle="21:00 (padrao)"
            onPress={() => {}}
          />
        </Section>

        {/* Integrations */}
        <Section title="Integracoes">
          <SettingItem
            icon="link"
            title="Google Agenda"
            subtitle="Sincronizar eventos e compromissos"
            onPress={() => {}}
            badge="Em breve"
          />
          <SettingItem
            icon="link"
            title="WhatsApp"
            subtitle="Lembretes e criacao de tarefas"
            onPress={() => {}}
            badge="Em breve"
          />
        </Section>

        {/* Categories */}
        <Section title="Pilares de vida">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { name: 'Corpo & Saude', color: 'var(--cat-health)' },
              { name: 'Trabalho', color: 'var(--cat-work)' },
              { name: 'Relacionamentos', color: 'var(--cat-relation)' },
              { name: 'Financeiro', color: 'var(--cat-finance)' },
              { name: 'Descanso & Lazer', color: 'var(--cat-leisure)' },
              { name: 'Autoconhecimento', color: 'var(--cat-self)' },
            ].map(cat => (
              <div key={cat.name} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 12,
                backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
              }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: cat.color, flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: 'var(--foreground)', fontWeight: 500 }}>{cat.name}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* About */}
        <Section title="Sobre">
          <SettingItem
            icon="info"
            title="Sobre o Planner"
            subtitle="Versao 1.0 — Rafaella da Mata"
            onPress={() => {}}
          />
        </Section>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '16px', borderRadius: 14,
            backgroundColor: 'var(--surface)', color: 'var(--error)',
            fontSize: 15, fontWeight: 600,
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginTop: 8,
          }}
        >
          <Icon name="logout" size={18} color="var(--error)" />
          Sair da conta
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {children}
      </div>
    </div>
  );
}

function SettingItem({ icon, title, subtitle, onPress, badge }: {
  icon: any; title: string; subtitle?: string; onPress: () => void; badge?: string;
}) {
  return (
    <button
      onClick={onPress}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px', borderRadius: 14, width: '100%', textAlign: 'left',
        backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: 'var(--surface2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon name={icon} size={18} color="var(--muted)" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--foreground)' }}>{title}</p>
        {subtitle && <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{subtitle}</p>}
      </div>
      {badge ? (
        <span style={{
          fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 10,
          backgroundColor: 'var(--surface2)', color: 'var(--muted)',
        }}>
          {badge}
        </span>
      ) : (
        <Icon name="chevron-right" size={16} color="var(--border)" />
      )}
    </button>
  );
}
