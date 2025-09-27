import React, { useState, useEffect } from 'react';
import Calculator from './components/Calculator';
import ExpenseTracker from './components/ExpenseTracker';
import ExamScheduler from './components/ExamScheduler';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Journal from './components/Journal';
import TaskScheduler from './components/TaskScheduler';
import Events from './components/Events';
import useLocalStorage from './hooks/useLocalStorage';
import { Expense, Task, ExamPrep, DailySummary, Event } from './types';

export type View = 'dashboard' | 'expenses' | 'journal' | 'tasks' | 'exams' | 'events';
export type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'light');
  
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', []);
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [examPreps, setExamPreps] = useLocalStorage<ExamPrep[]>('examPreps', []);
  const [summaries, setSummaries] = useLocalStorage<DailySummary[]>('daySummaries', []);
  const [events, setEvents] = useLocalStorage<Event[]>('events', []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  const renderView = () => {
      switch (view) {
          case 'dashboard':
              return <Dashboard expenses={expenses} tasks={tasks} examPreps={examPreps} setView={setView} />;
          case 'expenses':
              return <ExpenseTracker expenses={expenses} setExpenses={setExpenses} />;
          case 'journal':
              return <Journal summaries={summaries} setSummaries={setSummaries} />;
          case 'tasks':
              return <TaskScheduler tasks={tasks} setTasks={setTasks} />;
          case 'exams':
              return <ExamScheduler examPreps={examPreps} setExamPreps={setExamPreps} />;
          case 'events':
              return <Events events={events} setEvents={setEvents} />;
          default:
              return <Dashboard expenses={expenses} tasks={tasks} examPreps={examPreps} setView={setView}/>;
      }
  }

  return (
    <div className="min-h-screen font-sans">
      <div className="flex">
        <Sidebar currentView={view} setView={setView} theme={theme} toggleTheme={toggleTheme} />
        
        <main className="flex-1 transition-all duration-300 ml-20 lg:ml-64 p-4 sm:p-6 lg:p-8">
           <div className="max-w-7xl mx-auto">
             {renderView()}
           </div>
        </main>
        
        <Calculator />
      </div>
    </div>
  );
};

export default App;
