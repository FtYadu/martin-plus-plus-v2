import { create } from 'zustand';
import type { Task, TaskStatus } from '@/types';

type TasksState = {
  tasks: Task[];
  filter: TaskStatus | 'all';
  isLoading: boolean;
  error: string | null;
};

type TasksActions = {
  setTasks: (tasks: Task[]) => void;
  setFilter: (filter: TaskStatus | 'all') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
};

export const useTasksStore = create<TasksState & TasksActions>((set) => ({
  tasks: [],
  filter: 'all',
  isLoading: false,
  error: null,
  
  setTasks: (tasks) => set({ tasks, isLoading: false, error: null }),
  
  setFilter: (filter) => set({ filter }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error, isLoading: false }),
  
  addTask: (task) => set((state) => ({ 
    tasks: [task, ...state.tasks] 
  })),
  
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, ...updates } : task
    ),
  })),
  
  removeTask: (id) => set((state) => ({
    tasks: state.tasks.filter((task) => task.id !== id),
  })),
}));