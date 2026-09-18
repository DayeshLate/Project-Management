import React, { useState } from 'react';
import { Project } from '../../types';
import { useProjectStore } from '../../store/useProjectStore';
import { apiRequest } from '../../api/client';
import { X, Plus } from 'lucide-react';

interface CreateProjectModalProps {
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

const PALETTE = [
  '#4f46e5', '#3b82f6', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'
];

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  onClose,
  onProjectCreated,
}) => {
  const { activeWorkspace, projects, setProjects, setActiveProject } = useProjectStore();

  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [colorTag, setColorTag] = useState('#4f46e5');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleNameChange = (val: string) => {
    setName(val);
    if (!key || key.length <= 4) {
      const generated = val
        .replace(/[^a-zA-Z]/g, '')
        .substring(0, 3)
        .toUpperCase();
      if (generated) setKey(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !key.trim() || !activeWorkspace) return;

    setIsSubmitting(true);
    setError('');

    try {
      const newProject = await apiRequest<Project>('/projects', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          key: key.trim().toUpperCase(),
          description: description.trim() || null,
          colorTag,
          workspaceId: activeWorkspace.id,
        }),
      });

      setProjects([newProject, ...projects]);
      setActiveProject(newProject);
      onProjectCreated(newProject);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
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
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Create Project</h3>
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
            <label className="input-label">Project Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Core Engine"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="input-group">
            <label className="input-label">Identifier (Prefix for issues)</label>
            <input
              type="text"
              className="form-input"
              placeholder="ENG"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              maxLength={6}
              required
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Color Accent</label>
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              {PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setColorTag(color)}
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: color,
                    border: colorTag === color ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.15)',
                    cursor: 'pointer',
                    transform: colorTag === color ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.1s ease',
                  }}
                />
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Description (Optional)</label>
            <textarea
              className="form-textarea"
              placeholder="Scope and purpose of this project..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting || !name.trim() || !key.trim()}>
              <Plus size={13} />
              <span>{isSubmitting ? 'Creating...' : 'Create Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
