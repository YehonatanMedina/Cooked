import React, { useState, useEffect, useMemo } from 'react';
import { Course, Assignment, AppSettings } from './types';
import { INITIAL_SETTINGS, DEMO_COURSES, DEMO_ASSIGNMENTS } from './constants';
import { getCurrentWeek, calculateCookedStats } from './utils';
import TopContextBar from './components/TopContextBar';
import CookedMeter from './components/CookedMeter';
import CourseCard from './components/CourseCard';
import HomeworkBoard from './components/HomeworkBoard';
import CatchUpFeed from './components/CatchUpFeed';
import { AddHomeworkModal, AddCourseModal, EditCourseModal, SettingsModal } from './components/AddModal';
import { Plus } from 'lucide-react';
import confetti from 'canvas-confetti';

function App() {
  // State
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  
  // Modal States
  const [isHwModalOpen, setIsHwModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Initialization
  useEffect(() => {
    const savedCourses = localStorage.getItem('cooked_courses');
    const savedAssignments = localStorage.getItem('cooked_assignments');
    const savedSettings = localStorage.getItem('cooked_settings');

    if (savedCourses) setCourses(JSON.parse(savedCourses));
    else setCourses(DEMO_COURSES);

    if (savedAssignments) setAssignments(JSON.parse(savedAssignments));
    else setAssignments(DEMO_ASSIGNMENTS);

    if (savedSettings) setSettings(JSON.parse(savedSettings));
  }, []);

  // Persistence
  useEffect(() => {
    localStorage.setItem('cooked_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('cooked_assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
      localStorage.setItem('cooked_settings', JSON.stringify(settings));
  }, [settings]);

  // Derived State
  const currentWeek = useMemo(() => getCurrentWeek(settings.semesterStartDate), [settings.semesterStartDate]);
  const cookedStats = useMemo(() => calculateCookedStats(courses, assignments, currentWeek), [courses, assignments, currentWeek]);

  // --- Handlers ---

  const handleToggleWeek = (courseId: string, weekNum: number, type: 'lecture' | 'ta') => {
    setCourses(prev => prev.map(c => {
      if (c.id !== courseId) return c;
      const updatedWeeks = c.weeks.map(w => {
        if (w.weekNum !== weekNum) return w;
        return type === 'lecture' ? { ...w, lectureDone: !w.lectureDone } : { ...w, taDone: !w.taDone };
      });
      return { ...c, weeks: updatedWeeks };
    }));
  };

  const handleToggleAssignment = (id: string) => {
    setAssignments(prev => prev.map(a => {
      if (a.id !== id) return a;
      const isComplete = !a.isComplete;
      if (isComplete) {
         confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.7 }
         });
      }
      return { ...a, isComplete };
    }));
  };

  const handleAddAssignment = (data: { title: string, courseId: string, dueDate: string, difficulty: any, notes: string }) => {
    const newAssignment: Assignment = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      isComplete: false
    };
    setAssignments([...assignments, newAssignment]);
  };

  const handleAddCourse = (data: { name: string, color: string }) => {
    const newCourse: Course = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name,
      color: data.color,
      weeks: Array.from({ length: settings.totalWeeks }, (_, i) => ({
        weekNum: i + 1,
        lectureDone: false,
        taDone: false
      }))
    };
    setCourses([...courses, newCourse]);
  };

  const handleUpdateCourse = (id: string, name: string, color: string) => {
      setCourses(prev => prev.map(c => c.id === id ? { ...c, name, color } : c));
  };

  const handleDeleteCourse = (id: string) => {
      setCourses(prev => prev.filter(c => c.id !== id));
      setAssignments(prev => prev.filter(a => a.courseId !== id));
      setEditingCourse(null);
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
      // If total weeks changed, adjust courses
      if (newSettings.totalWeeks !== settings.totalWeeks) {
          setCourses(prev => prev.map(c => {
              if (newSettings.totalWeeks > c.weeks.length) {
                  // Add weeks
                  const addedWeeks = Array.from({ length: newSettings.totalWeeks - c.weeks.length }, (_, i) => ({
                      weekNum: c.weeks.length + i + 1,
                      lectureDone: false,
                      taDone: false
                  }));
                  return { ...c, weeks: [...c.weeks, ...addedWeeks] };
              } else {
                  // Remove weeks
                  return { ...c, weeks: c.weeks.slice(0, newSettings.totalWeeks) };
              }
          }));
      }
      setSettings(newSettings);
  };

  const handleResetData = () => {
      setCourses([]);
      setAssignments([]);
      setSettings(INITIAL_SETTINGS);
      localStorage.clear();
      window.location.reload();
  };

  return (
    <div className="min-h-screen pb-20 pt-[70px]">
      
      {/* 1. Context Bar */}
      <TopContextBar 
        currentWeek={currentWeek} 
        totalWeeks={settings.totalWeeks} 
        stats={cookedStats} 
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 space-y-10">
        
        {/* 2. Cooked Meter Widget */}
        <section className="mt-6">
            <CookedMeter stats={cookedStats} />
        </section>

        {/* 3. Course Dashboard */}
        <section>
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-lg font-bold text-gray-900">Courses</h2>
             <button 
                onClick={() => setIsCourseModalOpen(true)}
                className="text-sm text-gray-500 hover:text-gray-900 font-medium underline decoration-dotted"
             >
                Add Course
             </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map(course => {
                // Find next incomplete assignment
                const courseAssignments = assignments
                    .filter(a => a.courseId === course.id && !a.isComplete)
                    .sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
                
                const nextHw = courseAssignments[0];

                return (
                    <CourseCard 
                        key={course.id} 
                        course={course}
                        currentWeek={currentWeek}
                        upcomingAssignment={nextHw?.title}
                        upcomingAssignmentDifficulty={nextHw?.difficulty}
                        upcomingAssignmentDue={nextHw?.dueDate}
                        onToggleWeek={handleToggleWeek}
                        onEditCourse={setEditingCourse}
                    />
                );
            })}
            
            {/* Add Course Button (Visible in grid) */}
            <div 
                onClick={() => setIsCourseModalOpen(true)}
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all h-[180px] min-h-full"
            >
                <Plus size={32} className="mb-2" />
                <span className="font-medium text-sm">Add Course</span>
            </div>
          </div>
        </section>

        {/* 4. Homework Board & Catch-Up */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <HomeworkBoard 
                    assignments={assignments} 
                    courses={courses} 
                    onToggleAssignment={handleToggleAssignment}
                    onAddAssignment={() => setIsHwModalOpen(true)}
                />
            </div>
            
            <div className="lg:col-span-1">
                <CatchUpFeed 
                    courses={courses} 
                    assignments={assignments} 
                    currentWeek={currentWeek} 
                />
            </div>
        </section>

      </div>

      {/* Floating Add Button (Mobile Only) */}
      <div className="fixed bottom-6 right-6 lg:hidden z-40 flex flex-col gap-3">
         <button 
            onClick={() => setIsHwModalOpen(true)}
            className="w-14 h-14 bg-gray-900 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition-transform"
         >
            <Plus size={24} />
         </button>
      </div>

      {/* Modals */}
      <AddHomeworkModal 
        isOpen={isHwModalOpen} 
        onClose={() => setIsHwModalOpen(false)}
        courses={courses}
        onSave={handleAddAssignment}
      />
      
      <AddCourseModal 
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        onSave={handleAddCourse}
      />

      <EditCourseModal 
        isOpen={!!editingCourse}
        course={editingCourse}
        onClose={() => setEditingCourse(null)}
        onSave={handleUpdateCourse}
        onDelete={handleDeleteCourse}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleUpdateSettings}
        onReset={handleResetData}
      />

    </div>
  );
}

export default App;