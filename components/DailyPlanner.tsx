import React, { useState, useMemo } from 'react';
import { Task, DailySummary, TaskPriority } from '../types';
import Card from './Card';
import { PlusIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';

const PRIORITIES: TaskPriority[] = ['High', 'Medium', 'Low'];
const PRIORITY_COLOR: Record<TaskPriority, string> = {
    'High': 'border-rose-500',
    'Medium': 'border-amber-500',
    'Low': 'border-sky-500',
};

interface DailyPlannerProps {
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    summaries: DailySummary[];
    setSummaries: React.Dispatch<React.SetStateAction<DailySummary[]>>;
}

const DailyPlanner: React.FC<DailyPlannerProps> = ({ tasks, setTasks, summaries, setSummaries }) => {
  const [taskText, setTaskText] = useState('');
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskTime, setTaskTime] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('Medium');
  const [summaryDate, setSummaryDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskText && taskDate) {
      const newTask: Task = {
        id: new Date().toISOString(),
        text: taskText,
        date: taskDate,
        time: taskTime,
        priority: taskPriority,
        completed: false,
      };
      setTasks([...tasks, newTask].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setTaskText('');
      setTaskTime('');
    }
  };
  
  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
  };
  
  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  const today = new Date().toISOString().split('T')[0];
  const todaysTasks = tasks.filter(task => task.date === today);
  const futureTasks = tasks.filter(task => task.date > today);
  
  const currentSummary = useMemo(() => summaries.find(s => s.date === summaryDate)?.content || '', [summaries, summaryDate]);

  const handleSummaryChange = (content: string) => {
      const otherSummaries = summaries.filter(s => s.date !== summaryDate);
      const newSummary: DailySummary = { date: summaryDate, content };
      setSummaries([...otherSummaries, newSummary]);
  }

  const changeSummaryDate = (offset: number) => {
      const newDate = new Date(summaryDate);
      newDate.setDate(newDate.getDate() + offset);
      setSummaryDate(newDate.toISOString().split('T')[0]);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Day Summary / Journal" headerContent={(
        <div className="flex items-center gap-2">
            <button onClick={() => changeSummaryDate(-1)} className="p-1 rounded-md bg-slate-700 hover:bg-slate-600"><ChevronLeftIcon /></button>
            <span className="text-sm font-semibold text-slate-300 w-28 text-center">{new Date(summaryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            <button onClick={() => changeSummaryDate(1)} className="p-1 rounded-md bg-slate-700 hover:bg-slate-600"><ChevronRightIcon /></button>
        </div>
      )}>
        <textarea
          value={currentSummary}
          onChange={(e) => handleSummaryChange(e.target.value)}
          placeholder={`What did you do on ${new Date(summaryDate).toLocaleDateString()}?`}
          className="w-full h-full min-h-[400px] bg-slate-700 border border-slate-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
        />
      </Card>
      
      <Card title="Task Scheduler">
        <form onSubmit={handleAddTask} className="flex flex-col gap-2 mb-4">
            <input type="text" value={taskText} onChange={(e) => setTaskText(e.target.value)} placeholder="New task..." className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            <div className="grid grid-cols-3 gap-2">
                <input type="date" value={taskDate} onChange={(e) => setTaskDate(e.target.value)} className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                <input type="time" value={taskTime} onChange={(e) => setTaskTime(e.target.value)} className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                <select value={taskPriority} onChange={e => setTaskPriority(e.target.value as TaskPriority)} className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
            <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 rounded-lg p-2 transition-colors flex justify-center items-center gap-2"><PlusIcon /> Add Task</button>
        </form>

        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
            <h3 className="font-semibold text-slate-300">Today's Tasks</h3>
            <ul className="space-y-2">
                {todaysTasks.length === 0 && <p className="text-slate-500 text-sm">No tasks for today.</p>}
                {todaysTasks.map(task => (
                    <li key={task.id} className={`flex items-center justify-between bg-slate-700/50 p-3 rounded-lg border-l-4 ${PRIORITY_COLOR[task.priority]}`}>
                        <div className="flex-grow cursor-pointer" onClick={() => toggleTask(task.id)}>
                            <span className={`${task.completed ? 'line-through text-slate-500' : ''}`}>{task.text}</span>
                            {task.time && <p className="text-xs text-slate-400">{task.time}</p>}
                        </div>
                        <button onClick={() => deleteTask(task.id)} className="text-slate-500 hover:text-rose-500 transition-colors"><TrashIcon /></button>
                    </li>
                ))}
            </ul>

            <h3 className="font-semibold text-slate-300 mt-4">Future Tasks</h3>
            <ul className="space-y-2">
                {futureTasks.length === 0 && <p className="text-slate-500 text-sm">No upcoming tasks.</p>}
                {futureTasks.map(task => (
                     <li key={task.id} className={`flex items-center justify-between bg-slate-700/50 p-3 rounded-lg border-l-4 ${PRIORITY_COLOR[task.priority]}`}>
                        <div className="flex-grow cursor-pointer" onClick={() => toggleTask(task.id)}>
                             <span className={`${task.completed ? 'line-through text-slate-500' : ''}`}>{task.text}</span>
                             <p className="text-xs text-slate-400">{new Date(task.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} {task.time}</p>
                        </div>
                        <button onClick={() => deleteTask(task.id)} className="text-slate-500 hover:text-rose-500 transition-colors"><TrashIcon /></button>
                    </li>
                ))}
            </ul>
        </div>
      </Card>
    </div>
  );
};

export default DailyPlanner;