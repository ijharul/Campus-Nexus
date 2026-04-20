import React from 'react';

export const Card = ({ className = '', children, ...props }) => (
  <div
    className={`bg-white dark:bg-slate-800 border border-sky-100 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ className = '', children, ...props }) => (
  <div className={`px-6 py-4 border-b border-sky-50 dark:border-slate-700 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className = '', children, ...props }) => (
  <h3 className={`text-base font-semibold text-slate-900 dark:text-slate-100 ${className}`} {...props}>
    {children}
  </h3>
);

export const CardContent = ({ className = '', children, ...props }) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className = '', children, ...props }) => (
  <div className={`px-6 py-4 bg-sky-50/50 dark:bg-slate-900/50 border-t border-sky-50 dark:border-slate-700 ${className}`} {...props}>
    {children}
  </div>
);
