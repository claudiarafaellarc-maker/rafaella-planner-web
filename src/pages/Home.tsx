import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useTasks, useAuth } from '../stores/useStore';
import type { Task } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PILARES = [
  { id: 'health', label: 'Saude', color: '#9EB8A0' },
  { id: 'work', label: 'Trabalho', color: '#A58E74' },
  { id: 'relation', label: 'Relacionamentos', color: '#C9A0A0' },
  { id: 'finance', label: 'Financas', color: '#A0A9C9' },
  { id: 'leisure', label: 'Lazer', color: '#C9C0A0' },
  { id: 'self', label: 'Autoconhecimento', color: '#B0A0C9' },
];
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

const ChevronLeft = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevronRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const CheckIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

export default function Home() {
  const navigate = useNavigate();
  const { tasks, updateTask } = useTasks();
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart);

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach((t: Task) => {
      if (!map[t.date]) map[t.date] = [];
      map[t.date].push(t);
    });
    return map;
  }, [tasks]);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedTasks = tasksByDate[selectedDateStr] || [];
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayTasks = tasksByDate[todayStr] || [];
  const completedToday = todayTasks.filter((t: Task) => t.status === 'done').length;
  const completedAll = tasks.filter((t: Task) => t.status === 'done').length;

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Bom dia' : greetingHour < 18 ? 'Boa tarde' : 'Boa noite';
  const firstName = user?.name?.split(' ')[0] || 'Voce';

  const toggleTask = (task: Task) => {
    updateTask(task.id, { status: task.status === 'done' ? 'pending' : 'done' });
  };

  return (
    <Layout
      title={`${greeting}, ${firstName}`}
      subtitle={format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
    >
      {/* STATS */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-label">Tarefas Hoje</div>
          <div className="stat-value">{todayTasks.length}</div>
          <div className="stat-change">{completedToday} concluidas</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total do Mes</div>
          <div className="stat-value">{tasks.length}</div>
          <div className="stat-change">{completedAll} concluidas</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Taxa de Conclusao</div>
          <div className="stat-value">{tasks.length > 0 ? Math.round((completedAll / tasks.length) * 100) : 0}%</div>
          <div className="stat-change">do total</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pilares Ativos</div>
          <div className="stat-value">{new Set(tasks.map((t: Task) => t.categoryId)).size}</div>
          <div className="stat-change">de 6 pilares</div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 24 }}>
        {/* CALENDAR */}
        <div className="card" style={{ padding: 28 }}>
          <div className="card-header">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR }).replace(/^\w/, c => c.toUpperCase())}
            </h2>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-secondary btn-sm" style={{ padding: '6px 10px' }} onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft /></button>
              <button className="btn btn-secondary btn-sm" style={{ padding: '6px 10px' }} onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight /></button>
            </div>
          </div>
          <div className="calendar-grid">
            {WEEKDAYS.map(d => <div key={d} className="calendar-day-header">{d}</div>)}
            {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
            {daysInMonth.map(day => {
              const ds = format(day, 'yyyy-MM-dd');
              const hasTask = (tasksByDate[ds] || []).length > 0;
              const isSelected = isSameDay(day, selectedDate);
              const isTodayDay = isToday(day);
              return (
                <div key={ds} className={`calendar-day${isTodayDay ? ' today' : ''}${isSelected && !isTodayDay ? ' selected' : ''}`} onClick={() => setSelectedDate(day)} style={{ cursor: 'pointer' }}>
                  <span>{day.getDate()}</span>
                  {hasTask && <div className="calendar-day-dot" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* SELECTED DAY */}
        <div className="card" style={{ padding: 28 }}>
          <div className="card-header">
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {isToday(selectedDate) ? 'Hoje' : format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{selectedTasks.length} tarefa{selectedTasks.length !== 1 ? 's' : ''}</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => navigate(`/task/create?date=${selectedDateStr}`)}>+ Nova</button>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: 360 }}>
            {selectedTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <div className="empty-state-title">Nenhuma tarefa</div>
                <div className="empty-state-text">Adicione uma tarefa para este dia</div>
              </div>
            ) : (
              selectedTasks.map((task: Task) => {
                const pilar = PILARES.find(p => p.id === task.categoryId);
                const isDone = task.status === 'done';
                return (
                  <div key={task.id} className={`task-item${isDone ? ' completed' : ''}`} onClick={() => navigate(`/task/${task.id}`)}>
                    <div className={`task-checkbox${isDone ? ' checked' : ''}`} onClick={e => { e.stopPropagation(); toggleTask(task); }} style={{ borderColor: pilar?.color, background: isDone ? pilar?.color : undefined }}>
                      {isDone && <CheckIcon />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="task-title">{task.title}</div>
                      <div className="task-meta">
                        {pilar && <span className="badge" style={{ background: pilar.color + '22', color: pilar.color, fontSize: '0.7rem' }}>{pilar.label}</span>}
                        {task.time && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{task.time}</span>}
                      </div>
                      {task.why && <div className="task-why">"{task.why}"</div>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {selectedTasks.length > 0 && (
            <button className="btn btn-ghost" style={{ width: '100%', marginTop: 12, justifyContent: 'center' }} onClick={() => navigate('/today')}>Ver agenda completa</button>
          )}
        </div>
      </div>

      {/* PILARES */}
      <div style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700 }}>Pilares TCC</h2>
          <span className="label-caps">Distribuicao de tarefas</span>
        </div>
        <div className="grid-3">
          {PILARES.map(pilar => {
            const count = tasks.filter((t: Task) => t.categoryId === pilar.id).length;
            const done = tasks.filter((t: Task) => t.categoryId === pilar.id && t.status === 'done').length;
            return (
              <div key={pilar.id} className="card card-sm" style={{ borderLeft: `3px solid ${pilar.color}`, cursor: 'pointer' }} onClick={() => navigate(`/today?pilar=${pilar.id}`)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: pilar.color, marginBottom: 6 }}>{pilar.label}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{count}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3 }}>{done} concluidas</div>
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: pilar.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: pilar.color }} />
                  </div>
                </div>
                {count > 0 && (
                  <div style={{ marginTop: 12, height: 4, background: pilar.color + '22', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(done / count) * 100}%`, background: pilar.color, borderRadius: 2, transition: 'width 0.4s ease' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
