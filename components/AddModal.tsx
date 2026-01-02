import React, { useState, useEffect } from 'react';
import { X, Trash2, RefreshCw } from 'lucide-react';
import { Course, Difficulty, AppSettings } from '../types';
import { COURSE_COLORS } from '../constants';
import { format, parseISO } from 'date-fns';

// --- Shared Components ---

const ModalWrapper: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            />
            
            {/* Content */}
            <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200/50 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

const InputGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 tracking-wide">{label}</label>
        {children}
    </div>
);

const ColorPicker: React.FC<{ selected: string; onSelect: (c: string) => void }> = ({ selected, onSelect }) => (
    <div className="flex gap-3 flex-wrap">
        {COURSE_COLORS.map((c) => (
            <button
                key={c.name}
                type="button"
                onClick={() => onSelect(c.value)}
                className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${selected === c.value ? 'border-gray-800 scale-110 ring-2 ring-gray-100' : 'border-transparent'}`}
                style={{ backgroundColor: c.value }}
                title={c.name}
            />
        ))}
    </div>
);

// --- Modals ---

interface AddHomeworkProps {
    isOpen: boolean;
    onClose: () => void;
    courses: Course[];
    onSave: (data: any) => void;
}

export const AddHomeworkModal: React.FC<AddHomeworkProps> = ({ isOpen, onClose, courses, onSave }) => {
    const [title, setTitle] = useState('');
    const [courseId, setCourseId] = useState('');
    const [date, setDate] = useState('');
    const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
    const [notes, setNotes] = useState('');

    // Set default course when modal opens or courses change
    useEffect(() => {
        if (courses.length > 0 && !courseId) {
            setCourseId(courses[0].id);
        }
    }, [courses, courseId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ 
            title, 
            courseId, 
            dueDate: new Date(date).toISOString(), 
            difficulty,
            notes 
        });
        onClose();
        setTitle('');
        setDate('');
        setNotes('');
        setDifficulty('Medium');
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title="New Assignment">
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <InputGroup label="Course">
                    <select 
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                        value={courseId}
                        onChange={(e) => setCourseId(e.target.value)}
                        required
                    >
                        {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </InputGroup>

                <InputGroup label="Title">
                    <input 
                        type="text" 
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                        placeholder="e.g. HW3: Graphs"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </InputGroup>

                <InputGroup label="Due Date">
                    <input 
                        type="date" 
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </InputGroup>

                <InputGroup label="Difficulty">
                    <div className="flex gap-2">
                        {['Easy', 'Medium', 'Hard'].map((diff) => (
                            <label key={diff} className={`flex-1 text-center py-2 text-sm rounded-lg border cursor-pointer transition-all ${
                                difficulty === diff 
                                ? 'bg-gray-800 text-white border-gray-800 shadow-md transform scale-[1.02]' 
                                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                            }`}>
                                <input 
                                    type="radio" 
                                    name="difficulty" 
                                    value={diff} 
                                    checked={difficulty === diff} 
                                    onChange={() => setDifficulty(diff as Difficulty)} 
                                    className="hidden" 
                                />
                                {diff}
                            </label>
                        ))}
                    </div>
                </InputGroup>

                <InputGroup label="Notes (Optional)">
                    <textarea 
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow min-h-[80px]"
                        placeholder="Additional details..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </InputGroup>

                <div className="pt-2">
                    <button type="submit" className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-all shadow-lg shadow-gray-200 active:scale-[0.98]">
                        Save Assignment
                    </button>
                </div>
            </form>
        </ModalWrapper>
    );
};

interface AddCourseProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
}

export const AddCourseModal: React.FC<AddCourseProps> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [selectedColor, setSelectedColor] = useState(COURSE_COLORS[0].value);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, color: selectedColor });
        onClose();
        setName('');
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title="Add Course">
            <form onSubmit={handleSubmit} className="p-5 space-y-5">
                <InputGroup label="Course Name">
                    <input 
                        type="text" 
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                        placeholder="e.g. Operating Systems"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </InputGroup>
                
                <InputGroup label="Accent Color">
                    <ColorPicker selected={selectedColor} onSelect={setSelectedColor} />
                </InputGroup>

                <div className="pt-2">
                    <button type="submit" className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-all shadow-lg shadow-gray-200 active:scale-[0.98]">
                        Add Course
                    </button>
                </div>
            </form>
        </ModalWrapper>
    );
};

interface EditCourseProps {
    isOpen: boolean;
    onClose: () => void;
    course: Course | null;
    onSave: (id: string, name: string, color: string) => void;
    onDelete: (id: string) => void;
}

export const EditCourseModal: React.FC<EditCourseProps> = ({ isOpen, onClose, course, onSave, onDelete }) => {
    const [name, setName] = useState('');
    const [selectedColor, setSelectedColor] = useState('');

    useEffect(() => {
        if (course) {
            setName(course.name);
            setSelectedColor(course.color);
        }
    }, [course]);

    if (!course) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(course.id, name, selectedColor);
        onClose();
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete "${course.name}"? This cannot be undone.`)) {
            onDelete(course.id);
            onClose();
        }
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title="Edit Course">
            <form onSubmit={handleSubmit} className="p-5 space-y-5">
                <InputGroup label="Course Name">
                    <input 
                        type="text" 
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </InputGroup>
                
                <InputGroup label="Accent Color">
                    <ColorPicker selected={selectedColor} onSelect={setSelectedColor} />
                </InputGroup>

                <div className="pt-4 flex flex-col gap-3">
                    <button type="submit" className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-all shadow-lg shadow-gray-200 active:scale-[0.98]">
                        Save Changes
                    </button>
                    <button 
                        type="button" 
                        onClick={handleDelete}
                        className="w-full py-3 text-red-500 bg-red-50 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    >
                        <Trash2 size={18} />
                        Delete Course
                    </button>
                </div>
            </form>
        </ModalWrapper>
    );
};

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: AppSettings;
    onSave: (newSettings: AppSettings) => void;
    onReset: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave, onReset }) => {
    const [startDate, setStartDate] = useState('');
    const [weeks, setWeeks] = useState(13);

    useEffect(() => {
        if (isOpen) {
            // Convert ISO to YYYY-MM-DD for input
            try {
                const parsed = parseISO(settings.semesterStartDate);
                setStartDate(format(parsed, 'yyyy-MM-dd'));
            } catch (e) {
                setStartDate(format(new Date(), 'yyyy-MM-dd'));
            }
            setWeeks(settings.totalWeeks);
        }
    }, [isOpen, settings]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...settings,
            semesterStartDate: new Date(startDate).toISOString(),
            totalWeeks: Number(weeks)
        });
        onClose();
    };

    const handleReset = () => {
        if (window.confirm("WARNING: This will delete ALL courses and assignments. This action cannot be undone.")) {
            onReset();
            onClose();
        }
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title="Dashboard Settings">
            <form onSubmit={handleSubmit} className="p-5 space-y-5">
                <InputGroup label="Semester Start Date">
                    <input 
                        type="date" 
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Used to calculate the current week number.</p>
                </InputGroup>

                <InputGroup label="Total Weeks">
                     <input 
                        type="number" 
                        min="1"
                        max="52"
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                        value={weeks}
                        onChange={(e) => setWeeks(Number(e.target.value))}
                        required
                    />
                </InputGroup>

                <div className="pt-4 border-t border-gray-100 space-y-3">
                    <button type="submit" className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-all shadow-lg shadow-gray-200 active:scale-[0.98]">
                        Save Settings
                    </button>
                    
                     <button 
                        type="button" 
                        onClick={handleReset}
                        className="w-full py-3 text-red-500 hover:text-red-700 font-medium text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                        <RefreshCw size={14} />
                        Reset All Data
                    </button>
                </div>
            </form>
        </ModalWrapper>
    );
};
