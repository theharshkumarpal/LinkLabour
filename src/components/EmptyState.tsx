import React from 'react';
import { SearchX, Inbox, Compass } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message: string;
  iconType?: 'search' | 'inbox' | 'compass';
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, message, iconType = 'search' }) => {
  const Icon = iconType === 'search' ? SearchX : iconType === 'inbox' ? Inbox : Compass;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 bg-bg-inset rounded-2xl border border-dashed border-border-color text-center animate-[fadeIn_0.5s_ease]">
      <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mb-6">
        <Icon size={32} color="var(--primary)" />
      </div>
      <h3 className="text-xl font-extrabold text-text-primary mb-2">
        {title}
      </h3>
      <p className="text-text-muted text-sm max-w-[300px]">
        {message}
      </p>
    </div>
  );
};
