import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  className?: string;
}

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  pulse = false,
  className = '',
}: BadgeProps) => {
  const baseStyles = 'inline-flex items-center font-semibold rounded-full transition-all duration-200';
  
  const variants = {
    default: 'bg-gray-100 text-gray-800 border border-gray-300',
    primary: 'bg-primary/10 text-primary border border-primary/20',
    secondary: 'bg-accent/10 text-accent border border-accent/20',
    success: 'bg-green-100 text-green-800 border border-green-300',
    warning: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    danger: 'bg-red-100 text-red-800 border border-red-300',
    info: 'bg-blue-100 text-blue-800 border border-blue-300',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <motion.span
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${pulse ? 'animate-pulse' : ''} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.span>
  );
};

export default Badge;
