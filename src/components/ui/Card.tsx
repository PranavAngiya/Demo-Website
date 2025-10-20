import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  variant?: 'solid' | 'glass' | 'gradient';
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

const Card = ({
  children,
  variant = 'solid',
  hover = true,
  className = '',
  onClick,
}: CardProps) => {
  const baseStyles = 'rounded-2xl transition-all duration-300';
  
  const variants = {
    solid: 'bg-white border border-gray-100 shadow-card',
    glass: 'bg-white/70 backdrop-blur-lg border border-white/30 shadow-glass',
    gradient: 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-card',
  };

  const hoverStyles = hover ? 'hover:shadow-card-hover cursor-pointer' : '';

  return (
    <motion.div
      className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
      onClick={onClick}
      whileHover={hover ? { y: -4 } : undefined}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

export default Card;
