import React from 'react';

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'purple';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  dot = false,
  className = '',
}) => {
  const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string; dotColor: string }> = {
    success: {
      bg: 'bg-emerald-950/40',
      text: 'text-emerald-300',
      border: 'border-emerald-800/40',
      dotColor: 'bg-emerald-400',
    },
    warning: {
      bg: 'bg-amber-950/40',
      text: 'text-amber-300',
      border: 'border-amber-800/40',
      dotColor: 'bg-amber-400',
    },
    danger: {
      bg: 'bg-red-950/40',
      text: 'text-red-300',
      border: 'border-red-800/40',
      dotColor: 'bg-red-400',
    },
    info: {
      bg: 'bg-blue-950/40',
      text: 'text-blue-300',
      border: 'border-blue-800/40',
      dotColor: 'bg-blue-400',
    },
    neutral: {
      bg: 'bg-zinc-800/50',
      text: 'text-zinc-300',
      border: 'border-zinc-700/40',
      dotColor: 'bg-zinc-400',
    },
    purple: {
      bg: 'bg-purple-950/40',
      text: 'text-purple-300',
      border: 'border-purple-800/40',
      dotColor: 'bg-purple-400',
    },
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  };

  const style = variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      className={`inline-flex items-center rounded-md border ${style.bg} ${style.text} ${style.border} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${style.dotColor}`} />}
      {children}
    </span>
  );
};

// Automatic status badge mapper for consistency
export const StatusBadge: React.FC<{ status: string; size?: 'sm' | 'md' }> = ({ status, size = 'sm' }) => {
  let variant: BadgeVariant = 'neutral';

  const normalized = status.toLowerCase();

  if (
    normalized === 'present' ||
    normalized === 'completed' ||
    normalized === 'paid' ||
    normalized === 'in stock' ||
    normalized === 'active'
  ) {
    variant = 'success';
  } else if (
    normalized === 'late' ||
    normalized === 'processing' ||
    normalized === 'low stock' ||
    normalized === 'in progress' ||
    normalized === 'medium' ||
    normalized === 'high'
  ) {
    variant = 'warning';
  } else if (
    normalized === 'absent' ||
    normalized === 'failed' ||
    normalized === 'cancelled' ||
    normalized === 'out of stock' ||
    normalized === 'urgent' ||
    normalized === 'terminated'
  ) {
    variant = 'danger';
  } else if (
    normalized === 'on leave' ||
    normalized === 'pending' ||
    normalized === 'to do' ||
    normalized === 'low'
  ) {
    variant = 'info';
  }

  return (
    <Badge variant={variant} size={size} dot>
      {status}
    </Badge>
  );
};
