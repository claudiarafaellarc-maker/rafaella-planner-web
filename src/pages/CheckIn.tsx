import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { useCheckIns } from '../stores/useStore';
import { format } from 'date-fns';

const MOODS = [
  { value: 1 as const, label: 'Pesado', face: '😔', color: '#C97A6E' },
  { value: 2 as const, label: 'Cansado', face: '😕', color: '#C9A96E' },
  { value: 3 as const, label: 'Neutro', face: '😐', color: '#BBA58E' },
  { value: 4 as const, label: 'Bem', face: '🙂', color: '#9EB8A0' },
  { value: 5 as const, label: 'Otimo', face: '😊', color: '#7A9E7E' },
];

export function CheckIn() {
  const navigate = useNavigate();
  const { upsertCheckIn, getByDate } = useCheckIns();
  const today = format(new Date(), 'yyyy-MM-dd');
  const existing = getByDate(today);

  const [mood, setMood] = useState<1|2|3|4|5>(existing?.mood || 3);
  const [reflection, setReflection] = useState(existing?.reflection || '');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    upsertCheckIn({
      id: existing?.id || crypto.randomUUID(),
      date: today,
      mood,
      reflection: reflection.trim() || null,
    });
    setSaved(true);
    setTimeout(() => navigate(-1), 1800);
  }

  const selectedMood = MOODS.find(m => m.value === mood)!;

  if (saved) {
    return (
      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 32,
        backgroundColor: 'var(--bg)',
      }}>
        <div style={{ fontSize: 60, marginBottom: 20 }}>{selectedMood.face}</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>
          Registrado com carinho.
        </h2>
        <p style={{ fontSize: 15, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.6 }}>
          Cada dia registrado e um passo de autoconhecimento.
        </p>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Header title="Como foi seu dia?" subtitle="Reserva 1 minuto para registrar." showBack />

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px 40px' }}>
        {/* Mood selector */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Como voce se sentiu hoje?
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            {MOODS.map(m => (
              <button
                key={m.value}
                onClick={() => setMood(m.value)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '14px 4px', borderRadius: 14, gap: 6,
                  backgroundColor: mood === m.value ? m.color + '22' : 'var(--surface)',
                  border: '2px solid ' + (mood === m.value ? m.color : 'transparent'),
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 26 }}>{m.face}</span>
                <span style={{ fontSize: 10, fontWeight: 500, color: mood === m.value ? m.color : 'var(--muted)' }}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Mood indicator */}
        <div style={{
          padding: '16px', borderRadius: 14, marginBottom: 28,
          backgroundColor: selectedMood.color + '15',
          border: '1px solid ' + selectedMood.color + '40',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 15, color: selectedMood.color, fontWeight: 500 }}>
            {mood === 1 && 'Tudo bem. Dias pesados tambem fazem parte.'}
            {mood === 2 && 'Descanso tambem e produtividade.'}
            {mood === 3 && 'Um dia comum e um dia vivido.'}
            {mood === 4 && 'Que bom! Voce esta bem.'}
            {mood === 5 && 'Que dia lindo! Guarda esse sentimento.'}
          </p>
        </div>

        {/* Reflection */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            O que voce quer lembrar de hoje? (opcional)
          </p>
          <textarea
            value={reflection}
            onChange={e => setReflection(e.target.value)}
            placeholder="Escreva livremente..."
            rows={4}
            style={{
              width: '100%', padding: '14px', borderRadius: 14,
              border: '1.5px solid var(--border)', backgroundColor: 'var(--surface)',
              fontSize: 15, color: 'var(--foreground)', resize: 'none', lineHeight: 1.7,
            }}
          />
        </div>

        <button
          onClick={handleSave}
          style={{
            width: '100%', padding: '16px', borderRadius: 14,
            backgroundColor: 'var(--primary)', color: '#EEEFE9',
            fontSize: 16, fontWeight: 600,
          }}
        >
          Registrar
        </button>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: 16, lineHeight: 1.5 }}>
          Nao e obrigatorio. Nao ha cobranca.<br />So voce e seu dia.
        </p>
      </div>
    </div>
  );
}
