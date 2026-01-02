import { Course, Assignment, AppSettings } from './types';

export const COURSE_COLORS = [
    { name: 'Sage', value: '#A3C9A8', tailwind: 'bg-[#A3C9A8]', border: 'border-[#A3C9A8]' },
    { name: 'Slate', value: '#94A3B8', tailwind: 'bg-slate-400', border: 'border-slate-400' },
    { name: 'Terracotta', value: '#FDBA74', tailwind: 'bg-orange-300', border: 'border-orange-300' },
    { name: 'Blue Grey', value: '#CBD5E1', tailwind: 'bg-slate-300', border: 'border-slate-300' },
    { name: 'Dusty Pink', value: '#FDA4AF', tailwind: 'bg-rose-300', border: 'border-rose-300' },
    { name: 'Sand', value: '#D6D3D1', tailwind: 'bg-stone-300', border: 'border-stone-300' },
];

export const INITIAL_SETTINGS: AppSettings = {
    semesterStartDate: new Date(new Date().setDate(new Date().getDate() - 60)).toISOString(), // Started 60 days ago
    totalWeeks: 13,
    showHumor: true,
};

// Seed data for first launch
export const DEMO_COURSES: Course[] = [
    {
        id: 'c1',
        name: 'Linear Algebra',
        color: '#94A3B8', // Slate
        weeks: Array.from({ length: 13 }, (_, i) => ({
            weekNum: i + 1,
            lectureDone: i < 8, // Missed latest
            taDone: i < 8,
        })),
    },
    {
        id: 'c2',
        name: 'Data Structures',
        color: '#A3C9A8', // Sage
        weeks: Array.from({ length: 13 }, (_, i) => ({
            weekNum: i + 1,
            lectureDone: i < 7, // Behind 2
            taDone: i < 7,
        })),
    },
    {
        id: 'c3',
        name: 'Probability',
        color: '#FDBA74', // Terracotta
        weeks: Array.from({ length: 13 }, (_, i) => ({
            weekNum: i + 1,
            lectureDone: i < 9, // Up to date
            taDone: i < 9,
        })),
    }
];

export const DEMO_ASSIGNMENTS: Assignment[] = [
    {
        id: 'a1',
        courseId: 'c1',
        title: 'Eigenvalues Problem Set',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
        difficulty: 'Hard',
        isComplete: false,
    },
    {
        id: 'a2',
        courseId: 'c2',
        title: 'B-Tree Implementation',
        dueDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), // Overdue
        difficulty: 'Medium',
        isComplete: false,
    },
    {
        id: 'a3',
        courseId: 'c3',
        title: 'Bayes Theorem Quiz',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
        difficulty: 'Easy',
        isComplete: false,
    }
];

export const COOKED_MESSAGES = {
    low: [
        "Chill mode: almost suspiciously organized.",
        "Unbelievable. You're actually fine.",
        "A rare sight: academic stability."
    ],
    medium: [
        "Mild anxiety recommended.",
        "Comfortably doomed, but salvageable.",
        "Getting warm. Don't touch the stove."
    ],
    high: [
        "Getting crispy. You still can recover.",
        "Running hot. Hydrate and panic efficiently.",
        "Hope is not a strategy, but it's all we have."
    ],
    extreme: [
        "Fully roasted. May the odds be in your favor.",
        "Rest in equations.",
        "It's not procrastination if you never do it."
    ]
};
