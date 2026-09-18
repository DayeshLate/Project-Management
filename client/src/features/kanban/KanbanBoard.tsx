import React from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { useProjectStore } from '../../store/useProjectStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Task, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';
import { apiRequest } from '../../api/client';
import { Plus, CircleDot, Circle, CheckCircle2, Clock } from 'lucide-react';

interface KanbanBoardProps {
  onSelectTask: (task: Task) => void;
  onOpenCreateTaskWithStatus: (status: TaskStatus) => void;
}

const COLUMNS: { id: TaskStatus; title: string; color: string; icon: any }[] = [
  { id: 'BACKLOG', title: 'Backlog', color: '#64748b', icon: Circle },
  { id: 'TODO', title: 'Todo', color: '#3b82f6', icon: CircleDot },
  { id: 'IN_PROGRESS', title: 'In Progress', color: '#f59e0b', icon: Clock },
  { id: 'IN_REVIEW', title: 'In Review', color: '#8b5cf6', icon: CircleDot },
  { id: 'DONE', title: 'Done', color: '#10b981', icon: CheckCircle2 },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  onSelectTask,
  onOpenCreateTaskWithStatus,
}) => {
  const { user } = useAuthStore();
  const { tasks, activeProject, filters, setFilters, updateTaskPosition } = useProjectStore();

  const [activeFilterTab, setActiveFilterTab] = React.useState<'all' | 'my' | 'urgent'>('all');

  // Filter tasks
  const filteredTasks = React.useMemo(() => {
    return tasks.filter((t) => {
      if (activeFilterTab === 'my' && user) {
        if (!t.assignees.some((a) => a.user.id === user.id)) return false;
      }
      if (activeFilterTab === 'urgent') {
        if (t.priority !== 'URGENT' && t.priority !== 'HIGH') return false;
      }
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(query);
        const matchDesc = t.description?.toLowerCase().includes(query) || false;
        if (!matchTitle && !matchDesc) return false;
      }
      return true;
    });
  }, [tasks, filters, activeFilterTab, user]);

  // Handle Drag End
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const destinationStatus = destination.droppableId as TaskStatus;

    // Calculate new order index
    const colTasks = filteredTasks.filter((t) => t.status === destinationStatus);
    let newOrderIndex = 1000;

    if (colTasks.length === 0) {
      newOrderIndex = 1000;
    } else if (destination.index === 0) {
      newOrderIndex = colTasks[0].orderIndex / 2;
    } else if (destination.index >= colTasks.length) {
      newOrderIndex = colTasks[colTasks.length - 1].orderIndex + 1000;
    } else {
      const prev = colTasks[destination.index - 1].orderIndex;
      const next = colTasks[destination.index].orderIndex;
      newOrderIndex = (prev + next) / 2;
    }

    // 1. Optimistic update
    updateTaskPosition(draggableId, destinationStatus, newOrderIndex);

    // 2. Sync to API
    try {
      await apiRequest(`/tasks/${draggableId}/move`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: destinationStatus,
          orderIndex: newOrderIndex,
        }),
      });
    } catch (error) {
      console.error('Failed to move task:', error);
    }
  };

  return (
    <div>
      {/* Subdued Filter Strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '14px',
          fontSize: '0.785rem',
        }}
      >
        <button
          className={`btn btn-sm ${activeFilterTab === 'all' ? 'btn-secondary' : 'btn-ghost'}`}
          onClick={() => setActiveFilterTab('all')}
        >
          All Tasks ({tasks.length})
        </button>
        <button
          className={`btn btn-sm ${activeFilterTab === 'my' ? 'btn-secondary' : 'btn-ghost'}`}
          onClick={() => setActiveFilterTab('my')}
        >
          Assigned to me
        </button>
        <button
          className={`btn btn-sm ${activeFilterTab === 'urgent' ? 'btn-secondary' : 'btn-ghost'}`}
          onClick={() => setActiveFilterTab('urgent')}
        >
          High & Urgent
        </button>
      </div>

      {/* Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {COLUMNS.map((column) => {
            const Icon = column.icon;
            const columnTasks = filteredTasks
              .filter((t) => t.status === column.id)
              .sort((a, b) => a.orderIndex - b.orderIndex);

            return (
              <div key={column.id} className="kanban-column">
                {/* Column Header */}
                <div className="column-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <Icon size={13} style={{ color: column.color }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {column.title}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.675rem',
                        padding: '1px 5px',
                        borderRadius: '3px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {columnTasks.length}
                    </span>
                  </div>

                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => onOpenCreateTaskWithStatus(column.id)}
                    title={`Create task in ${column.title}`}
                    style={{ padding: '3px' }}
                  >
                    <Plus size={13} />
                  </button>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="task-list-container"
                      style={{
                        backgroundColor: snapshot.isDraggingOver
                          ? 'rgba(79, 70, 229, 0.04)'
                          : 'transparent',
                      }}
                    >
                      {columnTasks.map((task, index) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          index={index}
                          projectKey={activeProject?.key || 'TASK'}
                          onClick={() => onSelectTask(task)}
                        />
                      ))}
                      {provided.placeholder}

                      {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                        <div
                          style={{
                            padding: '16px 8px',
                            textAlign: 'center',
                            color: 'var(--text-dim)',
                            fontSize: '0.75rem',
                            border: '1px dashed var(--border-subtle)',
                            borderRadius: 'var(--radius-xs)',
                          }}
                        >
                          No issues
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};
