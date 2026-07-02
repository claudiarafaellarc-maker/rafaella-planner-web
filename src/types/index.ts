export type CategoryId = 'health' | 'work' | 'relation' | 'finance' | 'leisure' | 'self';

export interface Category {
  id: CategoryId;
  name: string;
  color: string;
}

export const CATEGORIES: Category[] = [
  { id: 'health',   name: 'Corpo & Saude',         color: 'var(--cat-health)' },
  { id: 'work',     name: 'Trabalho',               color: 'var(--cat-work)' },
  { id: 'relation', name: 'Relacionamentos',        color: 'var(--cat-relation)' },
  { id: 'finance',  name: 'Financeiro',             color: 'var(--cat-finance)' },
  { id: 'leisure',  name: 'Descanso & Lazer',       color: 'var(--cat-leisure)' },
  { id: 'self',     name: 'Autoconhecimento',       color: 'var(--cat-self)' },
];

export type TaskStatus = 'pending' | 'done' | 'rescheduled';

export interface Task {
  id: string;
  title: string;
  categoryId: CategoryId | null;
  date: string; // YYYY-MM-DD
  time: string | null; // HH:MM
  endTime: string | null;
  why: string | null;
  status: TaskStatus;
  isAppointment: boolean;
  createdAt: string;
}

export interface CheckIn {
  id: string;
  date: string;
  mood: 1 | 2 | 3 | 4 | 5;
  reflection: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
}
