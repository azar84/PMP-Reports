'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const toggleVariants = cva(
  'relative inline-flex items-center cursor-pointer transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-full',
  {
    variants: {
      size: {
        sm: 'w-10 h-5',
        md: 'w-11 h-6',
        lg: 'w-14 h-7',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const toggleThumbVariants = cva(
  'absolute transition-all duration-300 rounded-full shadow-md transform',
  {
    variants: {
      size: {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface ToggleProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof toggleVariants> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success';
}

const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      className,
      size = 'md',
      variant = 'default',
      checked,
      disabled,
      id,
      onChange,
      style,
      ...props
    },
    ref
  ) => {
    const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;
    
    const getToggleStyles = (): React.CSSProperties => {
      const baseStyles: React.CSSProperties = {
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        ...style,
      };

      if (disabled) {
        return {
          ...baseStyles,
          backgroundColor: checked ? 'rgba(156, 163, 175, 0.5)' : '#E5E7EB',
          cursor: 'not-allowed',
        };
      }

      if (checked) {
        // Use CSS variables if available, otherwise fallback to default colors
        if (variant === 'success') {
          return {
            ...baseStyles,
            backgroundColor: 'var(--color-success)',
            cursor: 'pointer',
          };
        }
        return {
          ...baseStyles,
          backgroundColor: 'var(--color-primary)',
          cursor: 'pointer',
        };
      }

      return {
        ...baseStyles,
        backgroundColor: '#D1D5DB',
        cursor: 'pointer',
      };
    };

    const getThumbStyles = (): React.CSSProperties => {
      const thumbOffset = {
        sm: checked ? '22px' : '2px',
        md: checked ? '26px' : '2px',
        lg: checked ? '32px' : '2px',
      }[size || 'md'];

      return {
        left: thumbOffset,
        backgroundColor: '#FFFFFF',
        top: '50%',
        transform: 'translateY(-50%)',
      };
    };

    const toggleStyles = getToggleStyles();
    const thumbStyles = getThumbStyles();

    return (
      <label
        htmlFor={toggleId}
        className={cn(toggleVariants({ size, className }))}
        style={{
          ...toggleStyles,
          ...(disabled ? {} : {
            transition: 'background-color 0.3s ease, transform 0.2s ease',
          }),
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.opacity = '0.9';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.opacity = '1';
          }
        }}
        onMouseDown={(e) => {
          if (!disabled) {
            e.currentTarget.style.transform = 'scale(0.98)';
          }
        }}
        onMouseUp={(e) => {
          if (!disabled) {
            e.currentTarget.style.transform = 'scale(1)';
          }
        }}
      >
        <input
          type="checkbox"
          id={toggleId}
          ref={ref}
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className="sr-only"
          {...props}
        />
        <span
          className={cn(toggleThumbVariants({ size }))}
          style={thumbStyles}
        />
      </label>
    );
  }
);

Toggle.displayName = 'Toggle';

export { Toggle, toggleVariants };

