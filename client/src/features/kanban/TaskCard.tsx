import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Task } from '../../types';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { InitialsAvatar } from '../../components/common/InitialsAvatar';
import { CheckSquare, MessageSquare, Calendar } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  index: number;
  projectKey: string;
  onClick: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, index, projectKey, onClick }) => {
  const completedSubtasks = task.subtasks?.filter((st) => st.isCompleted).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() && task.status !== 'DONE' : false;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`task-card ${snapshot.isDragging ? 'is-dragging' : ''}`}
          onClick={onClick}
        >
          {/* Card Header: Key + Priority */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <PriorityBadge priority={task.priority} compact />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                }}
              >
                {projectKey}-{task.taskNumber}
              </span>
            </div>

            {/* Labels preview */}
            {task.labels && task.labels.length > 0 && (
              <div style={{ display: 'flex', gap: '3px' }}>
                {task.labels.slice(0, 2).map(({ label }) => (
                  <span
                    key={label.id}
                    style={{
                      fontSize: '0.625rem',
                      padding: '1px 4px',
                      borderRadius: '3px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: label.color,
                      border: `1px solid ${label.color}35`,
                      lineHeight: 1.2,
                    }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Title */}
          <h4
            style={{
              fontSize: '0.825rem',
              fontWeight: 500,
              lineHeight: 1.4,
              color: 'var(--text-main)',
              marginBottom: '8px',
            }}
          >
            {task.title}
          </h4>

          {/* Card Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.7rem',
              color: 'var(--text-dim)',
              marginTop: '6px',
              paddingTop: '6px',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Subtasks Count */}
              {totalSubtasks > 0 && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    color: completedSubtasks === totalSubtasks ? 'var(--status-done)' : 'var(--text-muted)',
                  }}
                >
                  <CheckSquare size={11} />
                  <span>
                    {completedSubtasks}/{totalSubtasks}
                  </span>
                </span>
              )}

              {/* Comments Count */}
              {(task._count?.comments || 0) > 0 && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <MessageSquare size={11} />
                  <span>{task._count?.comments}</span>
                </span>
              )}

              {/* Due Date */}
              {task.dueDate && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    color: isOverdue ? 'var(--priority-urgent)' : 'var(--text-muted)',
                  }}
                >
                  <Calendar size={11} />
                  <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </span>
              )}
            </div>

            {/* Assignees */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {task.assignees?.map(({ user }, i) => (
                <div key={user.id} style={{ marginLeft: i > 0 ? '-4px' : '0' }}>
                  <InitialsAvatar name={user.name} color={user.avatarColor} size="xs" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
