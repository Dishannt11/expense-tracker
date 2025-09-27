import React, { useMemo } from 'react';
import { Expense, Task, ExamPrep, ExpenseCategory } from '../types';
import Card from './Card';
import { ExpensesIcon, TasksIcon, ExamsIcon } from './Icons';
import PieChart from './PieChart';
import { View } from '../App';

interface DashboardProps {
    expenses: Expense[];
    tasks: Task[];
    examPreps: ExamPrep[];
    setView: (view: View) => void;
}

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
    Food: '#34D399', Travel: '#60A5FA', Study: '#FBBF24',
    Entertainment: '#F472B6', Other: '#9CA3AF',
};

const QuickStat: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    colorClass: string;
}> = ({ icon, label, value, colorClass }) => (
    <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-xl flex items-center gap-4">
        <div className={`p-3 rounded-full ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</p>
            <p className="text-2xl font-bold font-display text-slate-800 dark:text-white">{value}</p>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ expenses, tasks, examPreps, setView }) => {
    
    const { totalSpentMonth, tasksToday, upcomingPreps } = useMemo(() => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        
        const totalSpentMonth = expenses
            .filter(e => {
                const eDate = new Date(e.date);
                return eDate.getFullYear() === now.getFullYear() && eDate.getMonth() === now.getMonth();
            })
            .reduce((sum, e) => sum + e.amount, 0);

        const tasksToday = tasks.filter(t => t.date === todayStr && !t.completed).length;

        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);
        const upcomingPreps = examPreps.filter(p => {
            const pDate = new Date(p.date);
            return pDate >= now && pDate <= nextWeek && p.progress !== 'Completed';
        }).length;

        return { totalSpentMonth, tasksToday, upcomingPreps };
    }, [expenses, tasks, examPreps]);
    
    const monthlyCategoryData = useMemo(() => {
        const now = new Date();
        const monthlyExpenses = expenses.filter(e => {
             const eDate = new Date(e.date);
             return eDate.getFullYear() === now.getFullYear() && eDate.getMonth() === now.getMonth();
        });

        const totals = monthlyExpenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
        }, {} as Record<ExpenseCategory, number>);

        return Object.entries(totals).map(([name, value]) => ({
            name: name as ExpenseCategory,
            value,
            color: CATEGORY_COLORS[name as ExpenseCategory]
        })).sort((a, b) => b.value - a.value);
    }, [expenses]);


    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl sm:text-4xl font-bold font-display text-slate-800 dark:text-white">Welcome Back!</h1>
                <p className="text-slate-500 dark:text-slate-400">Here's your summary for today.</p>
            </header>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <QuickStat icon={<ExpensesIcon />} label="Spent this Month" value={`₹${totalSpentMonth.toFixed(2)}`} colorClass="bg-green-500/20 text-green-500" />
                <QuickStat icon={<TasksIcon />} label="Tasks for Today" value={tasksToday} colorClass="bg-blue-500/20 text-blue-500" />
                <QuickStat icon={<ExamsIcon />} label="Preps Next 7 Days" value={upcomingPreps} colorClass="bg-amber-500/20 text-amber-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Monthly Spending Breakdown">
                    {monthlyCategoryData.length > 0 ? (
                        <PieChart data={monthlyCategoryData} />
                    ) : (
                        <p className="text-center text-slate-500 py-10">No expenses recorded this month.</p>
                    )}
                </Card>
                <Card title="Quick Actions">
                    <div className="flex flex-col gap-3">
                        <button onClick={() => setView('expenses')} className="w-full text-left p-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors">Add a new expense</button>
                        <button onClick={() => setView('tasks')} className="w-full text-left p-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors">Schedule a task</button>
                        <button onClick={() => setView('exams')} className="w-full text-left p-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors">Plan a study session</button>
                         <button onClick={() => setView('journal')} className="w-full text-left p-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors">Write in your journal</button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
