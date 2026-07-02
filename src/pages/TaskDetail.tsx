import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { Icon } from '../components/Icon';
import { useTasks } from '../stores/useStore';
import { CATEGORIES } from '../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks, updateTask, deleteTask } = useTasks();
  const [showDoneMsg, setShowDoneMsg] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const task = tasks.find(t => t.id === id);
  const cat = task ? CATEGORIES.find(c => c.id === task.categoryId) : undefined;

  function handleToggleDone() {
    if (!task) return;
    if (task.status !== 'done') {
      updateTask(task.id, { status: 'done' });
      setShowDoneMsg(true);
      setTimeout(() => setShowDoneMsg(false), 3000);
    } else {
      updateTask(task.id, { status: 'pending' });
    }
  }

  function handleDelete() {
    if (!task) return;
    deleteTask(task.id);
    navigate(-1);
  }

  function handleReschedule() {
    if (!task) return;
    updateTask(task.id, { status: 'rescheduled' });
    navigate('/task/create?date=' + format(new Date(new Date().getTime() + 86400000), 'yyyy-MM-dd'));
  }

  if (!task) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Header title="Tarefa" showBack />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
          Tarefa nao encontrada.
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Header
        title={task.isAppointment ? 'Compromisso' : 'Tarefa'}
        showBack
        rightAction={
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{ color: 'var(--muted)', padding: 4 }}
          >
            <Icon name="trash" size={18} />
          </button>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 40px' }}>
        {/* Done celebration */}
        {showDoneMsg && task.why && (
          <div style={{
            padding: '16px', borderRadius: 14, marginBottom: 20,
            backgroundColor: 'var(--success)', color: '#fff',
          }}>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Voce fez isso porque:</p>
            <p style={{ fontSize: 15, fontStyle: 'italic' }}>"{task.why}"</p>
          </div>
        )}
        {showDoneMsg && !task.why && (
          <div style={{
            padding: '16px', borderRadius: 14, marginBottom: 20,
            backgroundColor: 'var(--success)', color: '#fff',
          }}>
            <p style={{ fontSize: 15, fontWeight: 500 }}>Feito! Cada passo conta.</p>
          </div>
        )}

        {/* Title */}
        <h2 style={{
          fontSize: 22, fontWeight: 700, color: 'var(--foreground)', marginBottom: 8,
          textDecoration: task.status === 'done' ? 'line-through' : 'none',
          opacity: task.status === 'done' ? 0.6 : 1,
        }}>
          {task.title}
        </h2>

        {/* Status badge */}
        {task.status === 'done' && (
          <span style={{
            display: 'inline-block', padding: '4px 12px', borderRadius: 20,
            backgroundColor: 'var(--success)', color: '#fff',
            fontSize: 12, fontWeight: 600, marginBottom: 20,
          }}>
            Concluida
          </span>
        )}
        {task.status === 'pending' && (
          <span style={{
            display: 'inline-block', padding: '4px 12px', borderRadius: 20,
            backgroundColor: 'var(--surface2)', color: 'var(--muted)',
            fontSize: 12, fontWeight: 500, marginBottom: 20,
          }}>
            Ainda por vir
          </span>
        )}
        {task.status === 'rescheduled' && (
          <span style={{
            display: 'inline-block', padding: '4px 12px', borderRadius: 20,
            backgroundColor: 'var(--warning)', color: '#fff',
            fontSize: 12, fontWeight: 500, marginBottom: 20,
          }}>
            Reagendada
          </span>
        )}

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
          <DetailRow icon="calendar" label="Data">
            {format(parseISO(task.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </DetailRow>
          {task.time && (
            <DetailRow icon="clock" label="Horario">
              {task.time}{task.endTime ? ' — ' + task.endTime : ''}
            </DetailRow>
          )}
          {cat && (
            <DetailRow icon="circle" label="Pilar">
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: cat.color, display: 'inline-block' }} />
                {cat.name}
              </span>
            </DetailRow>
          )}
        </div>

        {/* Why */}
        {task.why && (
          <div style={{
            padding: '16px', borderRadius: 14,
            backgroundColor: 'var(--surface2)',
            border: '1px solid var(--border)',
            marginBottom: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Icon name="heart" size={14} color="var(--primary)" />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Por que isso importa
              </span>
            </div>
            <p style={{ fontSize: 15, color: 'var(--foreground)', lineHeight: 1.6, fontStyle: 'italic' }}>
              "{task.why}"
            </p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={handleToggleDone}
            style={{
              padding: '16px', borderRadius: 14, fontSize: 16, fontWeight: 600,
              backgroundColor: task.status === 'done' ? 'var(--surface)' : 'var(--primary)',
              color: task.status === 'done' ? 'var(--muted)' : '#EEEFE9',
              border: task.status === 'done' ? '1px solid var(--border)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Icon name={task.status === 'done' ? 'circle' : 'check'} size={18} />
            {task.status === 'done' ? 'Marcar como pendente' : 'Marcar como concluida'}
          </button>

          {task.status === 'pending' && (
            <button
              onClick={handleReschedule}
              style={{
                padding: '14px', borderRadius: 14, fontSize: 14, fontWeight: 500,
                backgroundColor: 'var(--surface)', color: 'var(--muted)',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <Icon name="repeat" size={16} />
              Quer reagendar?
            </button>
          )}
        </div>
      </div>

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'flex-end', zIndex: 100,
        }}>
          <div style={{
            width: '100%', backgroundColor: 'var(--bg)',
            borderRadius: '20px 20px 0 0', padding: '24px 20px 40px',
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Excluir tarefa?</h3>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>
              Essa acao nao pode ser desfeita.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={handleDelete}
                style={{ padding: '14px', borderRadius: 14, backgroundColor: 'var(--error)', color: '#fff', fontSize: 15, fontWeight: 600 }}
              >
                Excluir
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{ padding: '14px', borderRadius: 14, backgroundColor: 'var(--surface)', color: 'var(--muted)', fontSize: 15, border: '1px solid var(--border)' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={16} color="var(--muted)" />
      </div>
      <div>
        <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</p>
        <div style={{ fontSize: 14, color: 'var(--foreground)', fontWeight: 500, marginTop: 1 }}>{children}</div>
      </div>
    </div>
  );
}
