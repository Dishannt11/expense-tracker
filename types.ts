export type ExpenseCategory = 'Food' | 'Travel' | 'Study' | 'Entertainment' | 'Other';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
}

export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface Task {
  id: string;
  text: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  priority: TaskPriority;
  completed: boolean;
}

export type PrepProgress = 'Not Started' | 'In Progress' | 'Completed';

export interface ExamPrep {
  id:string;
  subject: string;
  topic: string;
  date: string; // YYYY-MM-DD
  progress: PrepProgress;
}

export interface DailySummary {
    date: string; // YYYY-MM-DD
    content: string;
}

export interface Event {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  photos: string[]; // Array of base64 encoded image strings
}
