import React, { useState, useCallback, useEffect } from 'react';
import type { Teacher, Course, Classroom, TimeSlot, GeneratedTimetable } from './types';
import { generateTimetable } from './services/geminiService';
import Header from './components/Header';
import Card from './components/Card';
import TimetableGrid from './components/TimetableGrid';
import LoadingSpinner from './components/LoadingSpinner';
import Footer from './components/Footer';
const initialTeachers: Teacher[] = [
  { id: 't1', name: 'Dr. V. K. Singh (Mathematics)' },
  { id: 't2', name: 'Prof. R. Sharma (Physics)' },
  { id: 't3', name: 'Dr. S. Verma (Data Structures)' },
  { id: 't4', name: 'Ms. P. Jain (DBMS)' },
  { id: 't5', name: 'Mr. A. Kumar (Operating Systems)' },
  { id: 't6', name: 'Dr. A. Gupta (Chemistry)' },
  { id: 't7', name: 'Ms. K. Singh (English)' },
  { id: 't8', name: 'Mr. R. Yadav (Computer Networks)' },
  { id: 't9', name: 'Dr. P. Mishra (Artificial Intelligence)' },
  { id: 't10', name: 'Dr. M. K. Gupta (Electronics)' },
  { id: 't11', name: 'Ms. S. Rao (Digital Logic)' },
  { id: 't12', name: 'Mr. B. Singh (Software Engineering)' },
];
const initialCourses: Course[] = [
  { id: 'c1', name: 'Engineering Mathematics-I', teacherId: 't1', department: 'Applied Science', year: 1, section: 'A', hoursPerWeek: 4 },
  { id: 'c2', name: 'Engineering Physics', teacherId: 't2', department: 'Applied Science', year: 1, section: 'A', hoursPerWeek: 4 },
  { id: 'c3', name: 'Data Structures & Algorithms', teacherId: 't3', department: 'Computer Science & Engineering', year: 2, section: 'A', hoursPerWeek: 4 },
  { id: 'c4', name: 'Database Management Systems', teacherId: 't4', department: 'Computer Science & Engineering', year: 2, section: 'A', hoursPerWeek: 3 },
  { id: 'c5', name: 'Operating Systems', teacherId: 't5', department: 'Computer Science & Engineering', year: 2, section: 'B', hoursPerWeek: 3 },
  { id: 'c6', name: 'Advanced Algorithms', teacherId: 't3', department: 'Computer Science & Engineering', year: 3, section: 'A', hoursPerWeek: 2 },
  { id: 'c7', name: 'Engineering Chemistry', teacherId: 't6', department: 'Applied Science', year: 1, section: 'A', hoursPerWeek: 4 },
  { id: 'c8', name: 'Professional Communication', teacherId: 't7', department: 'Applied Science', year: 1, section: 'A', hoursPerWeek: 2 },
  { id: 'c9', name: 'Computer Networks', teacherId: 't8', department: 'Computer Science & Engineering', year: 3, section: 'A', hoursPerWeek: 4 },
  { id: 'c10', name: 'Artificial Intelligence', teacherId: 't9', department: 'Computer Science & Engineering', year: 3, section: 'A', hoursPerWeek: 4 },
  { id: 'c11', name: 'Database Management Systems', teacherId: 't4', department: 'Computer Science & Engineering', year: 2, section: 'B', hoursPerWeek: 3 },
  { id: 'c12', name: 'Data Structures & Algorithms', teacherId: 't3', department: 'Computer Science & Engineering', year: 2, section: 'B', hoursPerWeek: 4 },
  { id: 'c13', name: 'Digital Logic Design', teacherId: 't11', department: 'Computer Science & Engineering', year: 2, section: 'A', hoursPerWeek: 4 },
  { id: 'c14', name: 'Software Engineering', teacherId: 't12', department: 'Computer Science & Engineering', year: 3, section: 'A', hoursPerWeek: 3 },
  { id: 'c15', name: 'Electronics Engineering', teacherId: 't10', department: 'Applied Science', year: 1, section: 'A', hoursPerWeek: 4 },
  { id: 'c16', name: 'Web Technology', teacherId: 't12', department: 'Computer Science & Engineering', year: 3, section: 'A', hoursPerWeek: 3 },
  { id: 'c17', name: 'Microprocessors', teacherId: 't11', department: 'Computer Science & Engineering', year: 2, section: 'B', hoursPerWeek: 4 },
];
const initialClassrooms: Classroom[] = [
  { id: 'r1', name: 'Block A - 101', capacity: 70 },
  { id: 'r2', name: 'Block B - 203', capacity: 70 },
  { id: 'r3', name: 'CSE Lab 1 (Block C)', capacity: 40 },
  { id: 'r4', name: 'Seminar Hall (Block A)', capacity: 120 },
];


const useLocalStorageState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
      console.error("Error reading from localStorage", error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error("Error writing to localStorage", error);
    }
  }, [key, state]);

  return [state, setState];
};

const useTheme = (): ['light' | 'dark', () => void] => {
  const [theme, setTheme] = useLocalStorageState<'light' | 'dark'>('theme', 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return [theme, toggleTheme];
};


const ProjectGuide = () => (
  <Card className="mb-8 bg-blue-50 dark:bg-gray-800 border-l-4 border-blue-500 dark:border-blue-400">
    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-3">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      Simplified Workflow
    </h2>
    <div className="space-y-4 text-gray-700 dark:text-gray-300 pl-10">
      <div>
        <h3 className="font-semibold">How It Works</h3>
        <p>This application leverages the power of AI to solve the complex problem of timetable scheduling. It takes all your defined resources and rules to generate multiple optimized, conflict-free timetable solutions.</p>
      </div>
      <div>
        <h3 className="font-semibold">How To Use</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li><strong>Define Schedule Template:</strong> In the "Settings" section, go to the "Schedule Template" tab to set your college's working days, hours, and breaks. This automatically creates all available class slots.</li>
          <li><strong>Add Resources:</strong> Use the "Teachers," "Courses," and "Classrooms" tabs to input your data.</li>
          <li><strong>Add Custom Rules (Optional):</strong> Use the "Additional Constraints" text box for specific requirements (e.g., "No labs on Fridays").</li>
          <li><strong>Generate Timetable:</strong> Click the "Generate Timetable with AI" button.</li>
          <li><strong>View & Export:</strong> The AI will provide several timetable options. You can review them and export your preferred schedule as a PDF or CSV.</li>
        </ol>
      </div>
    </div>
  </Card>
);

const App: React.FC = () => {
  const [theme, toggleTheme] = useTheme();
  const [teachers, setTeachers] = useLocalStorageState<Teacher[]>('rkgit-timetable-teachers', initialTeachers);
  const [courses, setCourses] = useLocalStorageState<Course[]>('rkgit-timetable-courses', initialCourses);
  const [classrooms, setClassrooms] = useLocalStorageState<Classroom[]>('rkgit-timetable-classrooms', initialClassrooms);
  const [timeSlots, setTimeSlots] = useLocalStorageState<TimeSlot[]>('rkgit-timetable-timeSlots', []);
  const [customConstraints, setCustomConstraints] = useLocalStorageState<string>('rkgit-timetable-constraints', 'The lunch break is from 12:00 to 13:00 on all working days.');

  const [generatedTimetables, setGeneratedTimetables] = useState<GeneratedTimetable[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Settings Tabs
  type SettingsTab = 'schedule' | 'teachers' | 'courses' | 'classrooms';
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>('schedule');

  // Schedule Template State
  const [scheduleTemplate, setScheduleTemplate] = useLocalStorageState('rkgit-schedule-template', {
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    dayStartTime: '09:00',
    dayEndTime: '16:00',
    lunchStartTime: '12:00',
    lunchEndTime: '13:00',
    lectureDuration: 60,
  });


  // Form states
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [teacherName, setTeacherName] = useState('');

  const defaultCourseState = { name: '', teacherId: '', department: '', year: 1, section: 'A', hoursPerWeek: 3 };
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState(defaultCourseState);

  const defaultClassroomState = { name: '', capacity: 60 };
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [classroomForm, setClassroomForm] = useState(defaultClassroomState);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (name === 'workingDays') {
      const { checked } = e.target as HTMLInputElement;
      const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const newWorkingDays = checked
        ? [...scheduleTemplate.workingDays, value]
        : scheduleTemplate.workingDays.filter(day => day !== value);

      newWorkingDays.sort((a, b) => daysOrder.indexOf(a) - daysOrder.indexOf(b));

      setScheduleTemplate(prev => ({
        ...prev,
        workingDays: newWorkingDays,
      }));
    } else {
      setScheduleTemplate(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) : value }));
    }
  };

  const handleGenerateTimeSlots = () => {
    const newTimeSlots: TimeSlot[] = [];
    const { workingDays, dayStartTime, dayEndTime, lunchStartTime, lunchEndTime, lectureDuration } = scheduleTemplate;

    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const minutesToTime = (minutes: number) => {
      const h = Math.floor(minutes / 60).toString().padStart(2, '0');
      const m = (minutes % 60).toString().padStart(2, '0');
      return `${h}:${m}`;
    };

    const dayStartMinutes = timeToMinutes(dayStartTime);
    const dayEndMinutes = timeToMinutes(dayEndTime);
    const lunchStartMinutes = timeToMinutes(lunchStartTime);
    const lunchEndMinutes = timeToMinutes(lunchEndTime);

    if (dayStartMinutes >= dayEndMinutes || lunchStartMinutes >= lunchEndMinutes || lectureDuration <= 0) {
      alert("Invalid time settings. Please check your start/end times and duration.");
      return;
    }

    for (const day of workingDays) {
      let currentTimeMinutes = dayStartMinutes;
      while (currentTimeMinutes < dayEndMinutes) {
        const slotEndTimeMinutes = currentTimeMinutes + lectureDuration;

        const isDuringLunch =
          (currentTimeMinutes >= lunchStartMinutes && currentTimeMinutes < lunchEndMinutes) ||
          (slotEndTimeMinutes > lunchStartMinutes && currentTimeMinutes < lunchStartMinutes);

        if (!isDuringLunch && slotEndTimeMinutes <= dayEndMinutes) {
          newTimeSlots.push({
            id: `ts_${day.toLowerCase()}_${newTimeSlots.length}`,
            day: day,
            startTime: minutesToTime(currentTimeMinutes),
            duration: lectureDuration,
          });
        }
        currentTimeMinutes += lectureDuration;
      }
    }
    setTimeSlots(newTimeSlots);
    alert(`Successfully generated ${newTimeSlots.length} time slots.`);
  };


  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedTimetables([]);
    setSuggestions([]);
    try {
      const response = await generateTimetable({ teachers, courses, classrooms, timeSlots, customConstraints });
      if (response.solutions && response.solutions.length > 0) {
        setGeneratedTimetables(response.solutions);
        setSuggestions(response.suggestions || []);
        setActiveTab(0);
      } else {
        setError("The AI couldn't generate a valid timetable with the given constraints.");
        setSuggestions(response.suggestions || ["No specific suggestions were provided."]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [teachers, courses, classrooms, timeSlots, customConstraints]);

  // CRUD Handlers
  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim()) {
      alert("Teacher name cannot be empty or just spaces.");
      return;
    }
    if (editingTeacher) {
      setTeachers(prev => prev.map(t => t.id === editingTeacher.id ? { ...t, name: teacherName.trim() } : t));
    } else {
      setTeachers(prev => [...prev, { id: `t_${Date.now()}`, name: teacherName.trim() }]);
    }
    setEditingTeacher(null);
    setTeacherName('');
  };
  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setTeacherName(teacher.name);
  };
  const handleDeleteTeacher = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this teacher? This will also remove any courses they teach.')) {
      setTeachers(prev => prev.filter(t => t.id !== id));
      setCourses(prev => prev.filter(c => c.teacherId !== id));
    }
  }, [setTeachers, setCourses]);

  const handleCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.name.trim() || !courseForm.teacherId || !courseForm.department.trim() || !courseForm.section.trim() || courseForm.year < 1 || courseForm.year > 4) {
      alert("Please fill all course fields correctly.");
      return;
    }
    if (editingCourse) {
      setCourses(prev => prev.map(c => c.id === editingCourse.id ? { ...c, ...courseForm } : c));
    } else {
      setCourses(prev => [...prev, { id: `c_${Date.now()}`, ...courseForm }]);
    }
    setEditingCourse(null);
    setCourseForm(defaultCourseState);
  };
  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({ name: course.name, teacherId: course.teacherId, department: course.department, year: course.year, section: course.section, hoursPerWeek: course.hoursPerWeek });
  };
  const handleDeleteCourse = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      setCourses(prev => prev.filter(c => c.id !== id));
    }
  }, [setCourses]);

  const handleClassroomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classroomForm.name.trim() || classroomForm.capacity <= 0) {
      alert("Please fill all classroom fields correctly.");
      return;
    }
    if (editingClassroom) {
      setClassrooms(prev => prev.map(r => r.id === editingClassroom.id ? { ...r, ...classroomForm } : r));
    } else {
      setClassrooms(prev => [...prev, { id: `r_${Date.now()}`, ...classroomForm }]);
    }
    setEditingClassroom(null);
    setClassroomForm(defaultClassroomState);
  };
  const handleEditClassroom = (classroom: Classroom) => {
    setEditingClassroom(classroom);
    setClassroomForm({ name: classroom.name, capacity: classroom.capacity });
  };
  const handleDeleteClassroom = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this classroom?')) {
      setClassrooms(prev => prev.filter(r => r.id !== id));
    }
  }, [setClassrooms]);

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all data to default? This will clear all your custom changes and reload the page.')) {
      window.localStorage.removeItem('rkgit-timetable-teachers');
      window.localStorage.removeItem('rkgit-timetable-courses');
      window.localStorage.removeItem('rkgit-timetable-classrooms');
      window.localStorage.removeItem('rkgit-timetable-timeSlots');
      window.localStorage.removeItem('rkgit-timetable-constraints');
      window.localStorage.removeItem('rkgit-schedule-template');
      window.location.reload();
    }
  };


  const settingsTabs: { id: SettingsTab; name: string; icon: React.ReactNode }[] = [
    { id: 'schedule', name: 'Schedule Template', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { id: 'teachers', name: 'Teachers', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { id: 'courses', name: 'Courses', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
    { id: 'classrooms', name: 'Classrooms', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans flex flex-col transition-colors duration-300">
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main className="container mx-auto p-4 md:p-6 lg:p-8 flex-grow">
        <ProjectGuide />
        <Card className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Settings
          </h2>
          <div className="flex justify-between items-center mb-6 border-b dark:border-gray-700 pb-4">
            <p className="text-gray-600 dark:text-gray-400">
              A guided setup to make creating your timetable easier. Start with the 'Schedule Template' to define working hours. Your data is saved automatically.
            </p>
            <button
              onClick={handleResetData}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-md transition-colors whitespace-nowrap"
            >
              Reset Data
            </button>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto" aria-label="Tabs">
              {settingsTabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveSettingsTab(tab.id)}
                  className={`flex items-center gap-2 whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors ${activeSettingsTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                    }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.name}</span>
                  <span className="sm:hidden">{tab.id.charAt(0).toUpperCase() + tab.id.slice(1)}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-4">
            {activeSettingsTab === 'schedule' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">Define Weekly Schedule</h3>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  Set the standard working hours for the college. This will automatically generate all possible lecture slots, excluding breaks.
                </p>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border dark:border-gray-700 rounded-lg space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Working Days</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <label key={day} className="flex items-center gap-2 bg-white dark:bg-gray-700 p-3 rounded-md border dark:border-gray-600 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 has-[:checked]:bg-blue-100 has-[:checked]:border-blue-500 dark:has-[:checked]:bg-blue-900/30 dark:has-[:checked]:border-blue-500">
                          <input type="checkbox" name="workingDays" value={day} checked={scheduleTemplate.workingDays.includes(day)} onChange={handleTemplateChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="dayStartTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start of Day</label>
                      <input type="time" id="dayStartTime" name="dayStartTime" value={scheduleTemplate.dayStartTime} onChange={handleTemplateChange} className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                    </div>
                    <div>
                      <label htmlFor="dayEndTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End of Day</label>
                      <input type="time" id="dayEndTime" name="dayEndTime" value={scheduleTemplate.dayEndTime} onChange={handleTemplateChange} className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                    </div>
                    <div>
                      <label htmlFor="lunchStartTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lunch Break Start</label>
                      <input type="time" id="lunchStartTime" name="lunchStartTime" value={scheduleTemplate.lunchStartTime} onChange={handleTemplateChange} className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                    </div>
                    <div>
                      <label htmlFor="lunchEndTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lunch Break End</label>
                      <input type="time" id="lunchEndTime" name="lunchEndTime" value={scheduleTemplate.lunchEndTime} onChange={handleTemplateChange} className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="lectureDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lecture Duration (minutes)</label>
                      <input type="number" id="lectureDuration" name="lectureDuration" min="1" value={scheduleTemplate.lectureDuration} onChange={handleTemplateChange} className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <button onClick={handleGenerateTimeSlots} className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 whitespace-nowrap">Generate & Save Slots</button>
                    {timeSlots.length > 0 && <p className="text-sm text-green-700 dark:text-green-400">{timeSlots.length} time slots are currently configured.</p>}
                  </div>
                </div>
              </div>
            )}
            {activeSettingsTab === 'teachers' && (
              <div>
                <form onSubmit={handleTeacherSubmit} className="flex items-center gap-2 mb-4">
                  <input type="text" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} placeholder="Teacher's Name & Specialization" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500" />
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 whitespace-nowrap">{editingTeacher ? 'Update' : 'Add'}</button>
                  {editingTeacher && <button type="button" onClick={() => { setEditingTeacher(null); setTeacherName(''); }} className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600">Cancel</button>}
                </form>
                <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {teachers.map(t => (
                    <li key={t.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                      <span className="text-gray-800 dark:text-gray-200 text-sm">{t.name}</span>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleEditTeacher(t)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" aria-label={`Edit ${t.name}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg></button>
                        <button onClick={() => handleDeleteTeacher(t.id)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" aria-label={`Delete ${t.name}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {activeSettingsTab === 'courses' && (
              <div>
                <form onSubmit={handleCourseSubmit} className="p-4 bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-700 rounded-lg mb-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" value={courseForm.name} onChange={e => setCourseForm({ ...courseForm, name: e.target.value })} placeholder="Course Name" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500" />
                    <select value={courseForm.teacherId} onChange={e => setCourseForm({ ...courseForm, teacherId: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200">
                      <option value="" disabled>Select Teacher</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <input type="text" value={courseForm.department} onChange={e => setCourseForm({ ...courseForm, department: e.target.value })} placeholder="Department" required className="md:col-span-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500" />
                    <input type="number" min="1" max="4" value={courseForm.year} onChange={e => setCourseForm({ ...courseForm, year: parseInt(e.target.value) || 1 })} placeholder="Year (e.g., 2)" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500" />
                    <input type="text" value={courseForm.section} onChange={e => setCourseForm({ ...courseForm, section: e.target.value.toUpperCase() })} placeholder="Section (e.g., A)" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500" />
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hours/Week: <span className="font-bold text-blue-600 dark:text-blue-400">{courseForm.hoursPerWeek}</span></label>
                      <input type="range" min="1" max="8" value={courseForm.hoursPerWeek} onChange={e => setCourseForm({ ...courseForm, hoursPerWeek: parseInt(e.target.value) })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400">{editingCourse ? 'Update' : 'Add'}</button>
                    {editingCourse && <button type="button" onClick={() => { setEditingCourse(null); setCourseForm(defaultCourseState); }} className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600">Cancel</button>}
                  </div>
                </form>
                <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {courses.map(c => (
                    <li key={c.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                      <span className="text-gray-800 dark:text-gray-200 text-sm">{`${c.name} (Yr: ${c.year}, Sec: ${c.section})`}</span>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleEditCourse(c)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" aria-label={`Edit ${c.name}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg></button>
                        <button onClick={() => handleDeleteCourse(c.id)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" aria-label={`Delete ${c.name}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {activeSettingsTab === 'classrooms' && (
              <div>
                <form onSubmit={handleClassroomSubmit} className="grid grid-cols-1 md:grid-cols-3 items-center gap-3 mb-4">
                  <input type="text" value={classroomForm.name} onChange={e => setClassroomForm({ ...classroomForm, name: e.target.value })} placeholder="Classroom Name" required className="md:col-span-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500" />
                  <input type="number" min="1" value={classroomForm.capacity} onChange={e => setClassroomForm({ ...classroomForm, capacity: parseInt(e.target.value) || 0 })} placeholder="Capacity" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500" />
                  <div className="flex items-center gap-2 md:col-span-3">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400">{editingClassroom ? 'Update' : 'Add'}</button>
                    {editingClassroom && <button type="button" onClick={() => { setEditingClassroom(null); setClassroomForm(defaultClassroomState); }} className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600">Cancel</button>}
                  </div>
                </form>
                <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {classrooms.map(r => (
                    <li key={r.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                      <span className="text-gray-800 dark:text-gray-200 text-sm">{`${r.name} (Cap: ${r.capacity})`}</span>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleEditClassroom(r)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" aria-label={`Edit ${r.name}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg></button>
                        <button onClick={() => handleDeleteClassroom(r.id)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" aria-label={`Delete ${r.name}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </Card>

        <Card className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            Additional Constraints
          </h3>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Provide specific rules in plain English to guide the AI. For example, "Dr. Singh prefers not to have classes before 10 AM" or "No labs on Fridays for 2nd Year students".
          </p>
          <textarea
            value={customConstraints}
            onChange={(e) => setCustomConstraints(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="One constraint per line..."
          />
        </Card>

        <div className="text-center my-10">
          <button
            onClick={handleGenerate}
            disabled={isLoading || teachers.length === 0 || courses.length === 0 || classrooms.length === 0 || timeSlots.length === 0}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-10 rounded-full shadow-xl transition-all duration-300 ease-in-out transform hover:scale-110 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:scale-100 flex items-center gap-3 mx-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 01-1.414 1.414L12 6.414l-2.293 2.293a1 1 0 01-1.414-1.414L10 4.707M12 21l2.293-2.293a1 1 0 01-1.414-1.414L12 17.586l-2.293-2.293a1 1 0 01-1.414 1.414L10 19.293m9.293-9.293l-2.293 2.293a1 1 0 01-1.414-1.414L17.586 12l-2.293-2.293a1 1 0 011.414-1.414L19.293 10m-16 0l2.293 2.293a1 1 0 011.414-1.414L6.414 12l2.293-2.293a1 1 0 01-1.414-1.414L4.707 10" /></svg>
            {isLoading ? 'Generating...' : 'Generate Timetable with AI'}
          </button>
          {timeSlots.length === 0 && <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-4">Please generate time slots from the 'Schedule Template' in Settings before generating a timetable.</p>}
        </div>

        {isLoading && <LoadingSpinner />}

        {error && (
          <Card className="mb-8 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-800 dark:text-red-200">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <h3 className="font-bold text-lg">An Error Occurred</h3>
            </div>
            <p className="mt-2 pl-9">{error}</p>
          </Card>
        )}

        {suggestions.length > 0 && (
          <Card className="mb-8 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              <h3 className="font-bold text-lg">Suggestions for Improvement</h3>
            </div>
            <ul className="list-disc list-inside space-y-1 mt-2 pl-9">
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </Card>
        )}

        {generatedTimetables.length > 0 && !isLoading && (
          <Card>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">Generated Timetables</h2>
            <div className="mb-4">
              <nav className="flex space-x-2" aria-label="Tabs">
                {generatedTimetables.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTab(index)}
                    className={`
                        ${activeTab === index ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}
                        px-4 py-2 font-medium text-sm rounded-lg transition-all
                      `}
                  >
                    Option {index + 1}
                  </button>
                ))}
              </nav>
            </div>
            <div>
              <TimetableGrid
                timetableData={generatedTimetables[activeTab]}
                teachers={teachers}
                courses={courses}
                classrooms={classrooms}
                timeSlots={timeSlots}
                timetableIndex={activeTab}
              />
            </div>
          </Card>
        )}

        {!isLoading && !error && generatedTimetables.length === 0 && (
          <Card className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-2xl font-semibold text-gray-800 dark:text-gray-200">Ready to Generate a Timetable?</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              After configuring your settings, click the generate button to see the AI in action.
            </p>
          </Card>
        )}

      </main>
      <Footer />
    </div>
  );
};

export default App;
