
export interface Teacher {
  id: string;
  name: string;
}

export interface Course {
  id: string;
  name: string;
  teacherId: string;
  department: string;
  year: number;
  section: string;
  hoursPerWeek: number;
}

export interface Classroom {
  id: string;
  name: string;
  capacity: number;
}

export interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  duration: number;
}

export interface TimetableEntry {
  courseId: string;
  teacherId: string;
  classroomId: string;
  day: string;
  startTime: string;
  endTime: string;
  department: string;
  year: number;
  section: string;
}

export interface GeneratedTimetable {
  timetable: TimetableEntry[];
}

export interface TimetableResponse {
  solutions: GeneratedTimetable[];
  suggestions: string[];
}
