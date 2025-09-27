import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  headerContent?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children, className, headerContent }) => {
  return (
    <div className={`bg-white dark:bg-slate-800/50 rounded-2xl shadow-md dark:shadow-slate-900/50 p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-display font-bold text-slate-700 dark:text-cyan-400">{title}</h2>
        <div>{headerContent}</div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
};

export default Card;