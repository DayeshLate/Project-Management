import React from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { Plus, Hash, FolderKanban, ChevronDown } from 'lucide-react';

interface SidebarProps {
  onOpenCreateProject: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenCreateProject }) => {
  const {
    workspaces,
    activeWorkspace,
    setActiveWorkspace,
    projects,
    activeProject,
    setActiveProject,
  } = useProjectStore();

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '22px',
              height: '22px',
              borderRadius: 'var(--radius-xs)',
              background: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <FolderKanban size={13} />
          </div>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Nexus<span style={{ color: '#818cf8' }}>PM</span>
          </span>
        </div>

        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            padding: '2px 5px',
            borderRadius: '3px',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            color: 'var(--text-dim)',
          }}
        >
          v1.0
        </span>
      </div>

      {/* Workspace Selector */}
      <div style={{ padding: '12px 14px 6px 14px' }}>
        <div style={{ position: 'relative' }}>
          <select
            className="form-select"
            style={{
              fontSize: '0.8rem',
              padding: '6px 26px 6px 10px',
              appearance: 'none',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
            }}
            value={activeWorkspace?.id || ''}
            onChange={(e) => {
              const ws = workspaces.find((w) => w.id === e.target.value);
              if (ws) setActiveWorkspace(ws);
            }}
          >
            {workspaces.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={13}
            style={{
              position: 'absolute',
              right: '9px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: 'var(--text-dim)',
            }}
          />
        </div>
      </div>

      {/* Navigation List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '4px 8px',
            marginBottom: '4px',
          }}
        >
          <span className="input-label" style={{ fontSize: '0.675rem' }}>
            Projects ({projects.length})
          </span>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={onOpenCreateProject}
            title="New Project"
            style={{ padding: '2px' }}
          >
            <Plus size={13} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {projects.map((project) => {
            const isActive = activeProject?.id === project.id;
            return (
              <button
                key={project.id}
                onClick={() => setActiveProject(project)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-xs)',
                  background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                  border: isActive ? '1px solid var(--border-default)' : '1px solid transparent',
                  color: isActive ? 'var(--text-main)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.1s ease',
                  fontFamily: 'inherit',
                }}
              >
                <Hash size={13} style={{ color: project.colorTag || '#3b82f6', flexShrink: 0 }} />
                <span
                  style={{
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: '0.8rem',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {project.name}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.675rem',
                    color: 'var(--text-dim)',
                  }}
                >
                  {project.key}
                </span>
              </button>
            );
          })}

          {projects.length === 0 && (
            <div style={{ padding: '16px 8px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
              No projects yet.
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
