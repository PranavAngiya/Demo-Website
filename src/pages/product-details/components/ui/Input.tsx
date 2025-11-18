import { forwardRef, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  onClear?: () => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, onClear, className = '', value, placeholder, type, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value !== undefined && value !== '';
    const hasPlaceholder = placeholder !== undefined && placeholder !== '';
    const isDateInput = type === 'date' || type === 'time' || type === 'datetime-local';
    
    // Label should float when focused, has value, has placeholder, OR is a date/time input
    const shouldFloat = isFocused || hasValue || hasPlaceholder || isDateInput;

    return (
      <div className="w-full">
        <div className="relative">
          {/* Floating Label */}
          {label && (
            <motion.label
              className={`absolute left-3 pointer-events-none transition-all duration-200 ${
                shouldFloat
                  ? '-top-2.5 text-xs bg-white px-2 text-brand font-medium'
                  : 'top-3 text-base text-gray-500'
              }`}
              initial={false}
              animate={{
                y: shouldFloat ? 0 : 0,
              }}
            >
              {label}
            </motion.label>
          )}

          {/* Icon */}
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            type={type}
            value={value}
            placeholder={placeholder}
            className={`
              w-full px-4 py-3 
              ${icon ? 'pl-10' : ''} 
              ${label ? 'pt-4' : ''}
              border-2 rounded-lg
              transition-all duration-200
              focus:outline-none
              ${
                error
                  ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200'
                  : 'border-gray-300 focus:border-brand focus:ring-2 focus:ring-brand-accent/20'
              }
              disabled:bg-gray-50 disabled:cursor-not-allowed
              ${className}
            `}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {/* Clear Button */}
          {onClear && hasValue && (
            <motion.button
              type="button"
              onClick={onClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          )}
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.p
              className="mt-1 text-sm text-red-600"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
