import React, { useState } from 'react';
import { Task, TaskStatus, Priority } from '../../types';
import { useProjectStore } from '../../store/useProjectStore';
import { apiRequest } from '../../api/client';
import { X, Plus } from 'lucide-react';

interface CreateTaskModalProps {
  initialStatus?: TaskStatus;
  onClose: () => void;
  onTaskCreated?: (task: Task) => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  initialStatus = 'TODO',
  onClose,
  onTaskCreated,
}) => {
  const { activeProject, upsertTask } = useProjectStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !activeProject) return;

    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        projectId: activeProject.id,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        assigneeIds: selectedAssignees,
        labels: selectedLabels,
      };

      const newTask = await apiRequest<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      upsertTask(newTask);
      if (onTaskCreated) onTaskCreated(newTask);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAssignee = (userId: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const toggleLabel = (labelId: string) => {
    setSelectedLabels((prev) =>
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]
    );
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: activeProject?.colorTag || '#3b82f6',
              }}
            />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
              New Issue <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>in {activeProject?.name}</span>
            </h3>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#f87171',
              fontSize: '0.785rem',
              marginBottom: '14px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="Issue title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="input-group">
            <label className="input-label">Description (Markdown)</label>
            <textarea
              className="form-textarea"
              placeholder="Add description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '12px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                <option value="BACKLOG">Backlog</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Priority</label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Target Date</label>
            <input
              type="date"
              className="form-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Assignees */}
          {activeProject?.members && activeProject.members.length > 0 && (
            <div className="input-group">
              <label className="input-label">Assignee</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {activeProject.members.map(({ user }) => {
                  const isSelected = selectedAssignees.includes(user.id);
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => toggleAssignee(user.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-xs)',
                        border: isSelected ? '1px solid var(--primary-border)' : '1px solid var(--border-default)',
                        backgroundColor: isSelected ? 'var(--primary-surface)' : 'var(--bg-input)',
                        color: isSelected ? 'var(--text-main)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: user.avatarColor,
                        }}
                      />
                      <span>{user.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Labels */}
          {activeProject?.labels && activeProject.labels.length > 0 && (
            <div className="input-group">
              <label className="input-label">Labels</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '4px' }}>
                {activeProject.labels.map((label) => {
                  const isSelected = selectedLabels.includes(label.id);
                  return (
                    <button
                      key={label.id}
                      type="button"
                      onClick={() => toggleLabel(label.id)}
                      style={{
                        fontSize: '0.725rem',
                        padding: '2px 7px',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: isSelected ? `${label.color}25` : 'transparent',
                        border: `1px solid ${label.color}${isSelected ? '80' : '30'}`,
                        color: label.color,
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      {label.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting || !title.trim()}>
              <Plus size={13} />
              <span>{isSubmitting ? 'Creating...' : 'Create Issue'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
