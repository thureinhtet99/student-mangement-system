export const APP_CONFIG = {
  APP_NAME: "ClassMate",
  APP_DESCRIPTION: "ClassMate student management system",
  APP_VERSION: "1.0.0",
  DEFAULT_LANGUAGE: "en",
};

// Routes
export const ROUTE_CONFIG = {
  SIGNIN: "/auth/sign-in",
  SIGNUP: "/auth/sign-up",

  HOME: "/",
  ADMIN: "/admin",
  TEACHER: "/teacher",
  STUDENT: "/student",
  PARENT: "/parent",
  PROFILE: "/profile",
  SETTINGS: "/settings",
  TEACHER_LIST: "/list/teachers",
  STUDENT_LIST: "/list/students",
  PARENT_LIST: "/list/parents",
  SUBJECT_LIST: "/list/subjects",
  CLASS_LIST: "/list/classes",
  LESSON_LIST: "/list/lessons",
  EXAM_LIST: "/list/exams",
  ASSIGNMENT_LIST: "/list/assignments",
  RESULT_LIST: "/list/results",
  ATTENDANCE_LIST: "/list/attendances",
  EVENT_LIST: "/list/events",
  MESSAGE_LIST: "/list/messages",
  ANNOUNCEMENT_LIST: "/list/announcements",
};

export const CLOUDINARY_CONFIG = {
  CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!!,
  API_KEY: process.env.CLOUDINARY_API_KEY!!,
  API_SECRET: process.env.CLOUDINARY_API_SECRET!!,
  UPLOAD_PRESET: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!!,
  FOLDER: {
    TEACHERS: "classmate/teachers",
    STUDENTS: "classmate/students",
    PROFILE: "classmate/profiles",
    DOCUMENTS: "classmate/documents",
  },
  TRANSFORMATION: {
    PROFILE_AVATAR: "w_200,h_200,c_fill,g_face,q_auto,f_auto",
    PROFILE_LARGE: "w_400,h_400,c_fill,g_face,q_auto,f_auto",
    THUMBNAIL: "w_100,h_100,c_fill,q_auto,f_auto",
    DOCUMENT: "q_auto,f_auto",
  },
  MAX_FILE_SIZE: 2 * 1024 * 1024, // 2MB
  ALLOWED_FORMATS: ["jpg", "jpeg", "png", "webp"],
  // UPLOAD_URL: `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
};
