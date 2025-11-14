import { motion } from 'framer-motion';

interface CheckmarkAnimationProps {
  size?: number;
  color?: string;
  duration?: number;
}

const CheckmarkAnimation = ({ 
  size = 64, 
  color = '#10B981', 
  duration = 0.6 
}: CheckmarkAnimationProps) => {
  const circleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: duration * 0.4,
        ease: [0.34, 1.56, 0.64, 1] as any // Elastic ease
      }
    }
  };

  const checkmarkVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: duration * 0.6,
        delay: duration * 0.3,
        ease: 'easeOut' as any
      }
    }
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        duration: duration * 0.3,
        ease: [0.34, 1.56, 0.64, 1] as any
      }}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle */}
        <motion.circle
          cx="32"
          cy="32"
          r="30"
          fill={color}
          opacity="0.1"
          variants={circleVariants}
          initial="hidden"
          animate="visible"
        />
        
        {/* Main circle */}
        <motion.circle
          cx="32"
          cy="32"
          r="28"
          stroke={color}
          strokeWidth="3"
          fill="none"
          variants={circleVariants}
          initial="hidden"
          animate="visible"
        />
        
        {/* Checkmark */}
        <motion.path
          d="M20 32L28 40L44 24"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          variants={checkmarkVariants}
          initial="hidden"
          animate="visible"
        />
      </svg>
    </motion.div>
  );
};

export default CheckmarkAnimation;
