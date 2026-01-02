import { differenceInCalendarWeeks, isBefore, parseISO, startOfDay, addDays, isPast, isToday } from 'date-fns';
import { Course, Assignment, CookedStats, AppSettings } from './types';
import { COOKED_MESSAGES } from './constants';

export const getCurrentWeek = (startDate: string): number => {
    const start = parseISO(startDate);
    const now = new Date();
    // Week 1 starts on start date. Diff gives 0 for first week, so +1
    const weekDiff = differenceInCalendarWeeks(now, start, { weekStartsOn: 1 }); // Assuming Monday start or standard
    return Math.max(1, weekDiff + 1);
};

export const calculateCookedStats = (
    courses: Course[], 
    assignments: Assignment[], 
    currentWeek: number
): CookedStats => {
    let missedItems = 0;
    let expectedItems = 0;
    
    // Calculate Lecture/TA backlog up to CURRENT WEEK
    courses.forEach(course => {
        // Only count up to current week (inclusive)
        const activeWeeks = course.weeks.filter(w => w.weekNum <= currentWeek);
        
        activeWeeks.forEach(w => {
            expectedItems += 2; // 1 lecture + 1 TA
            if (!w.lectureDone) missedItems++;
            if (!w.taDone) missedItems++;
        });
    });

    // Calculate Homework stats
    const totalAssignments = assignments.length;
    const activeOrOverdue = assignments.filter(a => !a.isComplete).length;
    const overdue = assignments.filter(a => !a.isComplete && isBefore(parseISO(a.dueDate), startOfDay(new Date()))).length;

    // Cookedness Formula:
    // 0.5 * (missed / expected) + 0.5 * (active_overdue / total)
    // Avoid division by zero
    const backlogRatio = expectedItems > 0 ? missedItems / expectedItems : 0;
    const hwRatio = totalAssignments > 0 ? activeOrOverdue / totalAssignments : 0;
    
    // If no assignments exist at all, weight backlog 100%
    let rawScore = 0;
    if (totalAssignments === 0 && expectedItems === 0) {
        rawScore = 0;
    } else if (totalAssignments === 0) {
        rawScore = backlogRatio;
    } else if (expectedItems === 0) {
        rawScore = hwRatio;
    } else {
        rawScore = (0.5 * backlogRatio) + (0.5 * hwRatio);
    }

    let level = Math.min(100, Math.round(rawScore * 100));
    
    // Override: If lots of overdue, boost level
    if (overdue > 2) level = Math.max(level, 75);

    let emoji = '🧊';
    let label = '';
    
    if (level <= 25) {
        emoji = '🧊';
        label = COOKED_MESSAGES.low[Math.floor(Math.random() * COOKED_MESSAGES.low.length)];
    } else if (level <= 50) {
        emoji = '☕';
        label = COOKED_MESSAGES.medium[Math.floor(Math.random() * COOKED_MESSAGES.medium.length)];
    } else if (level <= 75) {
        emoji = '🔥';
        label = COOKED_MESSAGES.high[Math.floor(Math.random() * COOKED_MESSAGES.high.length)];
    } else {
        emoji = '🍳';
        label = COOKED_MESSAGES.extreme[Math.floor(Math.random() * COOKED_MESSAGES.extreme.length)];
    }

    return {
        level,
        label,
        emoji,
        missedLectures: courses.reduce((acc, c) => acc + c.weeks.filter(w => w.weekNum <= currentWeek && !w.lectureDone).length, 0),
        missedTAs: courses.reduce((acc, c) => acc + c.weeks.filter(w => w.weekNum <= currentWeek && !w.taDone).length, 0),
        overdueAssignments: overdue,
        pendingAssignments: activeOrOverdue
    };
};

export const formatDate = (isoString: string) => {
    const date = parseISO(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const getDaysLeft = (isoString: string) => {
    const date = parseISO(isoString);
    const today = startOfDay(new Date());
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays;
};
