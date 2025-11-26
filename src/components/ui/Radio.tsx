'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Circle } from 'lucide-react';

const radioVariants = cva(
  'relative inline-flex items-center justify-center cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none rounded-full',
  {
    variants: {
      variant: {
        light: '',
        dark: '',
        primary: '',
      },
      size: {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
      },
    },
    defaultVariants: {
      variant: 'light',
      size: 'md',
    },
  }
);

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof radioVariants> {
  variant?: 'light' | 'dark' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  description?: string;
  error?: string;
  colors?: Record<string, string>; // Design system colors
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      className,
      variant = 'light',
      size = 'md',
      label,
      description,
      error,
      checked,
      disabled,
      id,
      onChange,
      style,
      colors,
      ...props
    },
    ref
  ) => {
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    // Get styles based on variant and checked state
    const getRadioStyles = (): React.CSSProperties => {
      const baseStyles: React.CSSProperties = {
        borderRadius: '50%',
        borderWidth: '2px',
        borderStyle: 'solid',
        position: 'relative',
        minWidth: size === 'sm' ? '16px' : size === 'md' ? '20px' : '24px',
        minHeight: size === 'sm' ? '16px' : size === 'md' ? '20px' : '24px',
        width: size === 'sm' ? '16px' : size === 'md' ? '20px' : '24px',
        height: size === 'sm' ? '16px' : size === 'md' ? '20px' : '24px',
        ...style,
      };

      if (disabled) {
        return {
          ...baseStyles,
          borderColor: colors?.borderLight || '#D1D5DB',
          backgroundColor: colors?.backgroundPrimary || '#F3F4F6',
          cursor: 'not-allowed',
        };
      }

      if (checked) {
        const primaryColor = colors?.primary || 'var(--color-primary, #3B82F6)';
        return {
          ...baseStyles,
          borderColor: primaryColor,
          backgroundColor: colors?.backgroundPrimary || '#FFFFFF',
        };
      }

      // Unchecked state
      return {
        ...baseStyles,
        borderColor: hasError ? '#EF4444' : (colors?.borderLight || 'var(--color-border-light, #D1D5DB)'),
        backgroundColor: colors?.backgroundPrimary || 'var(--color-bg-primary, #FFFFFF)',
      };
    };

    const radioStyles = getRadioStyles();
    const primaryColor = colors?.primary || 'var(--color-primary, #3B82F6)';

    const dotSize = {
      sm: 8,
      md: 10,
      lg: 12,
    }[size];

    const radioElement = (
      <div className="relative inline-flex items-center justify-center">
        <input
          type="radio"
          id={radioId}
          ref={ref}
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className={cn(radioVariants({ variant, size, className }))}
          style={radioStyles}
          {...props}
        />
        {checked && (
          <Circle
            size={dotSize}
            fill={primaryColor}
            className="absolute pointer-events-none"
            style={{
              strokeWidth: 0,
            }}
          />
        )}
        <style jsx>{`
          input[type="radio"]::-webkit-appearance {
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
          }
          input[type="radio"]:hover:not(:disabled) {
            border-color: ${checked 
              ? primaryColor
              : (colors?.borderStrong || 'var(--color-border-strong, #9CA3AF)')} !important;
            transform: scale(1.05);
          }
          input[type="radio"]:active:not(:disabled) {
            transform: scale(0.95);
          }
          input[type="radio"]:focus-visible {
            outline: 2px solid ${primaryColor};
            outline-offset: 2px;
            border-radius: 50%;
          }
        `}</style>
      </div>
    );

    if (label || description || error) {
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-start gap-2">
            {radioElement}
            {(label || description || error) && (
              <div className="flex flex-col">
                {label && (
                  <label
                    htmlFor={radioId}
                    className="text-sm font-medium cursor-pointer select-none"
                    style={{
                      color: hasError ? '#EF4444' : (colors?.textPrimary || 'var(--color-text-primary, #1F2937)'),
                    }}
                  >
                    {label}
                  </label>
                )}
                {description && (
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: colors?.textSecondary || 'var(--color-text-secondary, #6B7280)' }}
                  >
                    {description}
                  </p>
                )}
                {error && (
                  <p className="text-xs mt-0.5" style={{ color: '#EF4444' }}>
                    {error}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return radioElement;
  }
);

Radio.displayName = 'Radio';

export { Radio, radioVariants };

