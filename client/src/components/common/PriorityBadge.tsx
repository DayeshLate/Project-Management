import React from 'react';
import { Priority } from '../../types';

interface PriorityBadgeProps {
  priority: Priority;
  compact?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, compact = false }) => {
  const getConfig = () => {
    switch (priority) {
      case 'URGENT':
        return {
          label: 'Urgent',
          dot: '#ef4444',
          color: '#fca5a5',
          bg: 'rgba(239, 68, 68, 0.12)',
          border: 'rgba(239, 68, 68, 0.25)',
        };
      case 'HIGH':
        return {
          label: 'High',
          dot: '#f59e0b',
          color: '#fcd34d',
          bg: 'rgba(245, 158, 11, 0.12)',
          border: 'rgba(245, 158, 11, 0.25)',
        };
      case 'MEDIUM':
        return {
          label: 'Medium',
          dot: '#3b82f6',
          color: '#93c5fd',
          bg: 'rgba(59, 130, 246, 0.12)',
          border: 'rgba(59, 130, 246, 0.25)',
        };
      case 'LOW':
      default:
        return {
          label: 'Low',
          dot: '#10b981',
          color: '#6ee7b7',
          bg: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.25)',
        };
    }
  };

  const { label, dot, color, bg, border } = getConfig();

  if (compact) {
    return (
      <span
        title={`Priority: ${label}`}
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: dot,
          display: 'inline-block',
          boxShadow: `0 0 5px ${dot}80`,
        }}
      />
    );
  }

  return (
    <span
      className="badge"
      style={{
        backgroundColor: bg,
        color,
        border: `1px solid ${border}`,
        fontSize: '0.7rem',
        padding: '1px 6px',
        fontWeight: 500,
      }}
    >
      <span
        style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          backgroundColor: dot,
          display: 'inline-block',
        }}
      />
      <span>{label}</span>
    </span>
  );
};
