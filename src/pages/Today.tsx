import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { Icon } from '../components/Icon';
import { useTasks } from '../stores/useStore';
import { CATEGORIES } from '../types';
import { format, parseISO, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function todayStr() {
  return format(new Date(), 'yyyy-MM-dd');
}

export function Today() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const dateParam = params.get('date') || todayStr();
  const { getTasksByDate, updateTask } = useTasks();
  const [view, setView] = useState<'agenda' | 'tasks'>('agenda');

  const tasks = getTasksByDate(dateParam);
  const appointments = useMemo(() =>
    tasks.filter(t => t.isAppointment && t.time).sort((a, b) => (a.time || '').localeCompare(b.time || '')),
    [tasks]);
  const taskList = useMemo(() =>
    tasks.filter(t => !t.isAppointment || !t.time),
    [tasks]);

  const dateObj = parseISO(dateParam);
  const isCurrentDay = isToday(dateObj);

  function toggleDone(id: string, current: string) {
    updateTask(id, { status: current === 'done' ? 'pending' : 'done' });
  }

  const title = isCurrentDay ? 'Hoje' : format(dateObj, "d 'de' MMMM", { locale: ptBR });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Header
        title={title}
        subtitle={format(dateObj, "EEEE, d 'de' MMMM", { locale: ptBR })}
        rightAction={
          <button
            onClick={() => navigate('/task/create?date=' + dateParam)}
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

      {/* View toggle */}
      <div style={{ display: 'flex', padding: '0 20px 16px', gap: 8 }}>
        {(['agenda', 'tasks'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500,
              backgroundColor: view === v ? 'var(--primary)' : 'var(--surface)',
              color: view === v ? '#EEEFE9' : 'var(--muted)',
              border: '1px solid ' + (view === v ? 'transparent' : 'var(--border)'),
              transition: 'all 0.15s',
            }}
          >
            {v === 'agenda' ? 'Agenda' : 'Tarefas'}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px' }}>
        {view === 'agenda' ? (
          <div>
            {appointments.length === 0 ? (
              <EmptyState
                message="Nenhum compromisso com horario."
                action="+ Adicionar compromisso"
                onAction={() => navigate('/task/create?date=' + dateParam + '&type=appointment')}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {appointments.map(task => {
                  const cat = CATEGORIES.find(c => c.id === task.categoryId);
                  return (
                    <button
                      key={task.id}
                      onClick={() => navigate('/task/' + task.id)}
                      style={{
                        display: 'flex', gap: 14, textAlign: 'left',
                        padding: '14px', borderRadius: 14,
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                        width: '100%',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 44 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-dark)' }}>{task.time}</span>
                        {task.endTime && (
                          <>
                            <div style={{ width: 1, flex: 1, backgroundColor: 'var(--border)', minHeight: 12 }} />
                            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{task.endTime}</span>
                          </>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          {cat && (
                            <span style={{
                              fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 10,
                              backgroundColor: cat.color + '22', color: cat.color,
                            }}>
                              {cat.name}
                            </span>
                          )}
                        </div>
                        <p style={{
                          fontSize: 15, fontWeight: 500, color: 'var(--foreground)',
                          textDecoration: task.status === 'done' ? 'line-through' : 'none',
                          opacity: task.status === 'done' ? 0.5 : 1,
                        }}>
                          {task.title}
                        </p>
                        {task.why && (
                          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, fontStyle: 'italic' }}>
                            "{task.why}"
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div>
            {taskList.length === 0 ? (
              <EmptyState
                message="Nenhuma tarefa para hoje."
                action="+ Adicionar tarefa"
                onAction={() => navigate('/task/create?date=' + dateParam)}
              />
            ) : (
              <div>
                {CATEGORIES.map(cat => {
                  const catTasks = taskList.filter(t => t.categoryId === cat.id);
                  if (catTasks.length === 0) return null;
                  return (
                    <div key={cat.id} style={{ marginBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: cat.color }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {cat.name}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {catTasks.map(task => (
                          <TaskItem
                            key={task.id}
                            task={task}
                            onToggle={() => toggleDone(task.id, task.status)}
                            onPress={() => navigate('/task/' + task.id)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
                {/* Uncategorized */}
                {taskList.filter(t => !t.categoryId).length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--border)' }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Sem categoria
                      </span>
                    </div>
                    {taskList.filter(t => !t.categoryId).map(task => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={() => toggleDone(task.id, task.status)}
                        onPress={() => navigate('/task/' + task.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Check-in floating button */}
      {isCurrentDay && (
        <button
          onClick={() => navigate('/checkin')}
          style={{
            position: 'absolute', bottom: 80, right: 20,
            padding: '12px 18px', borderRadius: 24,
            backgroundColor: 'var(--foreground)', color: 'var(--bg)',
            fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <span>Como foi seu dia?</span>
        </button>
      )}
    </div>
  );
}

function TaskItem({ task, onToggle, onPress }: { task: any; onToggle: () => void; onPress: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
      <button
        onClick={e => { e.stopPropagation(); onToggle(); }}
        style={{
          width: 22, height: 22, borderRadius: 6, flexShrink: 0,
          border: '1.5px solid ' + (task.status === 'done' ? 'var(--success)' : 'var(--border)'),
          backgroundColor: task.status === 'done' ? 'var(--success)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {task.status === 'done' && <Icon name="check" size={12} color="#fff" />}
      </button>
      <button onClick={onPress} style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
        <p style={{
          fontSize: 14, fontWeight: 500, color: 'var(--foreground)',
          textDecoration: task.status === 'done' ? 'line-through' : 'none',
          opacity: task.status === 'done' ? 0.5 : 1,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {task.title}
        </p>
        {task.why && task.status !== 'done' && (
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {task.why}
          </p>
        )}
      </button>
    </div>
  );
}

function EmptyState({ message, action, onAction }: { message: string; action: string; onAction: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)' }}>
      <p style={{ fontSize: 14, marginBottom: 12 }}>{message}</p>
      <button onClick={onAction} style={{ fontSize: 14, color: 'var(--primary-dark)', fontWeight: 500 }}>{action}</button>
    </div>
  );
}
