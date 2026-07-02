import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../stores/useStore';
import type { User } from '../types';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isSignup) {
      if (!name.trim()) { setError('Informe seu nome'); setLoading(false); return; }
      if (!email.trim()) { setError('Informe seu e-mail'); setLoading(false); return; }
      if (password.length < 4) { setError('Senha deve ter pelo menos 4 caracteres'); setLoading(false); return; }
      const user: User = { id: Date.now().toString(), name: name.trim(), email: email.trim() };
      login(user, true);
      navigate('/onboarding');
    } else {
      // Simple local auth: check localStorage
      const stored = localStorage.getItem('planner_user');
      if (!stored) { setError('Conta nao encontrada. Crie uma conta primeiro.'); setLoading(false); return; }
      const storedUser: User = JSON.parse(stored);
      if (storedUser.email !== email.trim()) { setError('E-mail incorreto'); setLoading(false); return; }
      login(storedUser, false);
      navigate('/home');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-name">Rafaella da Mata</div>
          <div className="login-brand-tagline">Planner</div>
        </div>
        <div className="login-hero">
          <h1 className="login-hero-title">
            Cada tarefa tem<br />um <em>porque.</em>
          </h1>
          <p className="login-hero-text">
            Uma ferramenta de planejamento pessoal baseada na Terapia Cognitivo-Comportamental. Organize sua vida com intencao e autoconhecimento.
          </p>
        </div>
        <div className="login-quote">
          <p className="login-quote-text">
            "Quando voce entende o porque das suas acoes, cada passo se torna mais significativo."
          </p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-container">
          <h2 className="login-form-title">{isSignup ? 'Criar conta' : 'Bem-vinda de volta'}</h2>
          <p className="login-form-sub">{isSignup ? 'Comece sua jornada de autoconhecimento' : 'Continue de onde parou'}</p>

          <form onSubmit={handleSubmit}>
            {isSignup && (
              <div className="form-group">
                <label className="form-label">Seu nome</label>
                <input className="form-input" type="text" placeholder="Como posso te chamar?" value={name} onChange={e => setName(e.target.value)} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input className="form-input" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Senha</label>
              <input className="form-input" type="password" placeholder={isSignup ? 'Crie uma senha segura' : 'Sua senha'} value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && (
              <div style={{ padding: '10px 14px', background: '#FDECEA', border: '1px solid #F5C6C2', borderRadius: 8, marginBottom: 16, fontSize: '0.85rem', color: '#C0392B' }}>
                {error}
              </div>
            )}
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 4 }} disabled={loading}>
              {loading ? 'Aguarde...' : isSignup ? 'Criar minha conta' : 'Entrar'}
            </button>
          </form>

          <div className="login-divider">
            <div className="login-divider-line" />
            <span className="login-divider-text">ou</span>
            <div className="login-divider-line" />
          </div>

          <div className="login-toggle">
            {isSignup ? 'Ja tem uma conta?' : 'Ainda nao tem conta?'}{' '}
            <button onClick={() => { setIsSignup(!isSignup); setError(''); }}>
              {isSignup ? 'Fazer login' : 'Criar conta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
