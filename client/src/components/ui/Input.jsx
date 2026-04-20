import React from 'react';

const Input = React.forwardRef(({
  className = '',
  icon: Icon,
  error,
  ...props
}, ref) => {
  return (
    <div className="w-full relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
        </div>
      )}
      <input
        ref={ref}
        className={`
          block w-full rounded-lg border py-2.5 text-sm transition-all
          bg-white dark:bg-slate-800
          text-slate-900 dark:text-slate-100
          placeholder-slate-400 dark:placeholder-slate-500
          ${error
            ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
            : 'border-sky-200 dark:border-slate-600 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-sky-500 dark:focus:border-sky-400'
          }
          focus:outline-none focus:ring-2
          ${Icon ? 'pl-10 pr-3' : 'px-3'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
