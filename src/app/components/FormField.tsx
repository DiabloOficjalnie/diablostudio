import React from 'react'

// Simple classnames joiner to avoid extra deps
function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

// Shared base styles for form controls (white focus highlight)
export const inputBaseClasses =
  'w-full px-3 py-2 border border-gray-200 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus-visible:outline-none focus:ring-0 focus:border-white'
export const selectBaseClasses =
  'w-full px-3 py-2 border border-gray-200 rounded-md bg-white text-gray-900 focus:outline-none focus-visible:outline-none focus:ring-0 focus:border-white'
export const textareaBaseClasses =
  'w-full px-3 py-2 border border-gray-200 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus-visible:outline-none focus:ring-0 focus:border-white'

type FormFieldProps = {
  label?: string
  required?: boolean
  hint?: string
  className?: string
  children: React.ReactNode
}

export function FormField({ label, required, hint, className, children }: FormFieldProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required ? '*' : ''}
        </label>
      )}
      {children}
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  )
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { asChild?: boolean }
export function Input({ className, ...props }: InputProps) {
  return <input className={cn(inputBaseClasses, className)} {...props} />
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & { asChild?: boolean }
export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select className={cn(selectBaseClasses, className)} {...props}>
      {children}
    </select>
  )
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { asChild?: boolean }
export function Textarea({ className, ...props }: TextareaProps) {
  return <textarea className={cn(textareaBaseClasses, className)} {...props} />
}

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>
export function Checkbox({ className, ...props }: CheckboxProps) {
  // accent-gray-800 sets the check color; add focus ring white
  return (
    <input
      type="checkbox"
      className={cn('accent-gray-800 focus:ring-2 focus:ring-white', className)}
      {...props}
    />
  )
}

type RadioProps = React.InputHTMLAttributes<HTMLInputElement>
export function Radio({ className, ...props }: RadioProps) {
  return (
    <input
      type="radio"
      className={cn('accent-gray-800 focus:ring-2 focus:ring-white', className)}
      {...props}
    />
  )
}
