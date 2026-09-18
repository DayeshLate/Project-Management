import React from 'react';
import { TaskStatus } from '../../types';

interface StatusBadgeProps {
  status: TaskStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusData = () => {
    switch (status) {
      case 'BACKLOG':
        return { label: 'Backlog', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)' };
      case 'TODO':
        return { label: 'To Do', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.1)' };
      case 'IN_PROGRESS':
        return { label: 'In Progress', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)' };
      case 'IN_REVIEW':
        return { label: 'In Review', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.1)' };
      case 'DONE':
        return { label: 'Done', color: '#34d399', bg: 'rgba(52, 211, 153, 0.1)' };
      default:
        return { label: status, color: '#e2e8f0', bg: 'rgba(255, 255, 255, 0.05)' };
    }
  };

  const { label, color, bg } = getStatusData();

  return (
    <span
      className="badge"
      style={{
        backgroundColor: bg,
        color,
        border: `1px solid ${color}30`,
        fontSize: '0.7rem',
        padding: '2px 7px',
        fontWeight: 500,
      }}
    >
      <span
        style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          backgroundColor: color,
          display: 'inline-block',
        }}
      />
      {label}
    </span>
  );
};
