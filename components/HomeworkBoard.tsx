import React, { useState } from 'react';
import { Assignment, Course } from '../types';
import { getDaysLeft, formatDate } from '../utils';
import { CheckSquare, Square, AlertTriangle, Clock, FileText } from 'lucide-react';

interface Props {
    assignments: Assignment[];
    courses: Course[];
    onToggleAssignment: (id: string) => void;
    onAddAssignment: () => void;
}

const HomeworkBoard: React.FC<Props> = ({ assignments, courses, onToggleAssignment, onAddAssignment }) => {
    const [filter, setFilter] = useState<'All' | 'Active' | 'Due Soon' | 'Completed'>('Active');
    const [sort, setSort] = useState<'Date' | 'Difficulty'>('Date');

    const getCourseName = (id: string) => courses.find(c => c.id === id)?.name || 'Unknown Course';
    const getCourseColor = (id: string) => courses.find(c => c.id === id)?.color || '#ccc';

    const processedAssignments = assignments
        .filter(a => {
            if (filter === 'All') return true;
            if (filter === 'Completed') return a.isComplete;
            if (filter === 'Active') return !a.isComplete;
            if (filter === 'Due Soon') {
                const days = getDaysLeft(a.dueDate);
                return !a.isComplete && days <= 3 && days >= 0;
            }
            return true;
        })
        .sort((a, b) => {
            if (sort === 'Date') return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            if (sort === 'Difficulty') {
                const map = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
                return map[b.difficulty] - map[a.difficulty];
            }
            return 0;
        });

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header / Toolbar */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span>Homework</span>
                    <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{assignments.filter(a => !a.isComplete).length} active</span>
                </h2>
                
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        {['Active', 'Due Soon', 'Completed', 'All'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                                    filter === f ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={onAddAssignment}
                        className="ml-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium rounded-lg transition-colors flex-shrink-0"
                    >
                        + Add
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 text-xs text-gray-500 uppercase">
                        <tr>
                            <th className="p-4 w-12 text-center">Done</th>
                            <th className="p-4">Course</th>
                            <th className="p-4">Assignment</th>
                            <th className="p-4 hidden md:table-cell">Difficulty</th>
                            <th className="p-4">Due</th>
                            <th className="p-4 hidden sm:table-cell">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {processedAssignments.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-400 italic">
                                    {filter === 'Completed' ? "Go finish something first." : "Suspiciously empty. Are you sure?"}
                                </td>
                            </tr>
                        ) : (
                            processedAssignments.map((a) => {
                                const daysLeft = getDaysLeft(a.dueDate);
                                const isOverdue = daysLeft < 0 && !a.isComplete;
                                const isSoon = daysLeft <= 3 && daysLeft >= 0 && !a.isComplete;
                                
                                return (
                                    <tr 
                                        key={a.id} 
                                        className={`group transition-colors ${a.isComplete ? 'bg-gray-50/50' : 'hover:bg-gray-50'}`}
                                    >
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => onToggleAssignment(a.id)}
                                                className={`transition-transform active:scale-90 ${a.isComplete ? 'text-green-500' : 'text-gray-300 hover:text-gray-400'}`}
                                            >
                                                {a.isComplete ? <CheckSquare size={20} /> : <Square size={20} />}
                                            </button>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div 
                                                    className="w-2 h-2 rounded-full" 
                                                    style={{ backgroundColor: getCourseColor(a.courseId) }}
                                                />
                                                <span className={`text-sm font-medium ${a.isComplete ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                                    {getCourseName(a.courseId)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm ${a.isComplete ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                                        {a.title}
                                                    </span>
                                                    {a.notes && (
                                                        <div className="group relative">
                                                            <FileText size={12} className="text-gray-400" />
                                                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                                                {a.notes}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 hidden md:table-cell">
                                            <span className={`text-[10px] px-2 py-1 rounded-full font-medium border ${
                                                a.difficulty === 'Easy' ? 'bg-green-50 text-green-700 border-green-100' :
                                                a.difficulty === 'Medium' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                'bg-red-50 text-red-700 border-red-100'
                                            }`}>
                                                {a.difficulty}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {formatDate(a.dueDate)}
                                        </td>
                                        <td className="p-4 hidden sm:table-cell">
                                            {!a.isComplete && (
                                                <div className="flex items-center gap-1.5 text-xs font-medium">
                                                    {isOverdue ? (
                                                        <span className="text-red-500 flex items-center gap-1">
                                                            <AlertTriangle size={12} /> Overdue
                                                        </span>
                                                    ) : isSoon ? (
                                                        <span className="text-orange-500 flex items-center gap-1">
                                                            <Clock size={12} /> {daysLeft === 0 ? 'Today' : `${daysLeft}d left`}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">{daysLeft}d left</span>
                                                    )}
                                                </div>
                                            )}
                                            {a.isComplete && <span className="text-green-600 text-xs font-medium">Completed</span>}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HomeworkBoard;