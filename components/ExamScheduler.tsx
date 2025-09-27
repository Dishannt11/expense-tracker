import React, { useState, useMemo } from 'react';
import { ExamPrep, PrepProgress } from '../types';
import Card from './Card';
import { PlusIcon, TrashIcon } from './Icons';

const PROGRESS_STATES: PrepProgress[] = ['Not Started', 'In Progress', 'Completed'];
const PROGRESS_STYLES: Record<PrepProgress, { bg: string; text: string; ring: string }> = {
    'Not Started': { bg: 'bg-slate-500 dark:bg-slate-600', text: 'text-white dark:text-slate-200', ring: 'ring-slate-500' },
    'In Progress': { bg: 'bg-amber-500 dark:bg-amber-500', text: 'text-white dark:text-amber-50', ring: 'ring-amber-400' },
    'Completed': { bg: 'bg-green-500 dark:bg-emerald-500', text: 'text-white dark:text-emerald-50', ring: 'ring-emerald-400' },
};

interface ExamSchedulerProps {
    examPreps: ExamPrep[];
    setExamPreps: React.Dispatch<React.SetStateAction<ExamPrep[]>>;
}

const ExamScheduler: React.FC<ExamSchedulerProps> = ({ examPreps, setExamPreps }) => {
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [prepDate, setPrepDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddPrep = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject && topic && prepDate) {
      const newPrep: ExamPrep = {
        id: new Date().toISOString(),
        subject,
        topic,
        date: prepDate,
        progress: 'Not Started',
      };
      setExamPreps([...examPreps, newPrep].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setSubject('');
      setTopic('');
    }
  };

  const updateProgress = (id: string) => {
    setExamPreps(examPreps.map(prep => {
        if (prep.id === id) {
            const currentIndex = PROGRESS_STATES.indexOf(prep.progress);
            const nextIndex = (currentIndex + 1) % PROGRESS_STATES.length;
            return { ...prep, progress: PROGRESS_STATES[nextIndex] };
        }
        return prep;
    }));
  };
  
  const deletePrep = (id: string) => {
    setExamPreps(examPreps.filter(prep => prep.id !== id));
  };
  
  const groupedBySubject = useMemo(() => {
    return examPreps.reduce((acc, prep) => {
        (acc[prep.subject] = acc[prep.subject] || []).push(prep);
        return acc;
    }, {} as Record<string, ExamPrep[]>);
  }, [examPreps]);

  return (
    <div className="space-y-6">
        <Card title="Add New Study Session">
            <form onSubmit={handleAddPrep} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject (e.g., Math)" className="md:col-span-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic (e.g., Algebra)" className="md:col-span-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="date" value={prepDate} onChange={(e) => setPrepDate(e.target.value)} className="md:col-span-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="submit" className="md:col-span-1 bg-blue-500 hover:bg-blue-600 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white rounded-lg p-2 transition-colors flex justify-center items-center gap-2">
                <PlusIcon /> Add Prep
                </button>
            </form>
        </Card>
        
        <div className="space-y-6">
            {Object.keys(groupedBySubject).length === 0 && <p className="text-slate-500 text-center py-8">No exam prep sessions scheduled.</p>}
            {Object.entries(groupedBySubject).map(([subject, preps]) => {
                const completedCount = preps.filter(p => p.progress === 'Completed').length;
                const progress = (completedCount / preps.length) * 100;

                return (
                <Card key={subject} title={subject}>
                    <div className="mb-4">
                        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-1">
                           <span>Progress</span>
                           <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                            <div 
                                className="bg-blue-500 dark:bg-cyan-500 h-2.5 rounded-full transition-all duration-500" 
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                    {preps.map(prep => (
                        <div key={prep.id} className={`flex items-center p-3 rounded-lg transition-all bg-slate-100 dark:bg-slate-700/50`}>
                            <div className="flex-grow">
                                <p className={`font-semibold ${prep.progress === 'Completed' ? 'text-slate-500 line-through' : 'text-slate-800 dark:text-slate-200'}`}>{prep.topic}</p>
                                <p className={`text-sm ${prep.progress === 'Completed' ? 'text-slate-500' : 'text-slate-500 dark:text-slate-400'}`}>{new Date(prep.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <button onClick={() => updateProgress(prep.id)} className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 ${PROGRESS_STYLES[prep.progress].bg} ${PROGRESS_STYLES[prep.progress].text} ${PROGRESS_STYLES[prep.progress].ring}`}>
                                    {prep.progress}
                                </button>
                                <button onClick={() => deletePrep(prep.id)} className="text-slate-500 hover:text-rose-500 transition-colors">
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    ))}
                    </div>
                </Card>
                )
            })}
        </div>
    </div>
  );
};

export default ExamScheduler;