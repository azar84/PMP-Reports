'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { getAdminPanelColorsWithDesignSystem, useDesignSystem } from '@/hooks/useDesignSystem';

const cardVariants = cva(
  'rounded-xl transition-all duration-300 ease-out group',
  {
    variants: {
      variant: {
        default: 'shadow-sm',
        outlined: 'bg-transparent border-2',
        elevated: 'shadow-lg shadow-black/5 border border-opacity-50',
        glass: 'glass backdrop-blur-xl bg-white/80 border border-white/20',
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
      hover: {
        true: 'hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1 hover:border-[#5243E9]/20 cursor-pointer',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      hover: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hover, children, ...props }, ref) => {
    const { designSystem } = useDesignSystem();
    const colors = getAdminPanelColorsWithDesignSystem(designSystem);
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, hover, className }))}
        style={{
          backgroundColor: variant === 'outlined' ? 'transparent' : 'var(--color-bg-secondary)',
          borderColor: 'var(--color-border-light)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border-light)',
          boxShadow: variant === 'outlined' ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.03)'
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card sub-components for better composition
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  return (
    <h3
      ref={ref}
      className={cn('font-semibold text-lg leading-none tracking-tight', className)}
      style={{ color: 'var(--color-text-primary)' }}
      {...props}
    >
      {children}
    </h3>
  );
});
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { designSystem } = useDesignSystem();
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  return (
    <p
      ref={ref}
      className={cn('text-sm', className)}
      style={{ color: 'var(--color-text-secondary)' }}
      {...props}
    />
  );
});
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn('pt-0', className)} 
    {...props} 
  />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-6', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
}; 
