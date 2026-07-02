import { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { useTasks, useCheckIns } from '../stores/useStore';
import { CATEGORIES } from '../types';
import { format, eachDayOfInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Period = 'week' | 'month';

const MOOD_LABELS = ['', 'Pesado', 'Cansado', 'Neutro', 'Bem', 'Otimo'];
const MOOD_COLORS = ['', '#C97A6E', '#C9A96E', '#BBA58E', '#9EB8A0', '#7A9E7E'];

export function Insights() {
  const [period, setPeriod] = useState<Period>('week');
  const { tasks } = useTasks();
  const { checkIns } = useCheckIns();

  const { startDate, endDate, days } = useMemo(() => {
    const now = new Date();
    const start = period === 'week' ? startOfWeek(now, { weekStartsOn: 0 }) : startOfMonth(now);
    const end = period === 'week' ? endOfWeek(now, { weekStartsOn: 0 }) : endOfMonth(now);
    return {
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
      days: eachDayOfInterval({ start, end }),
    };
  }, [period]);

  const periodTasks = useMemo(() =>
    tasks.filter(t => t.date >= startDate && t.date <= endDate), [tasks, startDate, endDate]);

  const periodCheckIns = useMemo(() =>
    checkIns.filter(c => c.date >= startDate && c.date <= endDate), [checkIns, startDate, endDate]);

  const doneTasks = periodTasks.filter(t => t.status === 'done');
  const completionRate = periodTasks.length > 0 ? Math.round((doneTasks.length / periodTasks.length) * 100) : 0;

  const avgMood = periodCheckIns.length > 0
    ? (periodCheckIns.reduce((s, c) => s + c.mood, 0) / periodCheckIns.length).toFixed(1)
    : null;

  const tasksByCategory = useMemo(() =>
    CATEGORIES.map(cat => ({
      cat,
      total: periodTasks.filter(t => t.categoryId === cat.id).length,
      done: periodTasks.filter(t => t.categoryId === cat.id && t.status === 'done').length,
    })).filter(c => c.total > 0).sort((a, b) => b.total - a.total),
    [periodTasks]);

  const maxCatTotal = Math.max(...tasksByCategory.map(c => c.total), 1);

  // Mood chart data
  const moodByDay = useMemo(() =>
    days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const ci = periodCheckIns.find(c => c.date === dateStr);
      return { day, mood: ci?.mood || null };
    }), [days, periodCheckIns]);

  // Insight messages
  const insights: string[] = useMemo(() => {
    const msgs: string[] = [];
    if (completionRate >= 70) msgs.push(`Voce concluiu ${completionRate}% das suas tarefas. Que semana!`);
    else if (completionRate > 0) msgs.push(`${completionRate}% das tarefas concluidas. Cada passo conta.`);
    if (tasksByCategory.length > 0) {
      const top = tasksByCategory[0];
      msgs.push(`${top.cat.name} foi o pilar com mais tarefas este periodo.`);
    }
    if (avgMood && parseFloat(avgMood) >= 4) msgs.push('Seu humor esteve elevado este periodo. Que bom!');
    if (periodCheckIns.length === 0) msgs.push('Experimente fazer o check-in diario para ver seus padroes de humor aqui.');
    return msgs;
  }, [completionRate, tasksByCategory, avgMood, periodCheckIns]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Header title="Insights" />

      <div style={{ display: 'flex', padding: '0 20px 16px', gap: 8 }}>
        {(['week', 'month'] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              padding: '7px 18px', borderRadius: 20, fontSize: 13, fontWeight: 500,
              backgroundColor: period === p ? 'var(--primary)' : 'var(--surface)',
              color: period === p ? '#EEEFE9' : 'var(--muted)',
              border: '1px solid ' + (period === p ? 'transparent' : 'var(--border)'),
            }}
          >
            {p === 'week' ? 'Semana' : 'Mes'}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 40px' }}>
        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          <SummaryCard
            label="Tarefas concluidas"
            value={`${doneTasks.length}/${periodTasks.length}`}
            sub={`${completionRate}% de conclusao`}
            color="var(--success)"
          />
          <SummaryCard
            label="Humor medio"
            value={avgMood ? `${avgMood}/5` : '—'}
            sub={avgMood ? MOOD_LABELS[Math.round(parseFloat(avgMood))] : 'Sem registros'}
            color={avgMood ? MOOD_COLORS[Math.round(parseFloat(avgMood))] : 'var(--muted)'}
          />
        </div>

        {/* Mood chart */}
        {moodByDay.some(d => d.mood) && (
          <Section title="Humor ao longo do periodo">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
              {moodByDay.map(({ day, mood }, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: '100%', borderRadius: 4,
                    height: mood ? `${(mood / 5) * 64}px` : '4px',
                    backgroundColor: mood ? MOOD_COLORS[mood] : 'var(--border)',
                    transition: 'height 0.3s',
                  }} />
                  <span style={{ fontSize: 9, color: 'var(--muted)' }}>
                    {format(day, 'EEE', { locale: ptBR }).slice(0, 1).toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Tasks by category */}
        {tasksByCategory.length > 0 && (
          <Section title="Tarefas por pilar">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tasksByCategory.map(({ cat, total, done }) => (
                <div key={cat.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: cat.color }} />
                      <span style={{ fontSize: 13, color: 'var(--foreground)', fontWeight: 500 }}>{cat.name}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{done}/{total}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, backgroundColor: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 3,
                      width: `${(total / maxCatTotal) * 100}%`,
                      backgroundColor: cat.color,
                      transition: 'width 0.4s',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <Section title="O que o periodo revela">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {insights.map((msg, i) => (
                <div key={i} style={{
                  padding: '14px', borderRadius: 12,
                  backgroundColor: 'var(--surface2)',
                  border: '1px solid var(--border)',
                }}>
                  <p style={{ fontSize: 14, color: 'var(--foreground)', lineHeight: 1.6 }}>{msg}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {periodTasks.length === 0 && periodCheckIns.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)' }}>
            <p style={{ fontSize: 15, marginBottom: 8 }}>Nenhum dado ainda.</p>
            <p style={{ fontSize: 13 }}>Adicione tarefas e faca check-ins para ver seus insights aqui.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div style={{ padding: '16px', borderRadius: 14, backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
      <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 24, fontWeight: 700, color, marginBottom: 4 }}>{value}</p>
      <p style={{ fontSize: 12, color: 'var(--muted)' }}>{sub}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>
        {title}
      </h3>
      {children}
    </div>
  );
}
