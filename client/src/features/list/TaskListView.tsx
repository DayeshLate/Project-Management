import React from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { Task } from '../../types';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { InitialsAvatar } from '../../components/common/InitialsAvatar';
import { CheckSquare } from 'lucide-react';

interface TaskListViewProps {
  onSelectTask: (task: Task) => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({ onSelectTask }) => {
  const { tasks, activeProject, filters } = useProjectStore();

  const filteredTasks = React.useMemo(() => {
    return tasks.filter((t) => {
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(query);
        const matchDesc = t.description?.toLowerCase().includes(query) || false;
        if (!matchTitle && !matchDesc) return false;
      }
      if (filters.priority && t.priority !== filters.priority) return false;
      if (filters.status && t.status !== filters.status) return false;
      return true;
    });
  }, [tasks, filters]);

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr
            style={{
              borderBottom: '1px solid var(--border-default)',
              background: 'var(--bg-sidebar)',
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontWeight: 600,
            }}
          >
            <th style={{ padding: '8px 14px', width: '85px' }}>Identifier</th>
            <th style={{ padding: '8px 14px' }}>Title</th>
            <th style={{ padding: '8px 14px', width: '120px' }}>Status</th>
            <th style={{ padding: '8px 14px', width: '90px' }}>Priority</th>
            <th style={{ padding: '8px 14px', width: '100px' }}>Subtasks</th>
            <th style={{ padding: '8px 14px', width: '110px' }}>Due Date</th>
            <th style={{ padding: '8px 14px', width: '90px' }}>Assignee</th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.map((task) => {
            const completedSubtasks = task.subtasks?.filter((st) => st.isCompleted).length || 0;
            const totalSubtasks = task.subtasks?.length || 0;

            return (
              <tr
                key={task.id}
                onClick={() => onSelectTask(task)}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  fontSize: '0.815rem',
                  transition: 'background-color 0.1s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {/* Monospace Key */}
                <td
                  style={{
                    padding: '9px 14px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.725rem',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                  }}
                >
                  {activeProject?.key}-{task.taskNumber}
                </td>

                {/* Title */}
                <td style={{ padding: '9px 14px', fontWeight: 500, color: 'var(--text-main)' }}>
                  {task.title}
                </td>

                {/* Status */}
                <td style={{ padding: '9px 14px' }}>
                  <StatusBadge status={task.status} />
                </td>

                {/* Priority */}
                <td style={{ padding: '9px 14px' }}>
                  <PriorityBadge priority={task.priority} />
                </td>

                {/* Subtasks */}
                <td style={{ padding: '9px 14px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  {totalSubtasks > 0 ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <CheckSquare size={12} />
                      <span>{completedSubtasks}/{totalSubtasks}</span>
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-dim)' }}>—</span>
                  )}
                </td>

                {/* Due Date */}
                <td style={{ padding: '9px 14px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  {task.dueDate ? (
                    <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  ) : (
                    <span style={{ color: 'var(--text-dim)' }}>—</span>
                  )}
                </td>

                {/* Assignees */}
                <td style={{ padding: '9px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {task.assignees?.map(({ user }, i) => (
                      <div key={user.id} style={{ marginLeft: i > 0 ? '-4px' : '0' }}>
                        <InitialsAvatar name={user.name} color={user.avatarColor} size="xs" />
                      </div>
                    ))}
                    {(!task.assignees || task.assignees.length === 0) && (
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>—</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}

          {filteredTasks.length === 0 && (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                No tasks match the filter.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
