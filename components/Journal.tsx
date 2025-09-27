import React, { useState, useMemo } from 'react';
import { DailySummary } from '../types';
import Card from './Card';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface JournalProps {
    summaries: DailySummary[];
    setSummaries: React.Dispatch<React.SetStateAction<DailySummary[]>>;
}

const Journal: React.FC<JournalProps> = ({ summaries, setSummaries }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const dateString = useMemo(() => currentDate.toISOString().split('T')[0], [currentDate]);
    
    const currentSummary = useMemo(() => summaries.find(s => s.date === dateString)?.content || '', [summaries, dateString]);

    const handleSummaryChange = (content: string) => {
        const otherSummaries = summaries.filter(s => s.date !== dateString);
        const newSummary: DailySummary = { date: dateString, content };
        setSummaries([...otherSummaries, newSummary].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }

    const changeDate = (offset: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + offset);
        setCurrentDate(newDate);
    }
    
    const isToday = useMemo(() => {
        return new Date().toISOString().split('T')[0] === dateString;
    }, [dateString]);

    return (
        <Card title="Daily Journal" headerContent={(
            <div className="flex items-center gap-2">
                <button onClick={() => changeDate(-1)} className="p-1 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600"><ChevronLeftIcon /></button>
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 w-32 text-center">
                    {isToday ? 'Today' : currentDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                <button onClick={() => changeDate(1)} className="p-1 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600"><ChevronRightIcon /></button>
            </div>
        )}>
            <textarea
            value={currentSummary}
            onChange={(e) => handleSummaryChange(e.target.value)}
            placeholder={`What did you do today?`}
            className="w-full h-full min-h-[60vh] bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-sans"
            />
      </Card>
    );
};

export default Journal;