import React, { useState, useMemo } from 'react';
import { Task, TaskPriority } from '../types';
import Card from './Card';
import { PlusIcon, TrashIcon } from './Icons';

const PRIORITIES: TaskPriority[] = ['High', 'Medium', 'Low'];
const PRIORITY_STYLES: Record<TaskPriority, { border: string, text: string, bg: string }> = {
    'High': { border: 'border-rose-500', text: 'text-rose-500', bg: 'bg-rose-500/10' },
    'Medium': { border: 'border-amber-500', text: 'text-amber-500', bg: 'bg-amber-500/10' },
    'Low': { border: 'border-sky-500', text: 'text-sky-500', bg: 'bg-sky-500/10' },
};

interface TaskSchedulerProps {
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const TaskScheduler: React.FC<TaskSchedulerProps> = ({ tasks, setTasks }) => {
    const [taskText, setTaskText] = useState('');
    const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0]);
    const [taskTime, setTaskTime] = useState('');
    const [taskPriority, setTaskPriority] = useState<TaskPriority>('Medium');

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
    
    const { todaysTasks, futureTasks } = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const todays = tasks.filter(task => task.date === todayStr);
        const future = tasks.filter(task => task.date > todayStr);
        return { todaysTasks: todays, futureTasks: future };
    }, [tasks]);
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
                <Card title="Add New Task">
                    <form onSubmit={handleAddTask} className="flex flex-col gap-3">
                        <input type="text" value={taskText} onChange={(e) => setTaskText(e.target.value)} placeholder="New task..." className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <input type="date" value={taskDate} onChange={(e) => setTaskDate(e.target.value)} className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <div className="grid grid-cols-2 gap-2">
                            <input type="time" value={taskTime} onChange={(e) => setTaskTime(e.target.value)} className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <select value={taskPriority} onChange={e => setTaskPriority(e.target.value as TaskPriority)} className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <button type="submit" className="bg-blue-500 hover:bg-blue-600 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white rounded-lg p-2 transition-colors flex justify-center items-center gap-2"><PlusIcon /> Add Task</button>
                    </form>
                </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
                <Card title="Today's Tasks">
                    <ul className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                        {todaysTasks.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No tasks for today. Great job!</p>}
                        {todaysTasks.map(task => (
                            <li key={task.id} className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${PRIORITY_STYLES[task.priority].bg} ${PRIORITY_STYLES[task.priority].border}`}>
                                <div className="flex-grow cursor-pointer flex items-center gap-3" onClick={() => toggleTask(task.id)}>
                                    <input type="checkbox" checked={task.completed} readOnly className="form-checkbox h-5 w-5 rounded text-blue-500 dark:text-cyan-500 bg-slate-200 dark:bg-slate-600 border-slate-400 focus:ring-blue-500" />
                                    <div>
                                        <span className={`${task.completed ? 'line-through text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>{task.text}</span>
                                        {task.time && <p className="text-xs text-slate-500 dark:text-slate-400">{task.time}</p>}
                                    </div>
                                </div>
                                <button onClick={() => deleteTask(task.id)} className="text-slate-500 hover:text-rose-500 transition-colors"><TrashIcon /></button>
                            </li>
                        ))}
                    </ul>
                </Card>
                <Card title="Upcoming Tasks">
                    <ul className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                        {futureTasks.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No upcoming tasks scheduled.</p>}
                        {futureTasks.map(task => (
                            <li key={task.id} className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${PRIORITY_STYLES[task.priority].bg} ${PRIORITY_STYLES[task.priority].border}`}>
                                <div className="flex-grow cursor-pointer flex items-center gap-3" onClick={() => toggleTask(task.id)}>
                                     <input type="checkbox" checked={task.completed} readOnly className="form-checkbox h-5 w-5 rounded text-blue-500 dark:text-cyan-500 bg-slate-200 dark:bg-slate-600 border-slate-400 focus:ring-blue-500" />
                                     <div>
                                        <span className={`${task.completed ? 'line-through text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>{task.text}</span>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(task.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} {task.time}</p>
                                    </div>
                                </div>
                                <button onClick={() => deleteTask(task.id)} className="text-slate-500 hover:text-rose-500 transition-colors"><TrashIcon /></button>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </div>
    );
};

export default TaskScheduler;