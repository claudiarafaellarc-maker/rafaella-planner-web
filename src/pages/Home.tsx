import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Icon } from '../components/Icon';
import { useTasks } from '../stores/useStore';
import { CATEGORIES } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

function formatDate(d: Date) {
  return format(d, 'yyyy-MM-dd');
}

export function Home() {
  const navigate = useNavigate();
  const { getTasksByDate, getTasksByMonth } = useTasks();
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState(formatDate(new Date()));

  const { days, monthTasks } = useMemo(() => {
    const first = startOfMonth(current);
    const last = endOfMonth(current);
    const allDays = eachDayOfInterval({ start: first, end: last });
    const startPad = getDay(first);
    const paddedDays: (Date | null)[] = [...Array(startPad).fill(null), ...allDays];
    while (paddedDays.length % 7 !== 0) paddedDays.push(null);
    const mt = getTasksByMonth(current.getFullYear(), current.getMonth());
    return { days: paddedDays, monthTasks: mt };
  }, [current]);

  function prevMonth() {
    setCurrent(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }
  function nextMonth() {
    setCurrent(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  const selectedTasks = getTasksByDate(selected);
  const selectedDate = parseISO(selected);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Header
        title={format(current, 'MMMM yyyy', { locale: ptBR }).replace(/^\w/, c => c.toUpperCase())}
        rightAction={
          <button
            onClick={() => navigate('/task/create?date=' + selected)}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              backgroundColor: 'var(--primary)', color: '#EEEFE9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon name="plus" size={18} />
          </button>
        }
      />

      {/* Month navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 12px' }}>
        <button onClick={prevMonth} style={{ color: 'var(--muted)', padding: 4 }}>
          <Icon name="chevron-left" size={20} />
        </button>
        <span style={{ fontSize: 14, color: 'var(--muted)' }}>
          {format(current, 'MMMM yyyy', { locale: ptBR })}
        </span>
        <button onClick={nextMonth} style={{ color: 'var(--muted)', padding: 4 }}>
          <Icon name="chevron-right" size={20} />
        </button>
      </div>

      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 16px', marginBottom: 4 }}>
        {WEEKDAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)', fontWeight: 500, padding: '4px 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 16px', gap: '2px 0' }}>
        {days.map((day, i) => {
          if (!day) return <div key={i} />;
          const dateStr = formatDate(day);
          const dayTasks = monthTasks.filter(t => t.date === dateStr);
          const isSelected = dateStr === selected;
          const todayDay = isToday(day);
          const hasTasks = dayTasks.length > 0;
          const doneTasks = dayTasks.filter(t => t.status === 'done').length;
          const allDone = hasTasks && doneTasks === dayTasks.length;

          return (
            <button
              key={dateStr}
              onClick={() => setSelected(dateStr)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '6px 2px', borderRadius: 10, gap: 3,
                backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                transition: 'background-color 0.15s',
              }}
            >
              <span style={{
                fontSize: 14,
                fontWeight: todayDay ? 700 : 400,
                color: isSelected ? '#EEEFE9' : todayDay ? 'var(--primary-dark)' : 'var(--foreground)',
              }}>
                {day.getDate()}
              </span>
              {hasTasks && (
                <div style={{
                  width: 5, height: 5, borderRadius: '50%',
                  backgroundColor: isSelected ? '#EEEFE9' : allDone ? 'var(--success)' : 'var(--primary)',
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day tasks */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px 20px',
        borderTop: '1px solid var(--border)', marginTop: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)' }}>
            {isToday(selectedDate) ? 'Hoje' : format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
          </h3>
          <button
            onClick={() => navigate('/today?date=' + selected)}
            style={{ fontSize: 13, color: 'var(--primary-dark)', fontWeight: 500 }}
          >
            Ver agenda
          </button>
        </div>

        {selectedTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)' }}>
            <p style={{ fontSize: 14, marginBottom: 8 }}>Nenhuma tarefa neste dia.</p>
            <button
              onClick={() => navigate('/task/create?date=' + selected)}
              style={{ fontSize: 13, color: 'var(--primary-dark)', fontWeight: 500 }}
            >
              + Adicionar tarefa
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {selectedTasks.map(task => {
              const cat = CATEGORIES.find(c => c.id === task.categoryId);
              return (
                <button
                  key={task.id}
                  onClick={() => navigate('/task/' + task.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 12,
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    textAlign: 'left', width: '100%',
                  }}
                >
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    backgroundColor: cat?.color || 'var(--border)',
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 14, fontWeight: 500, color: 'var(--foreground)',
                      textDecoration: task.status === 'done' ? 'line-through' : 'none',
                      opacity: task.status === 'done' ? 0.5 : 1,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {task.title}
                    </p>
                    {task.time && (
                      <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{task.time}</p>
                    )}
                  </div>
                  {task.status === 'done' && (
                    <Icon name="check-circle" size={16} color="var(--success)" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
