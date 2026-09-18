import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from './store/useAuthStore';
import { useProjectStore } from './store/useProjectStore';
import { apiRequest } from './api/client';
import { Workspace, Project, Task, TaskStatus } from './types';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { KanbanBoard } from './features/kanban/KanbanBoard';
import { TaskListView } from './features/list/TaskListView';
import { TaskDetailDrawer } from './features/tasks/TaskDetailDrawer';
import { CreateTaskModal } from './features/tasks/CreateTaskModal';
import { CreateProjectModal } from './features/projects/CreateProjectModal';
import { AuthModal } from './features/auth/AuthModal';

let socket: Socket | null = null;

export const App: React.FC = () => {
  const { user, token, checkAuth, isLoading: isAuthLoading } = useAuthStore();
  const {
    activeWorkspace,
    setWorkspaces,
    setActiveWorkspace,
    activeProject,
    setProjects,
    setActiveProject,
    activeView,
    setTasks,
    upsertTask,
    removeTask,
    updateTaskPosition,
  } = useProjectStore();

  // Modals state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [createTaskInitialStatus, setCreateTaskInitialStatus] = useState<TaskStatus>('TODO');
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  // Check auth session on load
  useEffect(() => {
    checkAuth();
  }, []);

  // 1. Fetch workspaces on login
  useEffect(() => {
    if (!token) return;

    const fetchWorkspaces = async () => {
      try {
        const data = await apiRequest<Workspace[]>('/workspaces');
        setWorkspaces(data);
        if (data.length > 0 && !activeWorkspace) {
          setActiveWorkspace(data[0]);
        }
      } catch (err) {
        console.error('Failed to load workspaces:', err);
      }
    };

    fetchWorkspaces();
  }, [token]);

  // 2. Fetch projects when active workspace changes
  useEffect(() => {
    if (!activeWorkspace) return;

    const fetchProjects = async () => {
      try {
        const data = await apiRequest<Project[]>(`/projects?workspaceId=${activeWorkspace.id}`);
        setProjects(data);
        if (data.length > 0) {
          setActiveProject(data[0]);
        } else {
          setActiveProject(null);
          setTasks([]);
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
      }
    };

    fetchProjects();
  }, [activeWorkspace]);

  // 3. Fetch tasks when active project changes & connect Socket.io
  useEffect(() => {
    if (!activeProject) {
      setTasks([]);
      return;
    }

    const fetchTasks = async () => {
      try {
        const data = await apiRequest<Task[]>(`/tasks?projectId=${activeProject.id}`);
        setTasks(data);
      } catch (err) {
        console.error('Failed to load tasks:', err);
      }
    };

    fetchTasks();

    // Socket.io real-time synchronization
    if (!socket) {
      socket = io('http://localhost:5000');
    }

    socket.emit('join_project', activeProject.id);

    socket.on('task_created', (newTask: Task) => {
      upsertTask(newTask);
    });

    socket.on('task_updated', (updatedTask: Task) => {
      upsertTask(updatedTask);
      if (selectedTask?.id === updatedTask.id) {
        setSelectedTask(updatedTask);
      }
    });

    socket.on('task_moved', ({ taskId, toStatus, orderIndex, task }: any) => {
      updateTaskPosition(taskId, toStatus, orderIndex);
      if (task) upsertTask(task);
    });

    socket.on('task_deleted', ({ taskId }: { taskId: string }) => {
      removeTask(taskId);
      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
      }
    });

    return () => {
      if (socket && activeProject) {
        socket.emit('leave_project', activeProject.id);
        socket.off('task_created');
        socket.off('task_updated');
        socket.off('task_moved');
        socket.off('task_deleted');
      }
    };
  }, [activeProject]);

  if (isAuthLoading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-app)',
          color: 'var(--text-muted)',
        }}
      >
        Initializing NexusPM...
      </div>
    );
  }

  // If unauthenticated, show Auth Modal
  if (!user) {
    return <AuthModal />;
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar onOpenCreateProject={() => setIsCreateProjectOpen(true)} />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar
          onOpenCreateTask={() => {
            setCreateTaskInitialStatus('TODO');
            setIsCreateTaskOpen(true);
          }}
        />

        <main className="content-viewport">
          {activeProject ? (
            activeView === 'kanban' ? (
              <KanbanBoard
                onSelectTask={(task) => setSelectedTask(task)}
                onOpenCreateTaskWithStatus={(status) => {
                  setCreateTaskInitialStatus(status);
                  setIsCreateTaskOpen(true);
                }}
              />
            ) : (
              <TaskListView onSelectTask={(task) => setSelectedTask(task)} />
            )
          ) : (
            <div
              style={{
                height: '70vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-dim)',
                textAlign: 'center',
              }}
            >
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-main)' }}>
                No active project selected
              </h3>
              <p style={{ maxWidth: '400px', marginBottom: '16px' }}>
                Create a project to start planning sprints, moving Kanban cards, and tracking tasks.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setIsCreateProjectOpen(true)}
              >
                Create Project
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Modals & Drawers */}
      {selectedTask && (
        <TaskDetailDrawer
          taskId={selectedTask.id}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {isCreateTaskOpen && (
        <CreateTaskModal
          initialStatus={createTaskInitialStatus}
          onClose={() => setIsCreateTaskOpen(false)}
        />
      )}

      {isCreateProjectOpen && (
        <CreateProjectModal
          onClose={() => setIsCreateProjectOpen(false)}
          onProjectCreated={() => {}}
        />
      )}
    </div>
  );
};
