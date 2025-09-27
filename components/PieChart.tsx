import React, { useState } from 'react';

interface PieChartData {
    name: string;
    value: number;
    color: string;
}

interface PieChartProps {
    data: PieChartData[];
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const total = data.reduce((sum, item) => sum + item.value, 0);
    let startAngle = 0;

    const slices = data.map((item, index) => {
        const angle = (item.value / total) * 360;
        const endAngle = startAngle + angle;

        const largeArcFlag = angle > 180 ? 1 : 0;

        const startX = 50 + 40 * Math.cos(Math.PI * startAngle / 180);
        const startY = 50 + 40 * Math.sin(Math.PI * startAngle / 180);
        const endX = 50 + 40 * Math.cos(Math.PI * endAngle / 180);
        const endY = 50 + 40 * Math.sin(Math.PI * endAngle / 180);

        const pathData = `M 50,50 L ${startX},${startY} A 40,40 0 ${largeArcFlag},1 ${endX},${endY} Z`;
        
        startAngle = endAngle;

        return (
            <path
                key={item.name}
                d={pathData}
                fill={item.color}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                className="transition-transform duration-200 cursor-pointer"
                style={{ transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)', transformOrigin: '50% 50%' }}
            />
        );
    });

    return (
        <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {slices}
                </svg>
                {activeIndex !== null && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                        <span className="text-xs text-slate-500 dark:text-slate-400">{data[activeIndex].name}</span>
                        <span className="font-bold text-lg text-slate-800 dark:text-white">₹{data[activeIndex].value.toFixed(2)}</span>
                    </div>
                )}
            </div>
            <div className="w-full text-sm space-y-2">
                {data.map((item, index) => (
                    <div 
                        key={item.name} 
                        className="flex items-center justify-between"
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                    >
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                            <span>{item.name}</span>
                        </div>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                            {((item.value / total) * 100).toFixed(1)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PieChart;