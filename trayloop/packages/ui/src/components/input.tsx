import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, ...props }, ref) => {
    return (
      <div>
        {label && <label htmlFor={id}>{label}</label>}
        <input ref={ref} id={id} aria-invalid={!!error} {...props} />
        {error && <p role="alert">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
