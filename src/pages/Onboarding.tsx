import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SLIDES = [
  {
    emoji: '🌱',
    title: 'Cada tarefa tem um porque',
    body: 'Aqui voce nao so registra o que fazer, mas tambem o motivo por tras de cada compromisso. Isso e o que transforma uma lista em autoconhecimento.',
  },
  {
    emoji: '🧠',
    title: 'Padroes que revelam voce',
    body: 'Com o tempo, o app mostra seus padroes de humor, produtividade e bem-estar — sem jargao clinico, sem cobranca. So voce, se conhecendo melhor.',
  },
  {
    emoji: '🤍',
    title: 'Sem pressao, sem culpa',
    body: 'Tarefa nao feita? Ela esta "ainda por vir". Nao ha atraso, nao ha falha. Ha apenas o proximo momento para recomecar.',
  },
];

export function Onboarding() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  function next() {
    if (current < SLIDES.length - 1) setCurrent(c => c + 1);
    else navigate('/home');
  }

  const slide = SLIDES[current];

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      padding: '48px 32px',
      paddingTop: 'calc(env(safe-area-inset-top, 0px) + 48px)',
      paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 48px)',
    }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 48 }}>
        {SLIDES.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            backgroundColor: i <= current ? 'var(--primary)' : 'var(--border)',
            transition: 'background-color 0.3s',
          }} />
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 24 }}>
        <div style={{
          width: 80, height: 80, borderRadius: 20,
          backgroundColor: 'var(--surface2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 40,
        }}>
          {slide.emoji}
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--foreground)', lineHeight: 1.3 }}>
          {slide.title}
        </h2>
        <p style={{ fontSize: 16, color: 'var(--muted)', lineHeight: 1.7 }}>
          {slide.body}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button
          onClick={next}
          style={{
            padding: '16px', borderRadius: 14,
            backgroundColor: 'var(--primary)', color: '#EEEFE9',
            fontSize: 16, fontWeight: 600,
          }}
        >
          {current < SLIDES.length - 1 ? 'Continuar' : 'Comecar'}
        </button>
        {current < SLIDES.length - 1 && (
          <button
            onClick={() => navigate('/home')}
            style={{ padding: '12px', fontSize: 14, color: 'var(--muted)' }}
          >
            Pular
          </button>
        )}
      </div>
    </div>
  );
}
