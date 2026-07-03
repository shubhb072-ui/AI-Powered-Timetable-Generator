
import React from 'react';
import type { GeneratedTimetable, Teacher, Course, Classroom, TimeSlot, TimetableEntry } from '../types';

declare global {
  interface Window {
    jspdf: any;
  }
}

interface TimetableGridProps {
  timetableData: GeneratedTimetable;
  teachers: Teacher[];
  courses: Course[];
  classrooms: Classroom[];
  timeSlots: TimeSlot[];
  timetableIndex: number;
}

const TimetableGrid: React.FC<TimetableGridProps> = ({ timetableData, teachers, courses, classrooms, timeSlots, timetableIndex }) => {
  const stringToColor = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const getTextColor = (hexColor: string): string => {
    const rgb = hexToRgb(hexColor);
    if (!rgb) return '#000000';
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? 'text-gray-800' : 'text-white';
  };

  const calculateEndTime = (startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate.getTime() + duration * 60000);
    return `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
  };

  const timeSlotsWithEndTime: (TimeSlot & { endTime: string })[] = timeSlots.map(ts => ({
    ...ts,
    endTime: calculateEndTime(ts.startTime, ts.duration),
  }));

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const days = Array.from(new Set(timeSlotsWithEndTime.map(ts => ts.day))).sort((a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b));

  const uniqueTimeSlots = Array.from(new Map(timeSlotsWithEndTime.map(ts => [`${ts.startTime}-${ts.endTime}`, ts])).values())
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const findItemName = <T extends { id: string; name: string }>(items: T[], id: string) => {
    return items.find(item => item.id === id)?.name || 'N/A';
  };

  const departments = [...new Set(timetableData.timetable.map(e => e.department))].sort();

  const handleExportCSV = () => {
    const headers = ['Department', 'Year', 'Section', 'Day', 'Start Time', 'End Time', 'Course', 'Teacher', 'Classroom'];
    const rows = timetableData.timetable
      .sort((a, b) =>
        a.department.localeCompare(b.department) ||
        a.year - b.year ||
        a.section.localeCompare(b.section) ||
        daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day) ||
        a.startTime.localeCompare(b.startTime)
      )
      .map(entry => [
        `"${entry.department}"`,
        `"${entry.year}"`,
        `"${entry.section}"`,
        `"${entry.day}"`,
        `"${entry.startTime}"`,
        `"${entry.endTime}"`,
        `"${findItemName(courses, entry.courseId)}"`,
        `"${findItemName(teachers, entry.teacherId)}"`,
        `"${findItemName(classrooms, entry.classroomId)}"`
      ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rkgit-timetable-option-${timetableIndex + 1}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      alert("Error: PDF generation library is not loaded.");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape' });

    doc.text(`RKGIT B.TECH Timetable - Option ${timetableIndex + 1}`, 14, 16);

    let startY = 25;

    departments.forEach(dept => {
      const studentGroups: { year: number; section: string }[] = [...new Map<string, { year: number; section: string }>(
        timetableData.timetable
          .filter((entry: TimetableEntry) => entry.department === dept)
          .map((entry: TimetableEntry) => ({ year: entry.year, section: entry.section }))
          .map((group: { year: number; section: string }) => [`${group.year}-${group.section}`, group])
      ).values()].sort((a: { year: number; section: string }, b: { year: number; section: string }) => a.year - b.year || a.section.localeCompare(b.section));

      if (studentGroups.length > 0) {
        doc.setFontSize(16);
        doc.text(`${dept} Department`, 14, startY);
        startY += 10;
      }

      studentGroups.forEach(group => {
        doc.setFontSize(12);
        doc.text(`Year: ${group.year}, Section: ${group.section}`, 14, startY);
        startY += 8;

        const head = [['Day', 'Time', 'Course', 'Teacher', 'Classroom']];
        const body = timetableData.timetable
          .filter(entry => entry.department === dept && entry.year === group.year && entry.section === group.section)
          .sort((a, b) => {
            const dayComparison = daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day);
            return dayComparison === 0 ? a.startTime.localeCompare(b.startTime) : dayComparison;
          })
          .map(entry => [
            entry.day,
            `${entry.startTime} - ${entry.endTime}`,
            findItemName(courses, entry.courseId),
            findItemName(teachers, entry.teacherId),
            findItemName(classrooms, entry.classroomId)
          ]);

        if (body.length > 0) {
          (doc as any).autoTable({
            head: head,
            body: body,
            startY: startY,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [22, 160, 133] },
          });
          startY = (doc as any).autoTable.previous.finalY + 12;
        } else {
          startY += 8;
        }
      });
    });

    doc.save(`rkgit-timetable-option-${timetableIndex + 1}.pdf`);
  };

  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
      <div className="flex justify-end items-center space-x-3 mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Export Options:</span>
        <button onClick={handleExportPDF} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          PDF
        </button>
        <button onClick={handleExportCSV} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          CSV
        </button>
      </div>

      {departments.map(dept => {
        const studentGroups: { year: number; section: string }[] = [...new Map<string, { year: number; section: string }>(
          timetableData.timetable
            .filter((entry: TimetableEntry) => entry.department === dept)
            .map((entry: TimetableEntry) => ({ year: entry.year, section: entry.section }))
            .map((group: { year: number; section: string }) => [`${group.year}-${group.section}`, group])
        ).values()].sort((a: { year: number; section: string }, b: { year: number; section: string }) => a.year - b.year || a.section.localeCompare(b.section));

        return (
          <div key={dept} className="mb-12">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200 border-b-2 border-blue-500 dark:border-blue-400 pb-2">{dept} Department</h3>

            {studentGroups.map(group => {


              const timeToMinutes = (time: string): number => {
                const [hours, minutes] = time.split(':').map(Number);
                return hours * 60 + minutes;
              };

              const findCourseForGroup = (day: string, slotStartTime: string, slotEndTime: string) => {
                return timetableData.timetable.find(entry => {
                  if (entry.department !== dept || entry.year !== group.year || entry.section !== group.section || entry.day !== day) {
                    return false;
                  }

                  const entryStart = timeToMinutes(entry.startTime);
                  const entryEnd = timeToMinutes(entry.endTime);
                  const slotStart = timeToMinutes(slotStartTime);
                  const slotEnd = timeToMinutes(slotEndTime);

                  return slotStart >= entryStart && slotEnd <= entryEnd;
                });
              };
              return (
                <div key={`${group.year}-${group.section}`} className="mb-8">
                  <h4 className="text-xl font-medium mb-3 text-gray-700 dark:text-gray-300">Year: {group.year}, Section: {group.section}</h4>
                  <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-100 dark:bg-gray-700 z-10 w-32">
                            Time
                          </th>
                          {days.map(day => (
                            <th key={day} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                              {day}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {uniqueTimeSlots.map(slot => (
                          <tr key={`${slot.startTime}-${slot.endTime}`}>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/50 sticky left-0 z-10 w-32">{`${slot.startTime} - ${slot.endTime}`}</td>
                            {days.map(day => {
                              const entry = findCourseForGroup(day, slot.startTime, slot.endTime);
                              const courseName = entry ? findItemName(courses, entry.courseId) : '';
                              const color = courseName ? stringToColor(courseName) : 'transparent';
                              const textColorClass = getTextColor(color);

                              return (
                                <td key={day} className="px-2 py-2 whitespace-normal text-sm text-gray-700 dark:text-gray-300">
                                  {entry ? (
                                    <div style={{ backgroundColor: color, borderLeftColor: color }} className={`p-3 rounded-lg shadow-sm h-full border-l-4 ${textColorClass}`}>
                                      <p className="font-bold text-base">{courseName}</p>
                                      <p className="text-xs opacity-90">{findItemName(teachers, entry.teacherId)}</p>
                                      <p className="text-xs opacity-90 italic">Room: {findItemName(classrooms, entry.classroomId)}</p>
                                    </div>
                                  ) : <div className="h-full"></div>}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
            {studentGroups.length === 0 && <p className="text-gray-500 dark:text-gray-400">No classes scheduled for this department.</p>}
          </div>
        )
      })}
    </div>
  );
};

export default TimetableGrid;
