import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useTasks } from '../stores/useStore';
import type { Task, CategoryId } from '../types';
import { format } from 'date-fns';

const PILARES = [
  { id: 'health' as CategoryId, label: 'Saude', color: '#9EB8A0' },
  { id: 'work' as CategoryId, label: 'Trabalho', color: '#A58E74' },
  { id: 'relation' as CategoryId, label: 'Relacionamentos', color: '#C9A0A0' },
  { id: 'finance' as CategoryId, label: 'Financas', color: '#A0A9C9' },
  { id: 'leisure' as CategoryId, label: 'Lazer', color: '#C9C0A0' },
  { id: 'self' as CategoryId, label: 'Autoconhecimento', color: '#B0A0C9' },
];

export function CreateTask() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addTask } = useTasks();
  const defaultDate = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd');

  const [title, setTitle] = useState('');
  const [why, setWhy] = useState('');
  const [categoryId, setCategoryId] = useState<CategoryId | null>(null);
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!title.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      title: title.trim(),
      why: why.trim() || null,
      categoryId,
      date,
      time: time || null,
      endTime: null,
      status: 'pending',
      isAppointment: false,
      createdAt: new Date().toISOString(),
    };
    addTask(task);
    navigate(-1);
  };

  return (
    <Layout>
      <div style={{ maxWidth: 760, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>Detalhes da Tarefa</h3>
            <div className="form-group">
              <label className="form-label">Titulo *</label>
              <input className="form-input" type="text" placeholder="O que voce precisa fazer?" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Por que isso importa?</label>
              <textarea className="form-textarea" placeholder="Qual e o proposito desta tarefa?" value={why} onChange={e => setWhy(e.target.value)} rows={3} />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>O "porque" torna sua tarefa mais significativa</span>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Notas adicionais</label>
              <textarea className="form-textarea" placeholder="Detalhes, lembretes..." value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
            </div>
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>Pilar TCC</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {PILARES.map(p => (
                <button key={p.id} onClick={() => setCategoryId(p.id)} style={{
                  padding: '10px 12px', borderRadius: 8, border: `2px solid ${categoryId === p.id ? p.color : 'var(--border)'}`,
                  background: categoryId === p.id ? p.color + '18' : 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: categoryId === p.id ? p.color : 'var(--text-secondary)' }}>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>Quando?</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Data</label>
                <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Horario</label>
                <input className="form-input" type="time" value={time} onChange={e => setTime(e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 24, maxWidth: 760 }}>
        <button className="btn btn-secondary btn-lg" style={{ flex: 1 }} onClick={() => navigate(-1)}>Cancelar</button>
        <button className="btn btn-primary btn-lg" style={{ flex: 2 }} onClick={handleSave} disabled={!title.trim()}>Salvar Tarefa</button>
      </div>
    </Layout>
  );
}
