import { motion } from 'framer-motion';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

const Spinner = ({ size = 'md', color = 'primary', className = '' }: SpinnerProps) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const colors = {
    primary: 'border-primary border-t-transparent',
    secondary: 'border-accent border-t-transparent',
    white: 'border-white border-t-transparent',
  };

  return (
    <motion.div
      className={`rounded-full ${sizes[size]} ${colors[color]} ${className}`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
};

export default Spinner;
