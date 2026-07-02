import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { Icon } from '../components/Icon';
import { useTasks } from '../stores/useStore';
import { CATEGORIES, type CategoryId } from '../types';
import { format } from 'date-fns';

export function CreateTask() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { addTask } = useTasks();

  const defaultDate = params.get('date') || format(new Date(), 'yyyy-MM-dd');
  const isAppointmentDefault = params.get('type') === 'appointment';

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<CategoryId | null>(null);
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [why, setWhy] = useState('');
  const [isAppointment, setIsAppointment] = useState(isAppointmentDefault);
  const [showWhy, setShowWhy] = useState(false);
  const [error, setError] = useState('');

  function handleSave() {
    if (!title.trim()) { setError('Adicione um titulo para a tarefa.'); return; }
    addTask({
      id: crypto.randomUUID(),
      title: title.trim(),
      categoryId,
      date,
      time: time || null,
      endTime: endTime || null,
      why: why.trim() || null,
      status: 'pending',
      isAppointment,
      createdAt: new Date().toISOString(),
    });
    navigate(-1);
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Header
        title={isAppointment ? 'Novo compromisso' : 'Nova tarefa'}
        showBack
        rightAction={
          <button
            onClick={handleSave}
            style={{
              padding: '8px 18px', borderRadius: 20,
              backgroundColor: 'var(--primary)', color: '#EEEFE9',
              fontSize: 14, fontWeight: 600,
            }}
          >
            Salvar
          </button>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 40px' }}>
        {/* Type toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[false, true].map(isAppt => (
            <button
              key={String(isAppt)}
              onClick={() => setIsAppointment(isAppt)}
              style={{
                flex: 1, padding: '10px', borderRadius: 12, fontSize: 14, fontWeight: 500,
                backgroundColor: isAppointment === isAppt ? 'var(--foreground)' : 'var(--surface)',
                color: isAppointment === isAppt ? 'var(--bg)' : 'var(--muted)',
                border: '1px solid ' + (isAppointment === isAppt ? 'transparent' : 'var(--border)'),
              }}
            >
              {isAppt ? 'Compromisso' : 'Tarefa'}
            </button>
          ))}
        </div>

        {/* Title */}
        <div style={{ marginBottom: 20 }}>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={isAppointment ? 'Ex: Consulta medica' : 'Ex: Ir ao hortifruti'}
            style={{
              width: '100%', padding: '16px', borderRadius: 14,
              border: '1.5px solid var(--border)', backgroundColor: 'var(--surface)',
              fontSize: 17, fontWeight: 500, color: 'var(--foreground)',
            }}
          />
          {error && <p style={{ fontSize: 13, color: 'var(--error)', marginTop: 6 }}>{error}</p>}
        </div>

        {/* Date */}
        <Field label="Data">
          <input
            type="date" value={date} onChange={e => setDate(e.target.value)}
            style={fieldInputStyle}
          />
        </Field>

        {/* Time */}
        {(isAppointment || time) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <Field label="Inicio">
              <input type="time" value={time} onChange={e => setTime(e.target.value)} style={fieldInputStyle} />
            </Field>
            <Field label="Fim (opcional)">
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={fieldInputStyle} />
            </Field>
          </div>
        )}
        {!isAppointment && !time && (
          <button
            onClick={() => setTime('09:00')}
            style={{ fontSize: 13, color: 'var(--primary-dark)', fontWeight: 500, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Icon name="clock" size={14} /> Adicionar horario
          </button>
        )}

        {/* Category */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 10 }}>
            Pilar de vida
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(categoryId === cat.id ? null : cat.id)}
                style={{
                  padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                  backgroundColor: categoryId === cat.id ? cat.color : 'var(--surface)',
                  color: categoryId === cat.id ? '#fff' : 'var(--muted)',
                  border: '1px solid ' + (categoryId === cat.id ? 'transparent' : 'var(--border)'),
                  transition: 'all 0.15s',
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Why */}
        <div style={{ marginBottom: 20 }}>
          {!showWhy ? (
            <button
              onClick={() => setShowWhy(true)}
              style={{
                width: '100%', padding: '14px', borderRadius: 14,
                border: '1.5px dashed var(--border)', backgroundColor: 'transparent',
                fontSize: 14, color: 'var(--muted)', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              <Icon name="heart" size={16} color="var(--primary)" />
              Por que isso importa pra voce agora? (opcional)
            </button>
          ) : (
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 8 }}>
                Por que isso importa pra voce agora?
              </label>
              <textarea
                value={why}
                onChange={e => setWhy(e.target.value.slice(0, 140))}
                placeholder="Escreva livremente..."
                rows={3}
                style={{
                  width: '100%', padding: '14px', borderRadius: 14,
                  border: '1.5px solid var(--border)', backgroundColor: 'var(--surface)',
                  fontSize: 14, color: 'var(--foreground)', resize: 'none', lineHeight: 1.6,
                }}
              />
              <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'right', marginTop: 4 }}>
                {why.length}/140
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: 8 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const fieldInputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: 12,
  border: '1.5px solid var(--border)', backgroundColor: 'var(--surface)',
  fontSize: 14, color: 'var(--foreground)',
};
