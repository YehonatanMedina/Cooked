import React from 'react';
import { CookedStats } from '../types';
import { format } from 'date-fns';
import { Settings as SettingsIcon } from 'lucide-react';

interface Props {
    currentWeek: number;
    totalWeeks: number;
    stats: CookedStats;
    onOpenSettings: () => void;
}

const TopContextBar: React.FC<Props> = ({ currentWeek, totalWeeks, stats, onOpenSettings }) => {
    const today = format(new Date(), 'EEEE — MMM d');

    return (
        <div className="fixed top-0 left-0 right-0 h-[70px] bg-[#F9F9F9]/95 backdrop-blur-sm border-b border-gray-200 z-50 flex items-center justify-between px-4 md:px-8 transition-all duration-300">
            {/* Left */}
            <div className="flex flex-col md:flex-row md:items-center md:gap-3">
                <span className="text-sm font-semibold text-gray-800">{today}</span>
                <span className="hidden md:block text-gray-400">|</span>
                <span className="text-xs md:text-sm text-gray-600 font-medium">Week {currentWeek}/{totalWeeks}</span>
            </div>

            {/* Center (Emoji) - Hidden on very small screens if crowded, but useful */}
            <div className="absolute left-1/2 transform -translate-x-1/2 text-3xl transition-transform duration-500 hover:scale-110 cursor-default" title={stats.label}>
                {stats.emoji}
            </div>

            {/* Right */}
            <div className="flex items-center gap-4">
                <div className="group relative cursor-help hidden sm:block">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Cooked Level:</span>
                        <span className={`text-lg font-bold ${
                            stats.level > 75 ? 'text-red-600' : 
                            stats.level > 50 ? 'text-orange-500' : 
                            stats.level > 25 ? 'text-yellow-600' : 'text-blue-500'
                        }`}>
                            {stats.level}%
                        </span>
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 shadow-lg rounded-lg p-3 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                       {stats.level}% of expected progress is missing or pending.
                    </div>
                </div>

                <button 
                    onClick={onOpenSettings}
                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                    title="Settings"
                >
                    <SettingsIcon size={20} />
                </button>
            </div>
        </div>
    );
};

export default TopContextBar;