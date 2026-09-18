import React, { useState, useEffect } from 'react';
import { Task, Subtask, Comment, TaskStatus, Priority } from '../../types';
import { InitialsAvatar } from '../../components/common/InitialsAvatar';
import { apiRequest } from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';
import { useProjectStore } from '../../store/useProjectStore';
import {
  X,
  CheckSquare,
  Plus,
  Trash2,
  Calendar,
  History,
  MessageSquare,
  CornerDownLeft,
} from 'lucide-react';

interface TaskDetailDrawerProps {
  taskId: string;
  onClose: () => void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({ taskId, onClose }) => {
  const { user } = useAuthStore();
  const { upsertTask } = useProjectStore();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Subtask creation
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Comment creation
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');

  const fetchTask = async () => {
    try {
      const data = await apiRequest<Task>(`/tasks/${taskId}`);
      setTask(data);
    } catch (error) {
      console.error('Failed to load task details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return;
    const updated = { ...task, status: newStatus };
    setTask(updated);
    upsertTask(updated);

    try {
      await apiRequest(`/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handlePriorityChange = async (newPriority: Priority) => {
    if (!task) return;
    const updated = { ...task, priority: newPriority };
    setTask(updated);
    upsertTask(updated);

    try {
      await apiRequest(`/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ priority: newPriority }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !task) return;

    try {
      const subtask = await apiRequest<Subtask>(`/tasks/${taskId}/subtasks`, {
        method: 'POST',
        body: JSON.stringify({ title: newSubtaskTitle.trim() }),
      });
      const updatedSubtasks = [...(task.subtasks || []), subtask];
      const updated = { ...task, subtasks: updatedSubtasks };
      setTask(updated);
      upsertTask(updated);
      setNewSubtaskTitle('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleSubtask = async (subtaskId: string, isCompleted: boolean) => {
    if (!task) return;
    const updatedSubtasks = (task.subtasks || []).map((s) =>
      s.id === subtaskId ? { ...s, isCompleted } : s
    );
    const updated = { ...task, subtasks: updatedSubtasks };
    setTask(updated);
    upsertTask(updated);

    try {
      await apiRequest(`/tasks/subtasks/${subtaskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ isCompleted }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!task) return;
    const updatedSubtasks = (task.subtasks || []).filter((s) => s.id !== subtaskId);
    const updated = { ...task, subtasks: updatedSubtasks };
    setTask(updated);
    upsertTask(updated);

    try {
      await apiRequest(`/tasks/subtasks/${subtaskId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !task || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const comment = await apiRequest<Comment>(`/tasks/${taskId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: newCommentText.trim() }),
      });
      const updatedComments = [...(task.comments || []), comment];
      setTask({ ...task, comments: updatedComments });
      setNewCommentText('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading || !task) {
    return (
      <div className="drawer-content" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Loading issue...</span>
      </div>
    );
  }

  const completedSubtasks = task.subtasks?.filter((s) => s.isCompleted).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 105 }} />
      <div className="drawer-content">
        {/* Header Strip */}
        <div
          style={{
            padding: '12px 20px',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-sidebar)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
              }}
            >
              TASK-{task.taskNumber}
            </span>
            <span style={{ color: 'var(--border-default)' }}>|</span>
            <select
              className="form-select"
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
              style={{
                width: 'auto',
                padding: '3px 8px',
                fontSize: '0.75rem',
                fontWeight: 500,
                background: 'var(--bg-surface)',
              }}
            >
              <option value="BACKLOG">Backlog</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {/* Title */}
          <h2
            style={{
              fontSize: '1.15rem',
              fontWeight: 600,
              lineHeight: 1.4,
              marginBottom: '16px',
              color: 'var(--text-main)',
            }}
          >
            {task.title}
          </h2>

          {/* Properties Metadata Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
              padding: '12px 14px',
              backgroundColor: 'var(--bg-sidebar)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '20px',
              fontSize: '0.8rem',
            }}
          >
            <div>
              <span className="input-label" style={{ fontSize: '0.675rem' }}>Priority</span>
              <div style={{ marginTop: '4px' }}>
                <select
                  className="form-select"
                  value={task.priority}
                  onChange={(e) => handlePriorityChange(e.target.value as Priority)}
                  style={{ width: 'auto', padding: '3px 8px', fontSize: '0.75rem' }}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <span className="input-label" style={{ fontSize: '0.675rem' }}>Target Date</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px', color: 'var(--text-secondary)' }}>
                <Calendar size={13} />
                <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
              </div>
            </div>

            <div>
              <span className="input-label" style={{ fontSize: '0.675rem' }}>Reporter</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                <InitialsAvatar name={task.creator.name} color={task.creator.avatarColor} size="xs" />
                <span style={{ color: 'var(--text-main)' }}>{task.creator.name}</span>
              </div>
            </div>

            <div>
              <span className="input-label" style={{ fontSize: '0.675rem' }}>Assignees</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                {task.assignees && task.assignees.length > 0 ? (
                  task.assignees.map(({ user }) => (
                    <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <InitialsAvatar name={user.name} color={user.avatarColor} size="xs" />
                      <span style={{ color: 'var(--text-main)' }}>{user.name}</span>
                    </div>
                  ))
                ) : (
                  <span style={{ color: 'var(--text-dim)' }}>Unassigned</span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '22px' }}>
            <span className="input-label" style={{ display: 'block', marginBottom: '6px' }}>
              Description
            </span>
            <div
              style={{
                padding: '12px',
                backgroundColor: 'var(--bg-sidebar)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: task.description ? 'var(--text-main)' : 'var(--text-dim)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {task.description || 'No description provided.'}
            </div>
          </div>

          {/* Subtasks Checklist */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span className="input-label">
                Subtasks ({completedSubtasks}/{totalSubtasks})
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
              {task.subtasks?.map((subtask) => (
                <div
                  key={subtask.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--bg-sidebar)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={subtask.isCompleted}
                      onChange={(e) => handleToggleSubtask(subtask.id, e.target.checked)}
                      style={{ accentColor: 'var(--primary)', width: '14px', height: '14px' }}
                    />
                    <span
                      style={{
                        fontSize: '0.815rem',
                        textDecoration: subtask.isCompleted ? 'line-through' : 'none',
                        color: subtask.isCompleted ? 'var(--text-dim)' : 'var(--text-main)',
                      }}
                    >
                      {subtask.title}
                    </span>
                  </label>
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => handleDeleteSubtask(subtask.id)}
                    style={{ padding: '2px', color: 'var(--text-dim)' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddSubtask} style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Add subtask item..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                style={{ fontSize: '0.8rem', padding: '5px 10px' }}
              />
              <button type="submit" className="btn btn-secondary btn-sm" disabled={!newSubtaskTitle.trim()}>
                <Plus size={13} />
                <span>Add</span>
              </button>
            </form>
          </div>

          {/* Tabs */}
          <div>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: '12px',
              }}
            >
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setActiveTab('comments')}
                style={{
                  borderBottom: activeTab === 'comments' ? '2px solid var(--primary)' : '2px solid transparent',
                  borderRadius: 0,
                  color: activeTab === 'comments' ? 'var(--text-main)' : 'var(--text-dim)',
                  fontWeight: 600,
                  paddingBottom: '6px',
                }}
              >
                <MessageSquare size={13} />
                <span>Comments ({task.comments?.length || 0})</span>
              </button>

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setActiveTab('activity')}
                style={{
                  borderBottom: activeTab === 'activity' ? '2px solid var(--primary)' : '2px solid transparent',
                  borderRadius: 0,
                  color: activeTab === 'activity' ? 'var(--text-main)' : 'var(--text-dim)',
                  fontWeight: 600,
                  paddingBottom: '6px',
                }}
              >
                <History size={13} />
                <span>Activity</span>
              </button>
            </div>

            {activeTab === 'comments' && (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  {task.comments?.map((comment) => (
                    <div
                      key={comment.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: 'var(--bg-sidebar)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <InitialsAvatar name={comment.user.name} color={comment.user.avatarColor} size="xs" />
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>
                            {comment.user.name}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.675rem', color: 'var(--text-dim)' }}>
                          {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', lineHeight: 1.5, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                        {comment.content}
                      </p>
                    </div>
                  ))}

                  {(!task.comments || task.comments.length === 0) && (
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textAlign: 'center', padding: '8px' }}>
                      No comments yet.
                    </p>
                  )}
                </div>

                {user && (
                  <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Leave a comment..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      disabled={!newCommentText.trim() || isSubmittingComment}
                    >
                      <CornerDownLeft size={13} />
                    </button>
                  </form>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {task.activities?.map((activity) => (
                  <div
                    key={activity.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <InitialsAvatar name={activity.user.name} color={activity.user.avatarColor} size="xs" />
                    <div>
                      <strong style={{ color: 'var(--text-main)' }}>{activity.user.name}</strong>{' '}
                      <span>{activity.action.replace('_', ' ').toLowerCase()}</span>
                      <span style={{ fontSize: '0.675rem', color: 'var(--text-dim)', marginLeft: '6px' }}>
                        {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}

                {(!task.activities || task.activities.length === 0) && (
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textAlign: 'center' }}>
                    No recorded activity.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
