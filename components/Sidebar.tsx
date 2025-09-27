import React from 'react';
import { View, Theme } from '../App';
import { DashboardIcon, ExpensesIcon, JournalIcon, TasksIcon, ExamsIcon, EventsIcon, SunIcon, MoonIcon } from './Icons';

interface SidebarProps {
    currentView: View;
    setView: (view: View) => void;
    theme: Theme;
    toggleTheme: () => void;
}

const NavItem: React.FC<{
    viewName: View;
    label: string;
    icon: React.ReactNode;
    currentView: View;
    setView: (view: View) => void;
}> = ({ viewName, label, icon, currentView, setView }) => {
    const isActive = currentView === viewName;
    return (
        <button 
            onClick={() => setView(viewName)}
            className={`w-full flex items-center justify-center lg:justify-start space-x-4 p-3 rounded-lg transition-all duration-200 ${
                isActive 
                ? 'bg-blue-500/20 dark:bg-cyan-500/20 text-blue-600 dark:text-cyan-400' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            aria-current={isActive ? 'page' : undefined}
        >
            {icon}
            <span className="hidden lg:inline font-semibold">{label}</span>
        </button>
    );
};


const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, theme, toggleTheme }) => {
    return (
        <aside className="w-20 lg:w-64 bg-white dark:bg-slate-800 h-screen fixed top-0 left-0 flex flex-col p-4 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 z-40">
            <div className="flex items-center justify-center lg:justify-start space-x-2 mb-10">
                 <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-400 dark:from-cyan-500 dark:to-emerald-400 rounded-full flex items-center justify-center font-bold text-white text-xl font-display">
                    S
                </div>
                <h1 className="hidden lg:inline text-2xl font-bold font-display text-slate-800 dark:text-white">Studently</h1>
            </div>

            <nav className="flex-grow space-y-2">
                <NavItem viewName="dashboard" label="Dashboard" icon={<DashboardIcon />} currentView={currentView} setView={setView} />
                <NavItem viewName="expenses" label="Expenses" icon={<ExpensesIcon />} currentView={currentView} setView={setView} />
                <NavItem viewName="journal" label="Journal" icon={<JournalIcon />} currentView={currentView} setView={setView} />
                <NavItem viewName="tasks" label="Tasks" icon={<TasksIcon />} currentView={currentView} setView={setView} />
                <NavItem viewName="exams" label="Exam Prep" icon={<ExamsIcon />} currentView={currentView} setView={setView} />
                <NavItem viewName="events" label="Events" icon={<EventsIcon />} currentView={currentView} setView={setView} />
            </nav>

            <div className="mt-auto">
                 <button 
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-center lg:justify-start space-x-4 p-3 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                    {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                    <span className="hidden lg:inline font-semibold">
                       Switch Theme
                    </span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
