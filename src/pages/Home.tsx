import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useTasks, useAuth } from '../stores/useStore';
import { CATEGORIES } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Home() {
  const navigate = useNavigate();
  const { tasks, updateTask } = useTasks();
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = monthStart.getDay();
  const padDays = Array.from({ length: startPad }, (_, i) => {
    const d = new Date(monthStart);
    d.setDate(d.getDate() - (startPad - i));
    return d;
  });
  const allDays = [...padDays, ...days];

  const tasksForDate = (date: Date) =>
    tasks.filter(t => t.date && isSameDay(new Date(t.date), date));

  const selectedTasks = tasksForDate(selectedDate);
  const todayTasks = tasksForDate(new Date());
  const doneTasks = tasks.filter(t => t.status === 'done');
  const pendingTasks = tasks.filter(t => t.status !== 'done');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const firstName = user?.name?.split(' ')[0] || 'voce';

  const toggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) updateTask(id, { status: task.status === 'done' ? 'pending' : 'done' });
  };

  return (
    <Layout>
      <div className="page">
        <div className="page-header">
          <div>
            <div className="page-title">{greeting}, {firstName}</div>
            <div className="page-subtitle">{format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}</div>
          </div>
          <button className="btn btn-primary" onClick={() => navigate(`/task/create?date=${format(selectedDate, 'yyyy-MM-dd')}`)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nova tarefa
          </button>
        </div>

        <div className="grid-4">
          <div className="card">
            <div className="card-title">Total</div>
            <div className="card-value">{tasks.length}</div>
            <div className="card-label">tarefas</div>
          </div>
          <div className="card">
            <div className="card-title">Concluidas</div>
            <div className="card-value">{doneTasks.length}</div>
            <div className="card-label">finalizadas</div>
          </div>
          <div className="card">
            <div className="card-title">Pendentes</div>
            <div className="card-value">{pendingTasks.length}</div>
            <div className="card-label">a fazer</div>
          </div>
          <div className="card">
            <div className="card-title">Hoje</div>
            <div className="card-value">{todayTasks.length}</div>
            <div className="card-label">tarefas</div>
          </div>
        </div>

        <div className="grid-2-3" style={{ marginBottom: 28 }}>
          <div className="calendar-wrap">
            <div className="calendar-header">
              <div className="calendar-month">
                {format(currentMonth, 'MMMM yyyy', { locale: ptBR }).replace(/^\w/, c => c.toUpperCase())}
              </div>
              <div className="calendar-nav">
                <button className="calendar-nav-btn" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>&#8249;</button>
                <button className="calendar-nav-btn" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>&#8250;</button>
              </div>
            </div>
            <div className="calendar-grid">
              {['Dom','Seg','Ter','Qua','Qui','Sex','Sab'].map(d => (
                <div key={d} className="calendar-dow">{d}</div>
              ))}
              {allDays.map((day, i) => {
                const hasTasks = tasksForDate(day).length > 0;
                const isSelected = isSameDay(day, selectedDate);
                const isOther = !isSameMonth(day, currentMonth);
                return (
                  <div key={i}
                    className={`calendar-day${isToday(day) ? ' today' : ''}${isSelected && !isToday(day) ? ' selected' : ''}${isOther ? ' other-month' : ''}`}
                    onClick={() => setSelectedDate(day)}>
                    <span className="day-num">{format(day, 'd')}</span>
                    {hasTasks && !isOther && <span className="day-dot" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="section-header" style={{ marginBottom: 14 }}>
              <div className="section-title">
                {isToday(selectedDate) ? 'Hoje' : format(selectedDate, "d 'de' MMM", { locale: ptBR })}
              </div>
              <button className="section-link" onClick={() => navigate('/today')}>Ver agenda &rsaquo;</button>
            </div>
            {selectedTasks.length === 0 ? (
              <div className="empty">
                <div className="empty-title">Nenhuma tarefa</div>
                <button style={{ fontSize: '0.8rem', color: 'var(--brown-light)', cursor: 'pointer', background: 'none', border: 'none', padding: 0, marginTop: 4 }}
                  onClick={() => navigate(`/task/create?date=${format(selectedDate, 'yyyy-MM-dd')}`)}>
                  + Adicionar tarefa
                </button>
              </div>
            ) : (
              <div className="task-list" style={{ flex: 1, overflowY: 'auto' }}>
                {selectedTasks.map(task => (
                  <div key={task.id} className="task-item" onClick={() => navigate(`/task/${task.id}`)}>
                    <div className={`task-check${task.status === 'done' ? ' done' : ''}`}
                      onClick={e => { e.stopPropagation(); toggleTask(task.id); }} />
                    <div className="task-body">
                      <div className={`task-name${task.status === 'done' ? ' done' : ''}`}>{task.title}</div>
                      {task.categoryId && (
                        <div className="task-meta">
                          <span className="task-tag">{CATEGORIES.find(c => c.id === task.categoryId)?.name || task.categoryId}</span>
                        </div>
                      )}
                      {task.why && <div className="task-why">"{task.why}"</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <div className="section-title">Pilares TCC</div>
          </div>
          <div className="grid-3">
            {CATEGORIES.map(cat => {
              const catTasks = tasks.filter(t => t.categoryId === cat.id);
              const catDone = catTasks.filter(t => t.status === 'done').length;
              const pct = catTasks.length > 0 ? Math.round((catDone / catTasks.length) * 100) : 0;
              return (
                <div key={cat.id} className="pillar-card">
                  <div className="pillar-name">{cat.name}</div>
                  <div className="pillar-count">{catTasks.length}</div>
                  <div className="pillar-sub">{catDone} concluidas</div>
                  <div className="pillar-bar">
                    <div className="pillar-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
