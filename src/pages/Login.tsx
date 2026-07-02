import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../stores/useStore';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState<'welcome' | 'login' | 'signup'>('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError('Preencha todos os campos.'); return; }
    const stored = localStorage.getItem('planner_account_' + email);
    if (!stored) { setError('Conta nao encontrada. Crie uma conta.'); return; }
    const acc = JSON.parse(stored);
    if (acc.password !== password) { setError('Senha incorreta.'); return; }
    login({ id: acc.id, name: acc.name, email });
    navigate('/home', { replace: true });
  }

  function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) { setError('Preencha todos os campos.'); return; }
    if (password.length < 6) { setError('Senha deve ter ao menos 6 caracteres.'); return; }
    const id = crypto.randomUUID();
    localStorage.setItem('planner_account_' + email, JSON.stringify({ id, name, email, password }));
    login({ id, name, email }, true);
    navigate('/onboarding', { replace: true });
  }

  if (mode === 'welcome') {
    return (
      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'space-between',
        padding: '60px 32px 48px',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 60px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 48px)',
      }}>
        <div />
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20,
            backgroundColor: 'var(--primary)', margin: '0 auto 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 36 }}>🌿</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--foreground)', marginBottom: 8 }}>
            Rafaella da Mata
          </h1>
          <p style={{ fontSize: 13, fontWeight: 500, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 20 }}>
            Planner
          </p>
          <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.6, maxWidth: 260, margin: '0 auto' }}>
            Organize sua vida com proposito.<br />Cada tarefa tem um porque.
          </p>
        </div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={() => setMode('login')}
            style={{
              width: '100%', padding: '16px', borderRadius: 14,
              backgroundColor: 'var(--primary)', color: '#EEEFE9',
              fontSize: 16, fontWeight: 600,
            }}
          >
            Entrar
          </button>
          <button
            onClick={() => setMode('signup')}
            style={{
              width: '100%', padding: '16px', borderRadius: 14,
              backgroundColor: 'transparent', color: 'var(--foreground)',
              fontSize: 16, fontWeight: 500,
              border: '1.5px solid var(--border)',
            }}
          >
            Criar conta
          </button>
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            Ao continuar, voce concorda com os Termos de Uso<br />e Politica de Privacidade.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      padding: '24px 24px 48px',
      paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)',
      paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 48px)',
      overflowY: 'auto',
    }}>
      <button
        onClick={() => { setMode('welcome'); setError(''); }}
        style={{ alignSelf: 'flex-start', color: 'var(--muted)', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}
      >
        ← Voltar
      </button>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
        {mode === 'login' ? 'Bem-vinda de volta' : 'Criar sua conta'}
      </h2>
      <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 32 }}>
        {mode === 'login' ? 'Entre para continuar seu planejamento.' : 'Comece a organizar sua vida com proposito.'}
      </p>

      <form onSubmit={mode === 'login' ? handleLogin : handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {mode === 'signup' && (
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Nome</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Seu nome"
              style={inputStyle}
            />
          </div>
        )}
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>E-mail</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="seu@email.com"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Senha</label>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder={mode === 'signup' ? 'Minimo 6 caracteres' : '••••••••'}
            style={inputStyle}
          />
        </div>
        {error && (
          <p style={{ fontSize: 13, color: 'var(--error)', backgroundColor: '#FDF0EE', padding: '10px 14px', borderRadius: 10 }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          style={{
            marginTop: 8, padding: '16px', borderRadius: 14,
            backgroundColor: 'var(--primary)', color: '#EEEFE9',
            fontSize: 16, fontWeight: 600,
          }}
        >
          {mode === 'login' ? 'Entrar' : 'Criar conta'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--muted)' }}>
        {mode === 'login' ? 'Nao tem conta? ' : 'Ja tem conta? '}
        <button
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
          style={{ color: 'var(--primary-dark)', fontWeight: 600, fontSize: 14 }}
        >
          {mode === 'login' ? 'Criar conta' : 'Entrar'}
        </button>
      </p>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '14px 16px', borderRadius: 12,
  border: '1.5px solid var(--border)', backgroundColor: 'var(--surface)',
  fontSize: 15, color: 'var(--foreground)',
};
