import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { CookedStats } from '../types';

interface Props {
    stats: CookedStats;
}

const CookedMeter: React.FC<Props> = ({ stats }) => {
    // Determine color based on level
    let color = '#60A5FA'; // blue-400
    if (stats.level > 75) color = '#EF4444'; // red-500
    else if (stats.level > 50) color = '#F97316'; // orange-500
    else if (stats.level > 25) color = '#EAB308'; // yellow-500

    const data = [
        { name: 'Cooked', value: stats.level },
        { name: 'Safe', value: 100 - stats.level }
    ];

    return (
        <div className="w-full flex flex-col items-center justify-center py-8 animate-fade-in">
            <div className="relative w-48 h-48 md:w-56 md:h-56">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius="75%"
                            outerRadius="95%"
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                            stroke="none"
                        >
                            <Cell key="cooked" fill={color} className="transition-all duration-700 ease-in-out" />
                            <Cell key="safe" fill="#E5E7EB" />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                
                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-sm text-gray-400 uppercase tracking-widest text-[10px]">Cooked</span>
                    <span className="text-4xl font-bold text-gray-800" style={{ color }}>
                        {stats.level}%
                    </span>
                    <span className="text-2xl mt-1">{stats.emoji}</span>
                </div>
            </div>
            
            {/* Caption */}
            <div className="mt-4 text-center max-w-md px-4">
                <p className="text-gray-600 font-medium italic">"{stats.label}"</p>
            </div>
        </div>
    );
};

export default CookedMeter;
