
import { GoogleGenAI, Type } from "@google/genai";
import type { Teacher, Course, Classroom, TimeSlot, TimetableResponse } from '../types';

interface TimetableGenerationParams {
  teachers: Teacher[];
  courses: Course[];
  classrooms: Classroom[];
  timeSlots: TimeSlot[];
  customConstraints: string;
}

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.error("Missing VITE_GEMINI_API_KEY in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export const generateTimetable = async ({
  teachers,
  courses,
  classrooms,
  timeSlots,
  customConstraints,
}: TimetableGenerationParams): Promise<TimetableResponse> => {
  const model = 'gemini-2.5-flash';

  const prompt = `
    You are an expert AI assistant specializing in solving complex scheduling and optimization problems. Your task is to generate a weekly college timetable based on a set of constraints.

    Here are the constraints and data provided:

    1. Teachers:
    ${JSON.stringify(teachers, null, 2)}

    2. Courses (each with assigned teacher, department, year, section, and weekly hours):
    ${JSON.stringify(courses, null, 2)}

    3. Classrooms (each with a capacity):
    ${JSON.stringify(classrooms, null, 2)}
    
    4. Available Time Slots (duration is in minutes):
    ${JSON.stringify(timeSlots, null, 2)}

    Please adhere to the following rules:
    - A teacher cannot teach two different courses at the same time.
    - A classroom cannot be occupied by two different courses at the same time.
    - A student group (defined by the combination of department, year, and section) cannot have two different courses scheduled at the same time.
    - Each course has a 'hoursPerWeek' requirement. You must schedule classes for a course such that the total duration per week equals this requirement. For example, a 3-hour course needs to be scheduled for a total of 180 minutes per week.
    - The duration of each available time slot is provided in minutes.
    - You can schedule a course lecture to span one or more contiguous available time slots if needed. For example, a 2-hour (120-minute) lecture can occupy two adjacent 60-minute time slots.
    - Break down the total 'hoursPerWeek' for a course into logical lecture sessions (e.g., a 4-hour course could be two 2-hour sessions). Create a balanced schedule for each student group.
    - Assign a suitable classroom for each scheduled class. Classroom capacity is a soft constraint, but try to use appropriate rooms.
    - A student group should not have more than 2 consecutive classes without a break. Ensure there is a gap (like a lunch break or an empty slot) after every 2 consecutive lectures for any given student group.

    ${customConstraints ? `Additionally, here are some user-defined constraints you must follow:\n${customConstraints}` : ''}

    Your task is to generate 2 different, valid, and optimized timetable options. Prioritize minimizing conflicts and spreading out classes for each student group.

    If you cannot generate a perfect timetable that satisfies all constraints, provide the best possible options along with specific, actionable suggestions for what constraints could be relaxed to achieve a better solution. For example, suggest adding more time slots, hiring another teacher for a specific subject, or adjusting course hours.

    Return your response as a JSON object that adheres to the provided schema.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      solutions: {
        type: Type.ARRAY,
        description: "An array of possible timetable solutions.",
        items: {
          type: Type.OBJECT,
          properties: {
            timetable: {
              type: Type.ARRAY,
              description: "A list of all the scheduled classes for one complete timetable.",
              items: {
                type: Type.OBJECT,
                properties: {
                  courseId: { type: Type.STRING, description: "The ID of the course." },
                  teacherId: { type: Type.STRING, description: "The ID of the teacher." },
                  classroomId: { type: Type.STRING, description: "The ID of the classroom." },
                  day: { type: Type.STRING, description: "The day of the week (e.g., 'Monday')." },
                  startTime: { type: Type.STRING, description: "The start time (e.g., '09:00')." },
                  endTime: { type: Type.STRING, description: "The end time (e.g., '10:00')." },
                  department: { type: Type.STRING, description: "The department offering the course." },
                  year: { type: Type.NUMBER, description: "The year of the student group (e.g., 1, 2, 3, 4)." },
                  section: { type: Type.STRING, description: "The section of the student group (e.g., 'A', 'B')." },
                },
                required: ["courseId", "teacherId", "classroomId", "day", "startTime", "endTime", "department", "year", "section"],
              },
            },
          },
        },
      },
      suggestions: {
        type: Type.ARRAY,
        description: "An array of strings containing suggestions for improvement if an optimal solution is not possible.",
        items: {
          type: Type.STRING,
        },
      },
    },
    required: ["solutions", "suggestions"],
  };

  try {
    const result = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = result.text.trim();
    const parsedResponse = JSON.parse(jsonText) as TimetableResponse;

    // Basic validation
    if (!parsedResponse.solutions || !Array.isArray(parsedResponse.solutions)) {
      throw new Error("Invalid response format: 'solutions' array is missing.");
    }

    return parsedResponse;
  } catch (error) {
    console.error("Error generating timetable with Gemini:", error);
    throw new Error(`Failed to generate timetable. ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
