import React, { useState } from 'react';
import { CalculatorIcon, XIcon } from './Icons';

const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleButtonClick = (value: string) => {
    if (value === 'C') {
      setDisplay('0');
      setExpression('');
    } else if (value === '=') {
      try {
        const result = new Function(`return ${expression.replace(/--/g, '+')}`)();
        if (Number.isNaN(result) || !Number.isFinite(result)) {
            setDisplay('Error');
        } else {
            setDisplay(String(result));
        }
        setExpression(String(result));
      } catch (error) {
        setDisplay('Error');
        setExpression('');
      }
    } else if (['+', '-', '*', '/'].includes(value)) {
        if (expression === '' || expression === 'Error') return;
        setExpression(prev => prev + value);
        setDisplay(value);
    } else {
      if (display === '0' || ['+', '-', '*', '/'].includes(display) || display === 'Error') {
        setDisplay(value);
      } else {
        setDisplay(prev => prev + value);
      }
      setExpression(prev => prev + value);
    }
  };

  const buttons = [
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    'C', '0', '=', '+',
  ];

  const getButtonClass = (btn: string) => {
    if (['/', '*', '-', '+'].includes(btn)) return 'bg-blue-500/80 hover:bg-blue-500';
    if (btn === '=') return 'bg-green-500/80 hover:bg-green-500';
    if (btn === 'C') return 'bg-rose-500/80 hover:bg-rose-500';
    return 'bg-slate-500/60 hover:bg-slate-500';
  };
  
  if (!isOpen) {
      return (
          <button 
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 h-16 w-16 bg-blue-500 dark:bg-cyan-500 text-white rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform"
            aria-label="Open Calculator"
          >
              <CalculatorIcon />
          </button>
      )
  }

  return (
    <div className="fixed bottom-6 right-6 w-full max-w-xs mx-auto bg-slate-200/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-300/50 dark:border-slate-700/50 rounded-2xl shadow-xl p-4 transition-all z-50">
      <button onClick={() => setIsOpen(false)} className="absolute top-2 right-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"><XIcon /></button>
      <div className="bg-slate-900/70 text-white rounded-lg p-4 text-right text-3xl font-mono truncate mb-4">{display}</div>
      <div className="grid grid-cols-4 gap-2">
        {buttons.map((btn) => (
          <button
            key={btn}
            onClick={() => handleButtonClick(btn)}
            className={`text-xl text-white font-bold p-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 ${getButtonClass(btn)}`}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Calculator;