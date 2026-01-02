import React from 'react';
import { Course, Assignment } from '../types';
import { getDaysLeft } from '../utils';
import { Flame, ArrowRight, Video, BookOpen, FileText } from 'lucide-react';

interface Props {
    courses: Course[];
    assignments: Assignment[];
    currentWeek: number;
}

const CatchUpFeed: React.FC<Props> = ({ courses, assignments, currentWeek }) => {
    // Generate tasks
    let tasks: Array<{
        id: string;
        type: 'lecture' | 'ta' | 'assignment';
        title: string;
        subtitle: string;
        urgency: number; // Higher is more urgent
        color: string;
        icon: React.ReactNode;
    }> = [];

    // 1. Find missing lectures/TAs
    courses.forEach(c => {
        c.weeks.filter(w => w.weekNum <= currentWeek).forEach(w => {
            if (!w.lectureDone) {
                tasks.push({
                    id: `${c.id}-w${w.weekNum}-lec`,
                    type: 'lecture',
                    title: `${c.name} Lecture ${w.weekNum}`,
                    subtitle: `Missing from Week ${w.weekNum}`,
                    urgency: 5 + (currentWeek - w.weekNum), // Older = more urgent
                    color: c.color,
                    icon: <Video size={16} />
                });
            }
            if (!w.taDone) {
                tasks.push({
                    id: `${c.id}-w${w.weekNum}-ta`,
                    type: 'ta',
                    title: `${c.name} TA ${w.weekNum}`,
                    subtitle: `Missing from Week ${w.weekNum}`,
                    urgency: 4 + (currentWeek - w.weekNum),
                    color: c.color,
                    icon: <BookOpen size={16} />
                });
            }
        });
    });

    // 2. Find urgent/overdue assignments
    assignments.filter(a => !a.isComplete).forEach(a => {
        const days = getDaysLeft(a.dueDate);
        const course = courses.find(c => c.id === a.courseId);
        let urgency = 0;
        let sub = '';

        if (days < 0) {
            urgency = 20; // Super urgent
            sub = `Overdue by ${Math.abs(days)} days`;
        } else if (days <= 2) {
            urgency = 15;
            sub = `Due in ${days} days`;
        } else {
            urgency = 10 - days; // Farther away = less urgent
            sub = `Due in ${days} days`;
        }

        if (days <= 5) {
            tasks.push({
                id: a.id,
                type: 'assignment',
                title: `${course?.name || 'HW'}: ${a.title}`,
                subtitle: sub,
                urgency: urgency,
                color: course?.color || '#ccc',
                icon: <FileText size={16} />
            });
        }
    });

    // Sort by urgency desc
    tasks.sort((a, b) => b.urgency - a.urgency);

    // Limit to top 5
    const displayTasks = tasks.slice(0, 5);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="p-1.5 bg-red-50 text-red-500 rounded-md"><Flame size={18} /></span>
                Damage Control
            </h3>
            
            {displayTasks.length === 0 ? (
                 <div className="text-center py-6">
                    <p className="text-gray-400 text-sm">Suspiciously calm week. Check announcements?</p>
                 </div>
            ) : (
                <div className="space-y-3">
                    {displayTasks.map(task => (
                        <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-50 hover:bg-gray-50 transition-colors group">
                             {/* Dot indicator */}
                             <div className={`w-2 h-2 rounded-full shrink-0 ${
                                 task.urgency > 15 ? 'bg-red-500 animate-pulse' : 
                                 task.urgency > 8 ? 'bg-orange-400' : 'bg-yellow-400'
                             }`} />
                             
                             {/* Icon Box */}
                             <div className="w-8 h-8 rounded-md bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
                                 {task.icon}
                             </div>

                             {/* Content */}
                             <div className="flex-1 min-w-0">
                                 <h4 className="text-sm font-semibold text-gray-800 truncate">{task.title}</h4>
                                 <p className="text-xs text-gray-500">{task.subtitle}</p>
                             </div>

                             {/* Action hint */}
                             <div className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300">
                                 <ArrowRight size={16} />
                             </div>
                        </div>
                    ))}
                    {tasks.length > 5 && (
                        <div className="text-center pt-2">
                             <span className="text-xs text-gray-400 font-medium">And {tasks.length - 5} more disasters waiting...</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CatchUpFeed;
