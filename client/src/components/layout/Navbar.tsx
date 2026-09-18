import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useProjectStore } from '../../store/useProjectStore';
import { InitialsAvatar } from '../common/InitialsAvatar';
import {
  Search,
  Plus,
  Kanban,
  ListFilter,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
} from 'lucide-react';

interface NavbarProps {
  onOpenCreateTask: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCreateTask }) => {
  const { user, logout } = useAuthStore();
  const {
    activeWorkspace,
    activeProject,
    activeView,
    setActiveView,
    filters,
    setFilters,
  } = useProjectStore();
  const [theme, setTheme] = React.useState<'dark' | 'light'>('dark');

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <header className="top-navbar">
      {/* Left: Breadcrumbs & View Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.815rem',
            color: 'var(--text-muted)',
          }}
        >
          <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>
            {activeWorkspace?.name || 'Workspace'}
          </span>
          <ChevronRight size={13} style={{ color: 'var(--text-dim)' }} />
          {activeProject ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '2px',
                  backgroundColor: activeProject.colorTag,
                }}
              />
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                {activeProject.name}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.675rem',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: 'var(--text-muted)',
                }}
              >
                {activeProject.key}
              </span>
            </div>
          ) : (
            <span style={{ color: 'var(--text-dim)' }}>Select project</span>
          )}
        </div>

        {/* View Toggle Segmented Control */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-app)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '2px',
            marginLeft: '10px',
          }}
        >
          <button
            className={`btn btn-sm ${activeView === 'kanban' ? 'btn-secondary' : 'btn-ghost'}`}
            style={{
              padding: '3px 8px',
              fontSize: '0.75rem',
              borderRadius: 'var(--radius-xs)',
            }}
            onClick={() => setActiveView('kanban')}
          >
            <Kanban size={13} />
            <span>Board</span>
          </button>
          <button
            className={`btn btn-sm ${activeView === 'list' ? 'btn-secondary' : 'btn-ghost'}`}
            style={{
              padding: '3px 8px',
              fontSize: '0.75rem',
              borderRadius: 'var(--radius-xs)',
            }}
            onClick={() => setActiveView('list')}
          >
            <ListFilter size={13} />
            <span>List</span>
          </button>
        </div>
      </div>

      {/* Right: Search, Actions, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Search input with keyboard hint */}
        <div style={{ position: 'relative', width: '220px' }}>
          <Search
            size={13}
            style={{
              position: 'absolute',
              left: '9px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-dim)',
            }}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            style={{
              paddingLeft: '28px',
              paddingRight: '36px',
              paddingTop: '5px',
              paddingBottom: '5px',
              fontSize: '0.785rem',
              height: '30px',
            }}
          />
          <span
            style={{
              position: 'absolute',
              right: '6px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '0.65rem',
              color: 'var(--text-dim)',
              border: '1px solid var(--border-default)',
              padding: '1px 4px',
              borderRadius: '3px',
              fontFamily: 'var(--font-mono)',
              lineHeight: 1,
            }}
          >
            ⌘K
          </span>
        </div>

        {activeProject && (
          <button className="btn btn-primary btn-sm" onClick={onOpenCreateTask}>
            <Plus size={13} />
            <span>New Task</span>
          </button>
        )}

        <button
          className="btn btn-ghost btn-icon btn-sm"
          onClick={toggleTheme}
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              paddingLeft: '8px',
              borderLeft: '1px solid var(--border-subtle)',
            }}
          >
            <InitialsAvatar name={user.name} color={user.avatarColor} size="sm" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>
                {user.name}
              </span>
              <span style={{ fontSize: '0.675rem', color: 'var(--text-dim)', lineHeight: 1 }}>
                {user.email}
              </span>
            </div>
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={logout}
              title="Sign Out"
            >
              <LogOut size={13} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
