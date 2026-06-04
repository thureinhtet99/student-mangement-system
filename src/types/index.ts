import {
  Announcement,
  Assignment,
  Class,
  Event,
  Exam,
  Lesson,
  Parent,
  Result,
  Student,
  Subject,
  Teacher,
  Attendance,
  Grade,
  Admin,
  Message,
} from "../../prisma/generated/client";
import React from "react";

export type PerformanceType = {
  results?: {
    id: number;
    score: number;
    exam?: { name: string } | null;
    assignment?: { name: string } | null;
  }[];
};

export type EventType = {
  title: string;
  description?: string | "";
  date: Date;
};

export type BadgeListType = {
  table: {
    id: string | number;
    name: string;
  }[];
  text?: string;
  route?: string;
};

export type MultiSelectBoxType<
  T extends { id: string | number; name: string },
> = {
  name: string;
  subject: string;
  verb: string;
  items: T[];
  selectedItems: (string | number)[];
  setSelectedItems: React.Dispatch<React.SetStateAction<(string | number)[]>>;
};

export type TableSortType = {
  viewType: string;
  queryParams: { [key: string]: string | undefined };
  type?: string;
};

export type TableSearchType = {
  table: string;
  queryParams: { [key: string]: string | undefined };
};

export type FormActionButtonType = {
  form: {
    reset: () => void;
    clearErrors: () => void;
  };
  setSelectedItems?: (items: any[]) => void;
  setIsImageLoading?: (loading: boolean) => void;
  resetMutation: () => void;
  isPending: boolean;
  isImageLoading?: boolean;
  type: "create" | "update";
  customReset?: () => void;
};

export type FormContainerType = {
  table:
    | "admin"
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement"
    | "grade"
    | "message";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
  relatedData?: any;
};

export type PaginationType = {
  currentPage?: number;
  page?: number;
  count?: number;
  hasNextPage: boolean;
};

export type CustomTitleType = {
  name: string;
  fontSize?: any;
  marginY?: any;
};

export type AdminListType = Admin;

export type TeacherListType = Teacher & {
  subjects?: Subject[];
  classes?: Class[];
};

export type StudentListType = Student & {
  parent?: Parent | null;
  class?: Class | null;
  grade?: Grade | null;
  attendances?: Attendance[];
  results?: Result[];
};

export type ParentListType = Parent & {
  students?: Student[];
};

export type ClassListType = Class & {
  teacher?: Teacher | null;
  subjects?: Subject[];
  students?: Student[];
  events?: Event[];
  announcements?: Announcement[];
};

export type SubjectListType = Subject & {
  class?: Class | null;
  teachers?: Teacher[];
  lessons?: Lesson[];
  assignments?: Assignment[];
  exams?: Exam[];
};

export type LessonListType = Lesson & {
  subject?: Subject | null;
};

export type GradeListType = Grade & {
  students: Student[];
};

export type ExamListType = Exam & {
  subject?: Subject & {
    class?: Class;
  };
  results: Result[];
};

export type AssignmentListType = Assignment & {
  subject?: Subject;
  results: Result[];
};

export type ResultListType = Result & {
  exam?: Exam;
  assignment?: Assignment;
  student?: Student;
  type?: "exam" | "assignment";
};

export type AttendanceListType = Attendance & {
  student?: Student & { class?: Class };
};

export type EventListType = Event & { class?: Class | null };

export type AnnouncementListType = Announcement & {
  class?: Class;
};

export type MessageListType = Message;

// export { UserGender, Day };
