import React, { useState, useMemo, useCallback } from 'react';
import { Expense, ExpenseCategory } from '../types';
import Card from './Card';
import { PlusIcon, TrashIcon, PencilIcon, FileDownIcon } from './Icons';
import Modal from './Modal';
import PieChart from './PieChart';

// Tell TypeScript about the global jsPDF object from the CDN
declare global {
    interface Window {
        jspdf: any;
    }
}

const CATEGORIES: ExpenseCategory[] = ['Food', 'Travel', 'Study', 'Entertainment', 'Other'];
const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
    Food: '#34D399',
    Travel: '#60A5FA',
    Study: '#FBBF24',
    Entertainment: '#F472B6',
    Other: '#9CA3AF',
};

const ExpenseForm: React.FC<{
    expense: Partial<Expense> | null;
    onSave: (expense: Omit<Expense, 'id'> | Expense) => void;
    onClose: () => void;
}> = ({ expense, onSave, onClose }) => {
    const [description, setDescription] = useState(expense?.description || '');
    const [amount, setAmount] = useState(expense?.amount?.toString() || '');
    const [category, setCategory] = useState<ExpenseCategory>(expense?.category || 'Other');
    const [date, setDate] = useState(expense?.date || new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount) return;

        const expenseData = {
            id: expense?.id || new Date().toISOString(),
            description,
            amount: parseFloat(amount),
            date,
            category,
        };
        onSave(expenseData);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold font-display text-slate-800 dark:text-white">{expense?.id ? 'Edit' : 'Add'} Expense</h2>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Expense description" className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="₹0.00" className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)} className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <div className="flex gap-2 mt-2">
                <button type="button" onClick={onClose} className="w-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-800 dark:text-white rounded-lg p-2 transition-colors">Cancel</button>
                <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white rounded-lg p-2 transition-colors flex items-center justify-center gap-2">
                    <PlusIcon /> {expense?.id ? 'Update' : 'Add'}
                </button>
            </div>
        </form>
    );
};


interface ExpenseTrackerProps {
    expenses: Expense[];
    setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
}

const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ expenses, setExpenses }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('month');

    const handleSaveExpense = (expenseData: Omit<Expense, 'id'> | Expense) => {
        if ('id' in expenseData && editingExpense) {
            setExpenses(expenses.map(exp => exp.id === expenseData.id ? expenseData : exp));
        } else {
            setExpenses([...expenses, { ...expenseData, id: new Date().toISOString() }]);
        }
        setIsModalOpen(false);
        setEditingExpense(null);
    };

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense);
        setIsModalOpen(true);
    };

    const handleDeleteExpense = (id: string) => {
        setExpenses(expenses.filter(expense => expense.id !== id));
    };

    const openAddModal = () => {
        setEditingExpense(null);
        setIsModalOpen(true);
    };
    
    const filteredExpenses = useMemo(() => {
        const now = new Date();
        return expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            if (filter === 'today') {
                return expenseDate.toDateString() === now.toDateString();
            }
            if (filter === 'week') {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(now.getDate() - 7);
                return expenseDate >= oneWeekAgo && expenseDate <= now;
            }
            if (filter === 'month') {
                return expenseDate.getFullYear() === now.getFullYear() && expenseDate.getMonth() === now.getMonth();
            }
            return true;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [expenses, filter]);

    const totalSpent = useMemo(() => {
        return filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
    }, [filteredExpenses]);

    const categoryChartData = useMemo(() => {
        const totals = filteredExpenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
        }, {} as Record<ExpenseCategory, number>);
        return Object.entries(totals).map(([name, value]) => ({
            name: name as ExpenseCategory,
            value,
            color: CATEGORY_COLORS[name as ExpenseCategory]
        }));
    }, [filteredExpenses]);


    const handleExportPDF = useCallback(() => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const filterLabels: { [key: string]: string } = {
            'all': 'All Time',
            'today': 'Today',
            'week': 'This Week',
            'month': 'This Month',
        };

        doc.setFontSize(20);
        doc.text("Expense Report", 14, 22);
        doc.setFontSize(12);
        doc.text(`Filter: ${filterLabels[filter]}`, 14, 30);
        
        const tableColumn = ["Date", "Description", "Category", "Amount (₹)"];
        const tableRows = filteredExpenses.map(expense => [
            new Date(expense.date).toLocaleDateString(),
            expense.description,
            expense.category,
            expense.amount.toFixed(2)
        ]);

        (doc as any).autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 35,
            theme: 'striped',
            headStyles: { fillColor: [38, 117, 208] },
            foot: [
                [
                    { content: 'Total', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } }, 
                    { content: `₹${totalSpent.toFixed(2)}`, styles: { halign: 'right', fontStyle: 'bold' } }
                ]
            ],
            footStyles: { fillColor: false, textColor: [0,0,0], fontStyle: 'bold' },
            showFoot: 'lastPage',
        });
        
        doc.save(`expenses-${filter}.pdf`);
    }, [filteredExpenses, filter, totalSpent]);
    
    const FilterButton: React.FC<{ filterType: 'all' | 'today' | 'week' | 'month'; label: string; }> = ({ filterType, label }) => (
        <button onClick={() => setFilter(filterType)} className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${filter === filterType ? 'bg-blue-500 text-white dark:bg-cyan-500 dark:text-slate-900' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>{label}</button>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Card title="Expense History" headerContent={
                    <div className="flex items-center gap-2">
                         <button onClick={openAddModal} className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white transition-colors"><PlusIcon /></button>
                         <button onClick={handleExportPDF} className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"><FileDownIcon /></button>
                    </div>
                }>
                    <div className="flex justify-start gap-2 mb-4">
                        <FilterButton filterType="today" label="Today" />
                        <FilterButton filterType="week" label="This Week" />
                        <FilterButton filterType="month" label="This Month" />
                        <FilterButton filterType="all" label="All Time" />
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto pr-2 -mr-2">
                        <ul className="space-y-2">
                            {filteredExpenses.length === 0 && <p className="text-slate-500 text-center py-4">No expenses for this period.</p>}
                            {filteredExpenses.map((expense) => (
                                <li key={expense.id} className="flex justify-between items-center bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-8 rounded-full" style={{backgroundColor: CATEGORY_COLORS[expense.category]}}></div>
                                        <div>
                                            <p className="font-semibold">{expense.description}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(expense.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-rose-500">₹{expense.amount.toFixed(2)}</span>
                                        <button onClick={() => handleEdit(expense)} className="text-slate-500 hover:text-blue-500 dark:hover:text-cyan-400 transition-colors"><PencilIcon /></button>
                                        <button onClick={() => handleDeleteExpense(expense.id)} className="text-slate-500 hover:text-rose-500 transition-colors"><TrashIcon /></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Card>
            </div>
            
            <div className="space-y-6">
                 <Card title={`Total Spent (${filter})`}>
                     <p className="text-4xl font-bold font-display text-green-500 text-center">₹{totalSpent.toFixed(2)}</p>
                </Card>
                <Card title="Category Breakdown">
                    {categoryChartData.length > 0 ? (
                        <PieChart data={categoryChartData} />
                    ) : (
                        <p className="text-slate-500 text-center py-8">No data for this period.</p>
                    )}
                </Card>
            </div>

            {isModalOpen && (
                <Modal onClose={() => { setIsModalOpen(false); setEditingExpense(null); }}>
                    <ExpenseForm 
                        expense={editingExpense} 
                        onSave={handleSaveExpense} 
                        onClose={() => { setIsModalOpen(false); setEditingExpense(null); }}
                    />
                </Modal>
            )}
        </div>
    );
};

export default ExpenseTracker;