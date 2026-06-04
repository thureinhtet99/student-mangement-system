import { z } from "zod";

// Teacher
export const teacherFormSchema = z.object({
  id: z.coerce.string().optional(),
  username: z.string().optional(),
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .optional()
    .or(
      z.string().min(8, { message: "Password must be at least 8 characters" })
    ),
  name: z.string().min(1, { message: "Name is required" }),
  phone: z.string().optional(),
  address: z.string().optional(),
  birthday: z.coerce
    .date()
    .refine((date) => date < new Date(), {
      message: "Birthday must be in the past",
    })
    .optional(),
  gender: z.enum(["MALE", "FEMALE"], { message: "Gender is required" }),
  image: z.union([z.string(), z.instanceof(File)]).optional(),
  removePhoto: z.boolean().optional(),
  subjects: z.array(z.coerce.number()).optional(),
  classes: z.array(z.coerce.number()).optional(),
});
export type TeacherFormSchema = z.infer<typeof teacherFormSchema>;

// Student
export const studentFormSchema = z.object({
  id: z.coerce.string().optional(),
  username: z.string().optional(),
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .optional()
    .or(
      z.string().min(8, { message: "Password must be at least 8 characters" })
    ),
  name: z.string().min(1, { message: "Name is required" }),
  phone: z.string().optional(),
  address: z.string().optional(),
  birthday: z.coerce
    .date()
    .refine((date) => date < new Date(), {
      message: "Birthday must be in the past",
    })
    .optional(),
  gender: z.enum(["MALE", "FEMALE"], { message: "Gender is required" }),
  image: z.union([z.string(), z.instanceof(File)]).optional(),
  removePhoto: z.boolean().optional(),
  classId: z.coerce.number().optional(),
  parentId: z.coerce.string().optional(),
});
export type StudentFormSchema = z.infer<typeof studentFormSchema>;

// Parent
export const parentFormSchema = z.object({
  id: z.coerce.string().optional(),
  username: z.string().optional(),
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .optional()
    .or(
      z.string().min(8, { message: "Password must be at least 8 characters" })
    ),
  name: z.string().min(1, { message: "Name is required" }),
  phone: z.string().optional(),
  address: z.string().optional(),
  students: z.array(z.coerce.string()).optional(),
});
export type ParentFormSchema = z.infer<typeof parentFormSchema>;

// Class
export const classFormSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Name is required" }),
  teacherId: z.coerce.string().optional(),
  subjects: z.array(z.coerce.number()).optional(),
  students: z.array(z.coerce.string()).optional(),
});
export type ClassFormSchema = z.infer<typeof classFormSchema>;

// Subject
export const subjectFormSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional(),
  classId: z.coerce.number().optional(),
  lessons: z.array(z.coerce.number()).optional(),
  teachers: z.array(z.coerce.string()).optional(),
});
export type SubjectFormSchema = z.infer<typeof subjectFormSchema>;

// Lesson
export const lessonFormSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Name is required" }),
  subjectId: z.coerce.number().optional(),
});
export type LessonFormSchema = z.infer<typeof lessonFormSchema>;

// Attendance
export const attendanceFormSchema = z.object({
  id: z.coerce.number().optional(),
  present: z.boolean(),
  studentId: z.coerce.string().min(1, { message: "Student is required" }),
  date: z.coerce.date().refine(
    (date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    },
    {
      message: "Date must be today or after today",
    }
  ),
});
export type AttendanceFormSchema = z.infer<typeof attendanceFormSchema>;

// Assignment
export const assignmentFormSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Name is required" }),
  dueDate: z.coerce.date().refine(
    (date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    },
    {
      message: "Duedate must be today or after today",
    }
  ),
  subjectId: z.coerce.number({ message: "Subject is required" }),
});
export type AssignmentFormSchema = z.infer<typeof assignmentFormSchema>;

// Exam
export const examFormSchema = z
  .object({
    id: z.coerce.number().optional(),
    name: z.string().min(1, { message: "Name is required" }),
    description: z.string().optional(),
    startTime: z.coerce.date().refine(
      (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      },
      {
        message: "Start time must be today or after today",
      }
    ),
    endTime: z.coerce.date().refine(
      (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      },
      {
        message: "End time must be today or after today",
      }
    ),
    subjectId: z.coerce.number({ message: "Subject is required" }),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return data.endTime > data.startTime;
      }
      return true;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );
export type ExamFormSchema = z.infer<typeof examFormSchema>;

// Result
export const resultFormSchema = z
  .object({
    id: z.coerce.number().optional(),
    score: z.coerce
      .number()
      .min(0, { message: "Score must be at least 0" })
      .max(100, { message: "Score must be at most 100" }),
    comment: z.string().optional(),
    studentId: z.coerce.string().min(1, { message: "Student is required" }),
    examId: z.coerce.number().optional(),
    assignmentId: z.coerce.number().optional(),
  })
  .refine((data) => data.examId || data.assignmentId, {
    message: "Exam is required",
    path: ["examId"],
  })
  .refine((data) => data.examId || data.assignmentId, {
    message: "Assignment is required",
    path: ["assignmentId"],
  });
export type ResultFormSchema = z.infer<typeof resultFormSchema>;

// Event
export const eventFormSchema = z
  .object({
    id: z.coerce.number().optional(),
    name: z.string().min(1, { message: "Name is required" }),
    description: z.string().optional(),
    startTime: z.coerce
      .date()
      .refine(
        (date) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return date >= today;
        },
        {
          message: "Start time must be today or after today",
        }
      )
      .optional(),
    endTime: z.coerce
      .date()
      .refine(
        (date) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return date >= today;
        },
        {
          message: "End time must be today or after today",
        }
      )
      .optional(),
    classId: z.coerce.number().optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return data.endTime > data.startTime;
      }
      return true;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );
export type EventFormSchema = z.infer<typeof eventFormSchema>;

// Announcement
export const announcementFormSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional(),
  date: z.coerce
    .date()
    .refine(
      (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      },
      {
        message: "Date must be today or after today",
      }
    )
    .optional(),
  classId: z.coerce.number().optional(),
});
export type AnnouncementFormSchema = z.infer<typeof announcementFormSchema>;

// Message
export const messageFormSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().optional(),
  content: z.string().min(1, { message: "Content is required" }),
  // senderId: z.string(),
  // receiverId: z.string(),
  read: z.boolean().default(false),
});
export type MessageFormSchema = z.infer<typeof messageFormSchema>;
