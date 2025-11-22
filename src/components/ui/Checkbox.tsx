'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const checkboxVariants = cva(
  'relative inline-flex items-center justify-center cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none',
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

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof checkboxVariants> {
  variant?: 'light' | 'dark' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  description?: string;
  error?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
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
      ...props
    },
    ref
  ) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    // Get styles based on variant and checked state
    const getCheckboxStyles = (): React.CSSProperties => {
      const baseStyles: React.CSSProperties = {
        borderRadius: '4px',
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
          borderColor: variant === 'dark' ? '#4B5563' : '#D1D5DB',
          backgroundColor: variant === 'dark' ? '#374151' : '#F3F4F6',
          cursor: 'not-allowed',
        };
      }

      if (checked) {
        switch (variant) {
          case 'dark':
            return {
              ...baseStyles,
              borderColor: '#3B82F6',
              backgroundColor: '#3B82F6',
            };
          case 'primary':
            return {
              ...baseStyles,
              borderColor: 'var(--color-primary, #EF2908)',
              backgroundColor: 'var(--color-primary, #EF2908)',
            };
          default: // light
            return {
              ...baseStyles,
              borderColor: 'var(--color-primary, #3B82F6)',
              backgroundColor: 'var(--color-primary, #3B82F6)',
            };
        }
      }

      // Unchecked state
      switch (variant) {
        case 'dark':
          return {
            ...baseStyles,
            borderColor: '#6B7280',
            backgroundColor: '#1F2937',
          };
        case 'primary':
          return {
            ...baseStyles,
            borderColor: hasError ? '#EF4444' : 'var(--color-border-light, #D1D5DB)',
            backgroundColor: 'var(--color-bg-primary, #FFFFFF)',
          };
        default: // light
          return {
            ...baseStyles,
            borderColor: hasError ? '#EF4444' : 'var(--color-border-light, #D1D5DB)',
            backgroundColor: 'var(--color-bg-primary, #FFFFFF)',
          };
      }
    };

    const checkboxStyles = getCheckboxStyles();
    const iconColor = checked ? '#FFFFFF' : 'transparent';

    const iconSize = {
      sm: 10,
      md: 14,
      lg: 16,
    }[size];

    const checkboxElement = (
      <div className="relative inline-flex items-center justify-center">
        <input
          type="checkbox"
          id={checkboxId}
          ref={ref}
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className={cn(checkboxVariants({ variant, size, className }))}
          style={checkboxStyles}
          {...props}
        />
        {checked && (
          <Check
            size={iconSize}
            className="absolute pointer-events-none"
            style={{
              color: iconColor,
              strokeWidth: 2.5,
            }}
          />
        )}
        <style jsx>{`
          input[type="checkbox"]::-webkit-appearance {
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
          }
          input[type="checkbox"]:hover:not(:disabled) {
            border-color: ${checked 
              ? (variant === 'dark' ? '#2563EB' : 'var(--color-primary, #3B82F6)')
              : (variant === 'dark' ? '#9CA3AF' : 'var(--color-border-strong, #9CA3AF)')} !important;
            transform: scale(1.05);
          }
          input[type="checkbox"]:active:not(:disabled) {
            transform: scale(0.95);
          }
          input[type="checkbox"]:focus-visible {
            outline: 2px solid var(--color-primary, #3B82F6);
            outline-offset: 2px;
            border-radius: 4px;
          }
        `}</style>
      </div>
    );

    if (label || description || error) {
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-start gap-2">
            {checkboxElement}
            {(label || description || error) && (
              <div className="flex flex-col">
                {label && (
                  <label
                    htmlFor={checkboxId}
                    className="text-sm font-medium cursor-pointer select-none"
                    style={{
                      color: hasError ? '#EF4444' : 'var(--color-text-primary, #1F2937)',
                    }}
                  >
                    {label}
                  </label>
                )}
                {description && (
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: 'var(--color-text-secondary, #6B7280)' }}
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

    return checkboxElement;
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox, checkboxVariants };
