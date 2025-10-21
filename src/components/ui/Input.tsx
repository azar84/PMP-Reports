'use client';

import React, { useId } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex w-full rounded-lg border border-gray-200/10 bg-transparent px-4 py-2.5 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'focus-visible:ring-opacity-20',
        filled: 'focus-visible:ring-opacity-20',
        ghost: 'focus-visible:ring-opacity-20',
      },
      size: {
        sm: 'h-9 px-3 text-xs',
        md: 'h-11 px-4 text-sm',
        lg: 'h-13 px-5 text-base',
      },
      hasError: {
        true: 'border-[#EF4444] focus-visible:ring-red-500 focus-visible:border-[#EF4444]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  description?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size, 
    type = 'text',
    label,
    error,
    leftIcon,
    rightIcon,
    description,
    id,
    ...props 
  }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const hasError = !!error;

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--color-text-primary, #1F2937)' }}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div 
              className="absolute left-3 top-1/2 -translate-y-1/4"
              style={{ color: 'var(--color-text-secondary, #6B7280)' }}
            >
              {leftIcon}
            </div>
          )}
          
          <input
            id={inputId}
            type={type}
            className={cn(
              inputVariants({ variant, size, hasError, className }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10'
            )}
            style={{
              backgroundColor: variant === 'filled' ? 'var(--color-bg-secondary, #F9FAFB)' : 'transparent',
              borderColor: hasError ? 'var(--color-error, #EF4444)' : 'var(--color-border-light, rgba(229, 231, 235, 0.1))',
              color: 'var(--color-text-primary, #1F2937)'
            }}
            ref={ref}
            {...props}
          />
          <style jsx>{`
            input::placeholder {
              color: var(--color-text-muted, #9CA3AF) !important;
              opacity: 1;
            }
            input::-webkit-input-placeholder {
              color: var(--color-text-muted, #9CA3AF) !important;
              opacity: 1;
            }
            input::-moz-placeholder {
              color: var(--color-text-muted, #9CA3AF) !important;
              opacity: 1;
            }
            input:-ms-input-placeholder {
              color: var(--color-text-muted, #9CA3AF) !important;
              opacity: 1;
            }
            input:-moz-placeholder {
              color: var(--color-text-muted, #9CA3AF) !important;
              opacity: 1;
            }
          `}</style>
          
          {rightIcon && (
            <div 
              className="absolute right-3 top-1/2 -translate-y-1/4"
              style={{ color: 'var(--color-text-secondary, #6B7280)' }}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {(error || description) && (
          <div className="mt-2">
            {error && (
              <p 
                className="text-sm font-medium"
                style={{ color: 'var(--color-error, #EF4444)' }}
              >
                {error}
              </p>
            )}
            {description && !error && (
              <p 
                className="text-sm"
                style={{ color: 'var(--color-text-secondary, #6B7280)' }}
              >
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants }; 
