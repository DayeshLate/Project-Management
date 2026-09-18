import { create } from 'zustand';
import { Workspace, Project, Task, FilterState } from '../types';

interface ProjectState {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  projects: Project[];
  activeProject: Project | null;
  tasks: Task[];
  activeView: 'kanban' | 'list';
  filters: FilterState;
  selectedTaskId: string | null;

  setWorkspaces: (workspaces: Workspace[]) => void;
  setActiveWorkspace: (workspace: Workspace | null) => void;
  setProjects: (projects: Project[]) => void;
  setActiveProject: (project: Project | null) => void;
  setTasks: (tasks: Task[]) => void;
  setActiveView: (view: 'kanban' | 'list') => void;
  setFilters: (filters: Partial<FilterState>) => void;
  setSelectedTaskId: (taskId: string | null) => void;

  // Real-time optimistic update helpers
  upsertTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
  updateTaskPosition: (taskId: string, newStatus: Task['status'], newOrderIndex: number) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  workspaces: [],
  activeWorkspace: null,
  projects: [],
  activeProject: null,
  tasks: [],
  activeView: 'kanban',
  filters: { search: '' },
  selectedTaskId: null,

  setWorkspaces: (workspaces) => set({ workspaces }),
  setActiveWorkspace: (activeWorkspace) => set({ activeWorkspace }),
  setProjects: (projects) => set({ projects }),
  setActiveProject: (activeProject) => set({ activeProject }),
  setTasks: (tasks) => set({ tasks }),
  setActiveView: (activeView) => set({ activeView }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  setSelectedTaskId: (selectedTaskId) => set({ selectedTaskId }),

  upsertTask: (task) =>
    set((state) => {
      const exists = state.tasks.some((t) => t.id === task.id);
      if (exists) {
        return {
          tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
        };
      }
      return { tasks: [task, ...state.tasks] };
    }),

  removeTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    })),

  updateTaskPosition: (taskId, newStatus, newOrderIndex) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status: newStatus, orderIndex: newOrderIndex } : t
      ),
    })),
}));
