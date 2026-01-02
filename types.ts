export interface WeekData {
    weekNum: number;
    lectureDone: boolean;
    taDone: boolean;
}

export interface Course {
    id: string;
    name: string;
    color: string; // Tailwind color class specific for borders/accents e.g. "blue-400"
    weeks: WeekData[];
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Assignment {
    id: string;
    courseId: string;
    title: string;
    dueDate: string; // ISO Date string
    difficulty: Difficulty;
    isComplete: boolean;
    notes?: string;
}

export interface CookedStats {
    level: number; // 0-100
    label: string;
    emoji: string;
    missedLectures: number;
    missedTAs: number;
    overdueAssignments: number;
    pendingAssignments: number;
}

export interface AppSettings {
    semesterStartDate: string;
    totalWeeks: number;
    showHumor: boolean;
}
