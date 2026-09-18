import React from 'react';

interface InitialsAvatarProps {
  name: string;
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const InitialsAvatar: React.FC<InitialsAvatarProps> = ({
  name,
  color = '#4f46e5',
  size = 'md',
  className = '',
}) => {
  const getInitials = (text: string): string => {
    if (!text || !text.trim()) return '?';
    const parts = text.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);
  const sizeClass =
    size === 'xs'
      ? 'avatar-xs'
      : size === 'sm'
      ? 'avatar-sm'
      : size === 'lg'
      ? 'avatar-lg'
      : 'avatar-md';

  return (
    <div
      className={`initials-avatar ${sizeClass} ${className}`}
      style={{
        backgroundColor: color,
        border: '1px solid rgba(255, 255, 255, 0.15)',
      }}
      title={name}
      aria-label={name}
    >
      {initials}
    </div>
  );
};
