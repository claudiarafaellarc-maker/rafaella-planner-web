import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useTasks } from '../stores/useStore';
import type { Task } from '../types';
import { format, addDays, subDays, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PILARES = [
  { id: 'all', label: 'Todos', color: 'var(--color-brown-dark)' },
  { id: 'health', label: 'Saude', color: '#9EB8A0' },
  { id: 'work', label: 'Trabalho', color: '#A58E74' },
  { id: 'relation', label: 'Relacionamentos', color: '#C9A0A0' },
  { id: 'finance', label: 'Financas', color: '#A0A9C9' },
  { id: 'leisure', label: 'Lazer', color: '#C9C0A0' },
  { id: 'self', label: 'Autoconhecimento', color: '#B0A0C9' },
];

const ChevronLeft = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevronRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const CheckIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

export default function Today() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { tasks, updateTask } = useTasks();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState(searchParams.get('pilar') || 'all');

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayTasks = useMemo(() => {
    let t = tasks.filter((t: Task) => t.date === dateStr);
    if (activeFilter !== 'all') t = t.filter((t: Task) => t.categoryId === activeFilter);
    return t.sort((a: Task, b: Task) => (a.time || '').localeCompare(b.time || ''));
  }, [tasks, dateStr, activeFilter]);

  const pending = dayTasks.filter((t: Task) => t.status !== 'done');
  const completed = dayTasks.filter((t: Task) => t.status === 'done');
  const progress = dayTasks.length > 0 ? Math.round((completed.length / dayTasks.length) * 100) : 0;

  const toggleTask = (task: Task) => {
    updateTask(task.id, { status: task.status === 'done' ? 'pending' : 'done' });
  };

  return (
    <Layout
      title={isToday(selectedDate) ? 'Agenda de Hoje' : format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
      subtitle={format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-secondary btn-sm" style={{ padding: '8px 12px' }} onClick={() => setSelectedDate(d => subDays(d, 1))}><ChevronLeft /></button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
              {isToday(selectedDate) ? 'Hoje' : format(selectedDate, "d MMM", { locale: ptBR })}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dayTasks.length} tarefa{dayTasks.length !== 1 ? 's' : ''}</div>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ padding: '8px 12px' }} onClick={() => setSelectedDate(d => addDays(d, 1))}><ChevronRight /></button>
        </div>
        <div className="card card-sm">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Progresso</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{progress}%</span>
          </div>
          <div style={{ height: 6, background: 'var(--color-brown-cream)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--color-brown-dark)', borderRadius: 3, transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>{completed.length} de {dayTasks.length} concluidas</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {PILARES.map(p => (
          <button key={p.id} className={`pilar-chip${activeFilter === p.id ? ' selected' : ''}`} onClick={() => setActiveFilter(p.id)}>
            {p.id !== 'all' && <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />}
            {p.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Pendentes <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: 6 }}>{pending.length}</span>
            </h2>
            <button className="btn btn-primary btn-sm" onClick={() => navigate(`/task/create?date=${dateStr}`)}>+ Nova</button>
          </div>
          {pending.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div className="empty-state-icon">✅</div>
              <div className="empty-state-title">Tudo concluido!</div>
              <div className="empty-state-text">Nenhuma tarefa pendente para este dia</div>
            </div>
          ) : (
            pending.map((task: Task) => {
              const pilar = PILARES.find(p => p.id === task.categoryId);
              return (
                <div key={task.id} className="task-item" onClick={() => navigate(`/task/${task.id}`)}>
                  <div className="task-checkbox" onClick={e => { e.stopPropagation(); toggleTask(task); }} style={{ borderColor: pilar?.color }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="task-title">{task.title}</div>
                    <div className="task-meta">
                      {pilar && pilar.id !== 'all' && <span className="badge" style={{ background: pilar.color + '22', color: pilar.color }}>{pilar.label}</span>}
                      {task.time && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{task.time}</span>}
                    </div>
                    {task.why && <div className="task-why">"{task.why}"</div>}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Concluidas <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: 6 }}>{completed.length}</span>
            </h2>
          </div>
          {completed.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-title">Nenhuma concluida</div>
              <div className="empty-state-text">Complete suas tarefas para ve-las aqui</div>
            </div>
          ) : (
            completed.map((task: Task) => {
              const pilar = PILARES.find(p => p.id === task.categoryId);
              return (
                <div key={task.id} className="task-item completed" onClick={() => navigate(`/task/${task.id}`)}>
                  <div className="task-checkbox checked" onClick={e => { e.stopPropagation(); toggleTask(task); }} style={{ borderColor: pilar?.color, background: pilar?.color }}>
                    <CheckIcon />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="task-title">{task.title}</div>
                    {pilar && pilar.id !== 'all' && <div className="task-meta"><span className="badge" style={{ background: pilar.color + '22', color: pilar.color }}>{pilar.label}</span></div>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}
