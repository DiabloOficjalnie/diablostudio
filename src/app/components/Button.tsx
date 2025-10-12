import React from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
  className?: string;
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function variantClasses(variant: Variant) {
  switch (variant) {
    case 'primary':
      return 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500';
    case 'secondary':
      return 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 focus:ring-gray-400';
    case 'outline':
      return 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 focus:ring-blue-400';
    case 'danger':
      return 'bg-white border border-red-300 text-red-700 hover:bg-red-50 focus:ring-red-400';
    case 'ghost':
    default:
      return 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300';
  }
}

function sizeClasses(size: Size) {
  switch (size) {
    case 'sm':
      return 'px-3 py-1.5 text-xs';
    case 'lg':
      return 'px-5 py-2.5 text-base';
    case 'md':
    default:
      return 'px-4 py-2 text-sm';
  }
}

export default function Button({
  variant = 'primary',
  size = 'md',
  href,
  className,
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-md transition focus:outline-none focus:ring-2 focus:ring-offset-2';
  const composed = cn(base, variantClasses(variant), sizeClasses(size), disabled ? 'opacity-60 cursor-not-allowed' : '', className);

  if (href) {
    // Render as link-styled button
    return (
      <a href={href} className={composed} role="button" aria-disabled={disabled}>
        {children}
      </a>
    );
  }

  return (
    <button className={composed} disabled={disabled} {...rest}>
      {children}
    </button>
  );
}
