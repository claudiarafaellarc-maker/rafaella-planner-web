import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../stores/useStore';
import type { User } from '../types';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignup) {
        if (!name.trim()) { setError('Informe seu nome.'); setLoading(false); return; }
        if (!email.trim() || !password) { setError('Preencha todos os campos.'); setLoading(false); return; }
        const user: User = { id: crypto.randomUUID(), name: name.trim(), email: email.trim() };
        login(user, true);
        navigate('/onboarding');
      } else {
        const saved = localStorage.getItem('planner_user');
        if (!saved) { setError('Conta nao encontrada. Crie uma conta.'); setLoading(false); return; }
        const savedUser: User = JSON.parse(saved);
        if (savedUser.email !== email.trim()) { setError('E-mail ou senha incorretos.'); setLoading(false); return; }
        login(savedUser, false);
        navigate('/home');
      }
    } catch {
      setError('Erro ao entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-left">
        <div className="login-left-brand">
          Rafaella da Mata
          <span>Planner</span>
        </div>
        <div className="login-hero">
          <div className="login-hero-title">
            Cada tarefa tem<br />um proposito.
          </div>
          <div className="login-hero-sub">
            Organize sua vida com intencao. Conecte cada acao ao seu por que e transforme habitos em resultados reais.
          </div>
        </div>
        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em' }}>
          RAFAELLA DA MATA &copy; 2026
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-wrap">
          <div className="login-form-title">{isSignup ? 'Criar conta' : 'Entrar'}</div>
          <div className="login-form-sub">
            {isSignup ? 'Comece sua jornada de autoconhecimento.' : 'Bem-vinda de volta.'}
          </div>

          <form onSubmit={handleSubmit}>
            {isSignup && (
              <div className="form-group">
                <label className="form-label">Nome</label>
                <input className="form-input" type="text" placeholder="Seu nome completo"
                  value={name} onChange={e => setName(e.target.value)} required />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input className="form-input" type="email" placeholder="seu@email.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Senha</label>
              <input className="form-input" type="password" placeholder="Sua senha"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && (
              <div style={{ fontSize: '0.82rem', color: '#A83A2A', marginBottom: 14, padding: '10px 12px', background: '#FDF0EE', borderRadius: 5, border: '1px solid #F5C6BE' }}>
                {error}
              </div>
            )}
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {loading ? 'Aguarde...' : isSignup ? 'Criar conta' : 'Entrar'}
            </button>
          </form>

          <div className="login-toggle">
            {isSignup ? 'Ja tem conta? ' : 'Nao tem conta? '}
            <a onClick={() => { setIsSignup(!isSignup); setError(''); }}>
              {isSignup ? 'Entrar' : 'Criar conta'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
