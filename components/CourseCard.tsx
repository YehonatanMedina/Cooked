import React, { useState } from 'react';
import { Course, WeekData } from '../types';
import { ChevronDown, ChevronUp, Settings, Video, BookOpen, AlertCircle, Check } from 'lucide-react';

interface Props {
    course: Course;
    currentWeek: number;
    upcomingAssignment?: string;
    upcomingAssignmentDue?: string;
    upcomingAssignmentDifficulty?: string;
    onToggleWeek: (courseId: string, weekNum: number, type: 'lecture' | 'ta') => void;
    onEditCourse: (course: Course) => void;
}

const CourseCard: React.FC<Props> = ({ 
    course, 
    currentWeek, 
    upcomingAssignment,
    upcomingAssignmentDue,
    upcomingAssignmentDifficulty,
    onToggleWeek,
    onEditCourse 
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const relevantWeeks = course.weeks.filter(w => w.weekNum <= currentWeek);
    const lecturesDone = relevantWeeks.filter(w => w.lectureDone).length;
    const tasDone = relevantWeeks.filter(w => w.taDone).length;
    const totalExpected = relevantWeeks.length;

    const behindLectures = totalExpected - lecturesDone;
    const behindTAs = totalExpected - tasDone;
    const isBehind = behindLectures > 0 || behindTAs > 0;

    const getDifficultyColor = (diff?: string) => {
        if (diff === 'Easy') return 'bg-green-100 text-green-700';
        if (diff === 'Medium') return 'bg-orange-100 text-orange-700';
        if (diff === 'Hard') return 'bg-red-100 text-red-700';
        return 'bg-gray-100 text-gray-700';
    };

    return (
        <div className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-transparent ${isExpanded ? 'ring-1 ring-gray-100 shadow-lg' : ''}`}>
            {/* Header / Summary */}
            <div 
                className="p-5 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-10 rounded-full ${course.color ? '' : 'bg-gray-400'}`} style={{ backgroundColor: course.color }}></div>
                        <h3 className="text-lg font-bold text-gray-900">{course.name}</h3>
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEditCourse(course); }}
                        className="text-gray-300 hover:text-gray-500 transition-colors p-1"
                    >
                        <Settings size={16} />
                    </button>
                </div>

                {/* Progress Bars */}
                <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="w-12">Lectures</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full rounded-full transition-all duration-500"
                                style={{ 
                                    width: `${(lecturesDone / Math.max(totalExpected, 1)) * 100}%`,
                                    backgroundColor: course.color || '#9CA3AF'
                                }}
                            />
                        </div>
                        <span className="w-8 text-right">{lecturesDone}/{totalExpected}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="w-12">TAs</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full rounded-full transition-all duration-500"
                                style={{ 
                                    width: `${(tasDone / Math.max(totalExpected, 1)) * 100}%`,
                                    backgroundColor: course.color || '#9CA3AF',
                                    opacity: 0.7
                                }}
                            />
                        </div>
                        <span className="w-8 text-right">{tasDone}/{totalExpected}</span>
                    </div>
                </div>

                {/* Footer Status */}
                <div className="flex items-center justify-between text-xs min-h-[24px]">
                    {upcomingAssignment ? (
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600">Next HW: <span className="font-medium">{upcomingAssignment}</span></span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getDifficultyColor(upcomingAssignmentDifficulty)}`}>
                                {upcomingAssignmentDifficulty}
                            </span>
                        </div>
                    ) : (
                         <span className="text-gray-400 italic">No pending HW</span>
                    )}

                    {isBehind && (
                        <div className="flex items-center gap-1 text-red-500 font-medium bg-red-50 px-2 py-1 rounded-full">
                            <AlertCircle size={12} />
                            <span>Behind {behindLectures + behindTAs}</span>
                        </div>
                    )}
                </div>
                
                {/* Expand Indicator */}
                <div className="flex justify-center mt-2 -mb-2 opacity-30 hover:opacity-100 transition-opacity">
                   {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
            </div>

            {/* Accordion Content */}
            {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50/50 rounded-b-xl p-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="text-gray-400 text-xs border-b border-gray-100">
                                    <th className="pb-2 font-medium pl-2">Week</th>
                                    <th className="pb-2 font-medium text-center">Lecture</th>
                                    <th className="pb-2 font-medium text-center">TA</th>
                                    <th className="pb-2 font-medium text-right pr-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {course.weeks.slice(0, currentWeek).map((week) => (
                                    <tr key={week.weekNum} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 pl-2 font-medium text-gray-700">Week {week.weekNum}</td>
                                        <td className="py-3 text-center">
                                            <button 
                                                onClick={() => onToggleWeek(course.id, week.weekNum, 'lecture')}
                                                className={`p-1.5 rounded-md border transition-all ${
                                                    week.lectureDone 
                                                    ? 'bg-green-50 border-green-200 text-green-600' 
                                                    : 'bg-white border-gray-200 text-gray-300 hover:border-gray-400'
                                                }`}
                                            >
                                                {week.lectureDone ? <Check size={14} /> : <Video size={14} />}
                                            </button>
                                        </td>
                                        <td className="py-3 text-center">
                                            <button 
                                                onClick={() => onToggleWeek(course.id, week.weekNum, 'ta')}
                                                className={`p-1.5 rounded-md border transition-all ${
                                                    week.taDone 
                                                    ? 'bg-green-50 border-green-200 text-green-600' 
                                                    : 'bg-white border-gray-200 text-gray-300 hover:border-gray-400'
                                                }`}
                                            >
                                                {week.taDone ? <Check size={14} /> : <BookOpen size={14} />}
                                            </button>
                                        </td>
                                        <td className="py-3 pr-2 text-right text-xs">
                                            {week.lectureDone && week.taDone ? (
                                                <span className="text-gray-400">Done</span>
                                            ) : (
                                                <span className="text-orange-400 font-medium">Pending</span>
                                            )}
                                        </td>
                                    </tr>
                                )).reverse()}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseCard;
