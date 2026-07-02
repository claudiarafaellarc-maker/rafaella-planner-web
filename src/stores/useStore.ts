import { useState, useEffect, useCallback } from 'react';
import type { Task, CheckIn, User } from '../types';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Tasks Store ─────────────────────────────────────────────────────────────

let tasksListeners: (() => void)[] = [];
let tasksState: Task[] = loadFromStorage<Task[]>('planner_tasks', []);

function notifyTasks() { tasksListeners.forEach(fn => fn()); }

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(tasksState);

  useEffect(() => {
    const fn = () => setTasks([...tasksState]);
    tasksListeners.push(fn);
    return () => { tasksListeners = tasksListeners.filter(l => l !== fn); };
  }, []);

  const addTask = useCallback((task: Task) => {
    tasksState = [task, ...tasksState];
    saveToStorage('planner_tasks', tasksState);
    notifyTasks();
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    tasksState = tasksState.map(t => t.id === id ? { ...t, ...updates } : t);
    saveToStorage('planner_tasks', tasksState);
    notifyTasks();
  }, []);

  const deleteTask = useCallback((id: string) => {
    tasksState = tasksState.filter(t => t.id !== id);
    saveToStorage('planner_tasks', tasksState);
    notifyTasks();
  }, []);

  const getTasksByDate = useCallback((date: string) =>
    tasksState.filter(t => t.date === date), [tasks]);

  const getTasksByMonth = useCallback((year: number, month: number) => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return tasksState.filter(t => t.date.startsWith(prefix));
  }, [tasks]);

  return { tasks, addTask, updateTask, deleteTask, getTasksByDate, getTasksByMonth };
}

// ─── CheckIns Store ───────────────────────────────────────────────────────────

let checkInsListeners: (() => void)[] = [];
let checkInsState: CheckIn[] = loadFromStorage<CheckIn[]>('planner_checkins', []);

function notifyCheckIns() { checkInsListeners.forEach(fn => fn()); }

export function useCheckIns() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>(checkInsState);

  useEffect(() => {
    const fn = () => setCheckIns([...checkInsState]);
    checkInsListeners.push(fn);
    return () => { checkInsListeners = checkInsListeners.filter(l => l !== fn); };
  }, []);

  const upsertCheckIn = useCallback((checkIn: CheckIn) => {
    const exists = checkInsState.find(c => c.date === checkIn.date);
    if (exists) {
      checkInsState = checkInsState.map(c => c.date === checkIn.date ? checkIn : c);
    } else {
      checkInsState = [checkIn, ...checkInsState];
    }
    saveToStorage('planner_checkins', checkInsState);
    notifyCheckIns();
  }, []);

  const getByDate = useCallback((date: string) =>
    checkInsState.find(c => c.date === date), [checkIns]);

  const getRange = useCallback((startDate: string, endDate: string) =>
    checkInsState.filter(c => c.date >= startDate && c.date <= endDate), [checkIns]);

  return { checkIns, upsertCheckIn, getByDate, getRange };
}

// ─── Auth Store ───────────────────────────────────────────────────────────────

let authListeners: (() => void)[] = [];
let authState: { user: User | null; isAuthenticated: boolean } = {
  user: loadFromStorage<User | null>('planner_user', null),
  isAuthenticated: !!loadFromStorage<User | null>('planner_user', null),
};

function notifyAuth() { authListeners.forEach(fn => fn()); }

export function useAuth() {
  const [state, setState] = useState(authState);

  useEffect(() => {
    const fn = () => setState({ ...authState });
    authListeners.push(fn);
    return () => { authListeners = authListeners.filter(l => l !== fn); };
  }, []);

  const login = useCallback((user: User, isNew = false) => {
    authState = { user, isAuthenticated: true };
    saveToStorage('planner_user', user);
    if (isNew) saveToStorage('planner_is_new_user', true);
    notifyAuth();
  }, []);

  const consumeNewUser = useCallback(() => {
    const isNew = !!loadFromStorage('planner_is_new_user', false);
    if (isNew) localStorage.removeItem('planner_is_new_user');
    return isNew;
  }, []);

  const logout = useCallback(() => {
    authState = { user: null, isAuthenticated: false };
    localStorage.removeItem('planner_user');
    notifyAuth();
  }, []);

  return { ...state, login, logout, consumeNewUser };
}

// ─── Combined Store Hook ──────────────────────────────────────────────────────
export function useStore() {
  const tasks_hook = useTasks();
  const checkins_hook = useCheckIns();
  const auth_hook = useAuth();
  return {
    ...tasks_hook,
    ...checkins_hook,
    ...auth_hook,
  };
}
