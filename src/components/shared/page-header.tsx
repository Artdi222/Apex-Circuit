import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="relative mb-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600/80">APEX Circuit</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="text-base text-gray-500 max-w-2xl leading-relaxed mt-4">
              {description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {children}
        </div>
      </div>
    </div>
  );
}
