"use server";

import { revalidatePath } from "next/cache";
import {
  ClassFormSchema,
  SubjectFormSchema,
  TeacherFormSchema,
  StudentFormSchema,
  ParentFormSchema,
  LessonFormSchema,
  ExamFormSchema,
  AssignmentFormSchema,
  EventFormSchema,
  AnnouncementFormSchema,
  AttendanceFormSchema,
  ResultFormSchema,
  MessageFormSchema,
} from "./formSchema";
import prisma from "./prisma";
import cloudinary from "./cloudinary";
import { CLOUDINARY_CONFIG, ROUTE_CONFIG } from "@/configs/appConfig";
import { clerkClient } from "@clerk/nextjs/server";
// import { clerkClient } from "@clerk/nextjs/server";

//---------- GET ----------//
// Teacher
export const getTeachers = async () => {
  try {
    const teachers = await prisma.teacher.findMany({
      orderBy: { name: "asc" },
      include: {
        subjects: true,
        classes: true,
      },
    });

    return { teachers, success: true, error: false };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to get teachers"
    );
  }
};

export const getTeacherById = async (id: string) => {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        subjects: true,
        classes: true,
      },
    });

    return { teacher, success: true, error: false };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to get teacher by id"
    );
  }
};

export const getTeacherPerformance = async (teacherId: string) => {
  try {
    // Get teacher with their subjects and classes
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        subjects: true,
        classes: {
          include: {
            students: {
              include: {
                results: {
                  include: {
                    exam: { include: { subject: true } },
                    assignment: { include: { subject: true } },
                  },
                },
                attendances: {
                  where: {
                    date: {
                      gte: new Date(new Date().getFullYear(), 0, 1), // This year
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!teacher) {
      return { performance: null, success: false, error: "Teacher not found" };
    }

    // Calculate performance metrics
    let totalStudents = 0;
    let totalResults = 0;
    let totalScore = 0;
    let totalAttendances = 0;
    let presentAttendances = 0;

    // Get all students in teacher's classes
    for (const classData of teacher.classes) {
      totalStudents += classData.students.length;

      for (const student of classData.students) {
        // Count results for teacher's subjects
        const subjectIds = teacher.subjects.map((s) => s.id);
        const relevantResults = student.results.filter((result) => {
          const subjectId =
            result.exam?.subject?.id || result.assignment?.subject?.id;
          return subjectId && subjectIds.includes(subjectId);
        });

        totalResults += relevantResults.length;
        totalScore += relevantResults.reduce(
          (sum, result) => sum + result.score,
          0
        );

        // Count attendances
        totalAttendances += student.attendances.length;
        presentAttendances += student.attendances.filter(
          (att) => att.present
        ).length;
      }
    }

    // Calculate metrics
    const averageScore = totalResults > 0 ? totalScore / totalResults : 0;
    const attendanceRate =
      totalAttendances > 0 ? (presentAttendances / totalAttendances) * 100 : 0;
    const passRate =
      totalResults > 0
        ? totalResults > 0
          ? averageScore >= 60
            ? 90
            : 70
          : 0
        : 85; // Mock calculation

    const performance = {
      totalStudents,
      totalSubjects: teacher.subjects.length,
      totalClasses: teacher.classes.length,
      averageScore: Math.round(averageScore),
      attendanceRate: Math.round(attendanceRate),
      passRate: Math.round(passRate),
      overallRating:
        Math.round(
          ((averageScore / 100) * 0.4 +
            (attendanceRate / 100) * 0.3 +
            (passRate / 100) * 0.3) *
            10 *
            10
        ) / 10,
    };

    return { performance, success: true, error: false };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to get performance "
    );
  }
};

// Students
export const getStudents = async () => {
  try {
    const students = await prisma.student.findMany({
      orderBy: { name: "asc" },
      include: {
        parent: true,
        class: true,
        grade: true,
        attendances: true,
        results: true,
      },
    });

    return { students, success: true, error: false };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to get students"
    );
  }
};

export const getStudentById = async (id: string) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
          // include: {
          //   students: {
          //     where: {
          //       id: { not: id }, // Exclude the current student
          //     },
          //     select: {
          //       id: true,
          //       name: true,
          //     },
          //   },
          // },
        },
        class: true,
        grade: true,
        attendances: true,
        results: {
          include: {
            exam: true,
            assignment: true,
          },
        },
      },
    });

    return { student, success: true, error: false };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to get student by id"
    );
  }
};

// Parent
export const getParents = async () => {
  try {
    const parents = await prisma.parent.findMany({
      orderBy: { name: "asc" },
      include: { students: true },
    });

    return { parents, success: true, error: false };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to get parents"
    );
  }
};

export const getParentById = async (id: string) => {
  try {
    const parent = await prisma.parent.findUnique({
      where: { id },
      include: { students: true },
    });

    return { parent, success: true, error: false };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to get parent by id"
    );
  }
};

// Class
export const getClasses = async () => {
  try {
    const classItems = await prisma.class.findMany({
      orderBy: { name: "asc" },
      include: {
        teacher: true,
        students: true,
        subjects: true,
        events: true,
        announcements: true,
      },
    });

    return { classItems, success: true, error: false };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to get classes"
    );
  }
};

export const getClassById = async ({ id }: { id: number }) => {
  try {
    const classById = await prisma.class.findUnique({
      where: { id },
      include: {
        teacher: true,
        students: true,
        subjects: true,
        events: true,
        announcements: true,
      },
    });

    return { classById, success: true, error: false };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to get class by id"
    );
  }
};

// Subject
export const getSubjects = async () => {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { name: "asc" },
      include: {
        class: true,
        teachers: true,
        lessons: true,
        exams: true,
        assignments: true,
      },
    });

    return { subjects, success: true, error: false };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to get subjects"
    );
  }
};

export const getSubjectById = async ({ id }: { id: number }) => {
  try {
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        class: true,
        teachers: true,
        lessons: true,
        exams: true,
        assignments: true,
      },
    });

    return { subject, success: true, error: false };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to get subject by id"
    );
  }
};

// Lesson
export const getLessons = async () => {
  try {
    const lessons = await prisma.lesson.findMany({
      orderBy: { name: "asc" },
      include: {
        subject: true,
      },
    });

    return { lessons, success: true, error: false };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to get lessons"
    );
  }
};

// export const getLessonById = async ({ id }: { id: number }) => {
//   try {
//     const lesson = await prisma.lesson.findUnique({
//       where: { id },
//       include: {
//         subject: true,
//       },
//     });

//     return { lesson, success: true, error: false };
//   } catch (error) {
//     throw new Error(
//       error instanceof Error ? error.message : "Failed to get lesson by id"
//     );
//   }
// };

// Attendance
export const getAttendances = async () => {
  try {
    const attendances = await prisma.attendance.findMany({
      orderBy: { date: "desc" },
      include: {
        student: true,
      },
    });

    return { attendances, success: true, error: false };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to get attendances"
    );
  }
};

// Assignment
export const getAssignments = async () => {
  try {
    const assignments = await prisma.assignment.findMany({
      orderBy: { name: "asc" },
      include: {
        subject: true,
        results: true,
      },
    });

    return { assignments, success: true, error: false };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to get assignments"
    );
  }
};

// export const getAssignmentById = async ({ id }: { id: number }) => {
//   try {
//     const assignment = await prisma.assignment.findUnique({
//       where: { id },
//       include: {
//         subject: true,
//         results: true,
//       },
//     });

//     return { assignment, success: true, error: false };
//   } catch (error) {
//     throw new Error(
//       error instanceof Error ? error.message : "Failed to get assignment by id"
//     );
//   }
// };

// Exam
export const getExams = async () => {
  try {
    const exams = await prisma.exam.findMany({
      orderBy: { name: "asc" },
      include: {
        subject: true,
        results: true,
      },
    });

    return { exams, success: true, error: false };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to get exams"
    );
  }
};

export const getExamById = async ({ id }: { id: number }) => {
  try {
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        subject: true,
        results: true,
      },
    });

    return { exam, success: true, error: false };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to get exam by id"
    );
  }
};

// Result
export const getResults = async () => {
  try {
    const results = await prisma.result.findMany({
      orderBy: { score: "asc" },
      include: {
        student: true,
        exam: true,
        assignment: true,
      },
    });

    return { results, success: true, error: false };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to get results"
    );
  }
};

// export const getResultById = async ({ id }: { id: number }) => {
//   try {
//     const result = await prisma.result.findUnique({
//       where: { id },
//       include: {
//         student: true,
//         exam: true,
//         assignment: true,
//       },
//     });

//     return { result, success: true, error: false };
//   } catch (error) {
//     throw new Error(
//       error instanceof Error ? error.message : "Failed to get result"
//     );
//   }
// };

// Get results by student
export const getResultsByStudent = async (studentId: string) => {
  try {
    const results = await prisma.result.findMany({
      where: {
        studentId: studentId,
      },
      include: {
        // student: true,
        exam: true,
        assignment: true,
      },
    });

    return { results, success: true, error: false };
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to get results by student"
    );
  }
};

// Event
export const getEvents = async () => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        class: true,
      },
    });

    return { events, success: true, error: false };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to get events"
    );
  }
};

// Announcement
export const getAnnouncements = async () => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        class: true,
      },
    });

    return { announcements, success: true, error: false };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to get announcements"
    );
  }
};

// Message
export const getMessages = async () => {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
    });

    return { messages, success: true, error: false };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to get messages"
    );
  }
};

// export const getMessageById = async ({ id }: { id: number }) => {
//   try {
//     const message = await prisma.message.findUnique({
//       where: { id },
//     });

//     return { message, success: true, error: false };
//   } catch (error) {
//     throw new Error(
//       error instanceof Error ? error.message : "Failed to get message by id"
//     );
//   }
// };

// Get messages by user
export const getMessagesByUser = async (userId: string) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: "desc" },
    });

    return { messages, success: true, error: false };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to get messages by user"
    );
  }
};

//---------- POST ----------//
// Teacher
export const createTeacher = async (data: TeacherFormSchema) => {
  try {
    const existingTeacher = await prisma.teacher.findFirst({
      where: {
        name: {
          equals: data.name.trim(),
          mode: "insensitive",
        },
      },
    });
    if (existingTeacher)
      throw new Error("Teacher with this name already exists");

    if (data.phone) {
      const existingTeacherStudent = await prisma.teacher.findFirst({
        where: {
          phone: data.phone.trim(),
        },
      });
      if (existingTeacherStudent)
        throw new Error("Teacher with this phone number already exists");
    }

    let imageUrl = null;
    try {
      if (data.image) {
        if (typeof data.image === "string") {
          imageUrl = data.image;
        } else {
          const bytes = await data.image.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const base64Image = buffer.toString("base64");

          const uploadResponse = await cloudinary.uploader.upload(
            `data:${data.image.type};base64,${base64Image}`,
            {
              folder: `${CLOUDINARY_CONFIG.FOLDER.TEACHERS}`,
              resource_type: "auto",
            }
          );
          imageUrl = uploadResponse.secure_url;
        }
      }
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to create image"
      );
    }

    const teacher = await prisma.teacher.create({
      data: {
        username: data.username,
        email: data.email,
        name: data.name,
        phone: data.phone,
        address: data.address,
        birthday: data.birthday && new Date(data.birthday).toISOString(),
        gender: data.gender.toUpperCase() as "MALE" | "FEMALE",
        image: imageUrl,
        subjects: {
          connect: (data.subjects || []).map((subjectId) => ({
            id: subjectId,
          })),
        },
        classes: {
          connect: (data.classes || []).map((classId) => ({
            id: classId,
          })),
        },
      },
    });

    // const client = await clerkClient();
    // const clerkTeacher = await client.users.createUser({
    //   username: data.username || "",
    //   email: data.email || "",
    //   name: data.name,
    //   phone: data.phone || "",
    //   address: data.address || "",
    //   birthday: data.birthday ? new Date(data.birthday).toISOString() : "",
    //   gender: data.gender.toUpperCase() as "MALE" | "FEMALE",
    //   subjects: {
    //     connect: (data.subjects || []).map((subjectId) => ({
    //       id: subjectId,
    //     })),
    //   },
    //   image: data.image || "",
    // });

    revalidatePath(`${ROUTE_CONFIG.TEACHER_LIST}`);

    return {
      teacher,
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to create teacher"
    );
  }
};

// Student
export const createStudent = async (data: StudentFormSchema) => {
  try {
    const existingStudent = await prisma.student.findFirst({
      where: {
        name: {
          equals: data.name.trim(),
          mode: "insensitive",
        },
      },
    });
    if (existingStudent)
      throw new Error("Student with this name already exists");

    if (data.phone) {
      const existingPhoneStudent = await prisma.student.findFirst({
        where: {
          phone: data.phone.trim(),
        },
      });
      if (existingPhoneStudent)
        throw new Error("Student with this phone number already exists");
    }

    let imageUrl = null;
    try {
      if (data.image) {
        if (typeof data.image === "string") {
          imageUrl = data.image;
        } else {
          const bytes = await data.image.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const base64Image = buffer.toString("base64");

          const uploadResponse = await cloudinary.uploader.upload(
            `data:${data.image.type};base64,${base64Image}`,
            {
              folder: `${CLOUDINARY_CONFIG.FOLDER.STUDENTS}`,
              resource_type: "auto",
            }
          );
          imageUrl = uploadResponse.secure_url;
        }
      }
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to create image"
      );
    }

    const student = await prisma.student.create({
      data: {
        username: data.username,
        email: data.email,
        name: data.name,
        phone: data.phone,
        address: data.address,
        birthday: data.birthday && new Date(data.birthday).toISOString(),
        gender: data.gender.toUpperCase() as "MALE" | "FEMALE",
        image: imageUrl,
        class: data.classId
          ? {
              connect: { id: data.classId },
            }
          : undefined,
        parent: data.parentId
          ? {
              connect: { id: data.parentId },
            }
          : undefined,
      },
    });

    // const client = await clerkClient();
    // const teacher = await client.users.createUser({
    //   username: data.username || "",
    //   email: data.email || "",
    //   name: data.name,
    //   phone: data.phone || "",
    //   address: data.address || "",
    //   birthday: data.birthday ? new Date(data.birthday).toISOString() : "",
    //   gender: data.gender.toUpperCase() as "MALE" | "FEMALE",
    //   subjects: {
    //     connect: (data.subjects || []).map((subjectId) => ({
    //       id: subjectId,
    //     })),
    //   },
    //   image: data.image || "",
    // });

    revalidatePath(`${ROUTE_CONFIG.STUDENT_LIST}`);

    return {
      student,
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to create student"
    );
  }
};

// Parent
export const createParent = async (data: ParentFormSchema) => {
  try {
    const existingParent = await prisma.parent.findFirst({
      where: {
        name: {
          equals: data.name.trim(),
          mode: "insensitive",
        },
      },
    });
    if (existingParent) throw new Error("Parent with this name already exists");

    if (data.phone) {
      const existingPhoneParent = await prisma.parent.findFirst({
        where: {
          phone: data.phone.trim(),
        },
      });
      if (existingPhoneParent)
        throw new Error("Parent with this phone number already exists");
    }

    const parent = await prisma.parent.create({
      data: {
        username: data.username,
        email: data.email,
        name: data.name,
        phone: data.phone,
        address: data.address,
        students: {
          connect: (data.students || []).map((studentId) => ({
            id: studentId,
          })),
        },
      },
    });

    revalidatePath(`${ROUTE_CONFIG.PARENT_LIST}`);

    return {
      parent,
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to create parent"
    );
  }
};

// Class
export const createClass = async (data: ClassFormSchema) => {
  try {
    const existingClass = await prisma.class.findFirst({
      where: {
        name: {
          equals: data.name.trim(),
          mode: "insensitive",
        },
      },
    });
    if (existingClass) throw new Error("Class with this name already exists");

    const classItem = await prisma.class.create({
      data: {
        name: data.name,
        teacher: data.teacherId
          ? {
              connect: { id: data.teacherId },
            }
          : undefined,
        subjects: {
          connect: (data.subjects || []).map((subjectId) => ({
            id: subjectId,
          })),
        },
        students: {
          connect: (data.students || []).map((studentId) => ({
            id: studentId,
          })),
        },
      },
    });

    revalidatePath(`${ROUTE_CONFIG.CLASS_LIST}`);

    return {
      classItem,
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to create class"
    );
  }
};

// Subject
export const createSubject = async (data: SubjectFormSchema) => {
  try {
    const existingSubject = await prisma.subject.findFirst({
      where: {
        name: {
          equals: data.name.trim(),
          mode: "insensitive",
        },
      },
    });
    if (existingSubject)
      throw new Error("Subject with this name already exists");

    const subject = await prisma.subject.create({
      data: {
        name: data.name,
        description: data.description,
        class: data.classId
          ? {
              connect: { id: data.classId },
            }
          : undefined,
        lessons: {
          connect: (data.lessons || []).map((lessonId) => ({
            id: lessonId,
          })),
        },
        teachers: {
          connect: (data.teachers || []).map((teacherId) => ({
            id: teacherId,
          })),
        },
      },
    });

    revalidatePath(`${ROUTE_CONFIG.SUBJECT_LIST}`);

    return {
      subject,
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to create subject"
    );
  }
};

// Lesson
export const createLesson = async (data: LessonFormSchema) => {
  try {
    const existingLesson = await prisma.lesson.findFirst({
      where: {
        name: {
          equals: data.name.trim(),
          mode: "insensitive",
        },
      },
    });
    if (existingLesson) throw new Error("Lesson with this name already exists");

    const lesson = await prisma.lesson.create({
      data: {
        name: data.name,
        subject: data.subjectId
          ? {
              connect: { id: data.subjectId },
            }
          : undefined,
      },
    });

    revalidatePath(`${ROUTE_CONFIG.LESSON_LIST}`);

    return {
      lesson,
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to create lesson"
    );
  }
};

// Attendance
export const createAttendance = async (data: AttendanceFormSchema) => {
  try {
    const attendance = await prisma.attendance.create({
      data: {
        present: data.present,
        date: data.date && new Date(data.date).toISOString(),
        student: data.studentId
          ? { connect: { id: data.studentId } }
          : undefined,
      },
    });

    revalidatePath(`${ROUTE_CONFIG.ATTENDANCE_LIST}`);

    return {
      attendance,
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to create attendance"
    );
  }
};

// Assignment
export const createAssignment = async (data: AssignmentFormSchema) => {
  try {
    const existingAssign = await prisma.assignment.findFirst({
      where: {
        name: {
          equals: data.name.trim(),
          mode: "insensitive",
        },
      },
    });
    if (existingAssign)
      throw new Error("Assignment with this name already exists");

    const assignment = await prisma.assignment.create({
      data: {
        name: data.name,
        dueDate: data.dueDate && new Date(data.dueDate),
        subjectId: data.subjectId,
      },
    });

    revalidatePath(`${ROUTE_CONFIG.ASSIGNMENT_LIST}`);

    return {
      assignment,
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to create assignment"
    );
  }
};

// Exam
export const createExam = async (data: ExamFormSchema) => {
  try {
    const existingExam = await prisma.exam.findFirst({
      where: {
        name: {
          equals: data.name.trim(),
          mode: "insensitive",
        },
      },
    });
    if (existingExam) throw new Error("Exam with this name already exists");

    const exam = await prisma.exam.create({
      data: {
        name: data.name,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        subject: data.subjectId
          ? {
              connect: { id: data.subjectId },
            }
          : undefined,
      },
    });

    revalidatePath(`${ROUTE_CONFIG.EXAM_LIST}`);

    return {
      exam,
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to create exam"
    );
  }
};

// Result
export const createResult = async (data: ResultFormSchema) => {
  try {
    // Check if a result already exists for the same student and exam/assignment
    const existingResult = await prisma.result.findFirst({
      where: {
        studentId: data.studentId,
        ...(data.examId && { examId: data.examId }),
        ...(data.assignmentId && { assignmentId: data.assignmentId }),
      },
    });

    let result;

    if (existingResult) {
      // Update existing result
      result = await prisma.result.update({
        where: {
          id: existingResult.id,
        },
        data: {
          score: data.score,
          comment: data.comment,
        },
      });
    } else {
      // Create new result
      result = await prisma.result.create({
        data: {
          score: data.score,
          comment: data.comment,
          examId: data.examId,
          assignmentId: data.assignmentId,
          studentId: data.studentId,
        },
      });
    }

    revalidatePath(`${ROUTE_CONFIG.RESULT_LIST}`);

    return {
      result,
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to create result"
    );
  }
};

// Event
export const createEvent = async (data: EventFormSchema) => {
  try {
    const existingEvent = await prisma.event.findFirst({
      where: {
        name: {
          equals: data.name.trim(),
          mode: "insensitive",
        },
      },
    });
    if (existingEvent) throw new Error("Event with this name already exists");

    const event = await prisma.event.create({
      data: {
        name: data.name,
        description: data.description || null,
        startTime: data.startTime ? new Date(data.startTime) : null,
        endTime: data.endTime ? new Date(data.endTime) : null,
        class: data.classId
          ? {
              connect: { id: data.classId },
            }
          : undefined,
      },
    });

    revalidatePath(`${ROUTE_CONFIG.EVENT_LIST}`);

    return {
      event,
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to create event"
    );
  }
};

// Announcement
export const createAnnouncement = async (data: AnnouncementFormSchema) => {
  try {
    const existingAnnounce = await prisma.announcement.findFirst({
      where: {
        name: {
          equals: data.name.trim(),
          mode: "insensitive",
        },
      },
    });
    if (existingAnnounce)
      throw new Error("Announcement with this name already exists");

    const announcement = await prisma.announcement.create({
      data: {
        name: data.name,
        description: data.description || null,
        date: data.date ? new Date(data.date) : null,
        class: data.classId
          ? {
              connect: { id: data.classId },
            }
          : undefined,
      },
    });

    revalidatePath(`${ROUTE_CONFIG.ANNOUNCEMENT_LIST}`);

    return {
      announcement,
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to create announcement"
    );
  }
};

// Message
// export const createMessage = async (data: MessageFormSchema) => {
//   try {
//     const message = await prisma.message.create({
//       data: {
//         name: data.name,
//         content: data.content,
//         senderId: data.senderId,
//         receiverId: data.receiverId,
//         read: data.read || false,
//       },
//     });

// revalidatePath(`${ROUTE_CONFIG.MESSAGE_LIST}`);

//     return {
//       message,
//       success: true,
//       error: false,
//     };
//   } catch (error) {
//     throw new Error(
//       error instanceof Error ? error.message : "Failed to create message"
//     );
//   }
// };

//---------- PUT ----------//
// Teacher
export const updateTeacher = async (data: TeacherFormSchema) => {
  try {
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id: data.id },
    });
    if (!existingTeacher) throw new Error("Teacher is not found");

    if (existingTeacher.name.toLowerCase() !== data.name.toLowerCase()) {
      const duplicateTeacher = await prisma.teacher.findFirst({
        where: {
          name: {
            equals: data.name.trim(),
            mode: "insensitive",
          },
          NOT: { id: data.id },
        },
      });
      if (duplicateTeacher)
        throw new Error("Teacher with this name already exists");
    }

    // Check for duplicate phone number if provided
    if (data.phone && existingTeacher.phone !== data.phone.trim()) {
      const existingPhoneStudent = await prisma.teacher.findFirst({
        where: {
          phone: data.phone.trim(),
          NOT: { id: data.id },
        },
      });
      if (existingPhoneStudent)
        throw new Error("Teacher with this phone number already exists");
    }

    let imageUrl = existingTeacher.image;

    // Handle photo removal
    if (data.removePhoto) {
      try {
        if (existingTeacher.image) {
          const publicId = existingTeacher.image
            .split("/")
            .pop()
            ?.split(".")
            .shift();
          if (publicId) {
            await cloudinary.uploader.destroy(
              `${CLOUDINARY_CONFIG.FOLDER.TEACHERS}/${publicId}`
            );
          }
        }
        imageUrl = null;
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : "Failed to remove image"
        );
      }
    }
    // Handle photo upload/update
    else if (data.image) {
      try {
        if (existingTeacher.image) {
          const publicId = existingTeacher.image
            .split("/")
            .pop()
            ?.split(".")
            .shift();
          if (publicId) {
            await cloudinary.uploader.destroy(
              `${CLOUDINARY_CONFIG.FOLDER.TEACHERS}/${publicId}`
            );
          }
        }

        if (data.image instanceof File) {
          const bytes = await data.image.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const base64Image = buffer.toString("base64");

          const uploadResponse = await cloudinary.uploader.upload(
            `data:${data.image.type};base64,${base64Image}`,
            {
              folder: `${CLOUDINARY_CONFIG.FOLDER.TEACHERS}`,
              resource_type: "auto",
            }
          );
          imageUrl = uploadResponse.secure_url;
        } else {
          imageUrl = data.image;
        }
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : "Failed to update image"
        );
      }
    }

    const teacher = await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: {
        username: data.username,
        email: data.email,
        name: data.name,
        phone: data.phone,
        address: data.address,
        birthday: data.birthday && new Date(data.birthday).toISOString(),
        gender: data.gender.toUpperCase() as "MALE" | "FEMALE",
        image: imageUrl,
        subjects: {
          set: (data.subjects || []).map((subjectId) => ({
            id: subjectId,
          })),
        },
        classes: {
          set: (data.classes || []).map((classId) => ({
            id: classId,
          })),
        },
      },
    });

    revalidatePath(`${ROUTE_CONFIG.TEACHER_LIST}`);

    return {
      teacher,
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to update teacher"
    );
  }
};

// Student
export const updateStudent = async (data: StudentFormSchema) => {
  try {
    const existingStudent = await prisma.student.findUnique({
      where: { id: data.id },
    });
    if (!existingStudent) throw new Error("Student is not found");

    if (existingStudent.name.toLowerCase() !== data.name.toLowerCase()) {
      const duplicateStudent = await prisma.student.findFirst({
        where: {
          name: {
            equals: data.name.trim(),
            mode: "insensitive",
          },
          NOT: { id: data.id },
        },
      });
      if (duplicateStudent)
        throw new Error("Student with this name already exists");
    }

    if (data.phone && existingStudent.phone !== data.phone.trim()) {
      const existingPhoneStudent = await prisma.student.findFirst({
        where: {
          phone: data.phone.trim(),
          NOT: { id: data.id },
        },
      });
      if (existingPhoneStudent)
        throw new Error("Student with this phone number already exists");
    }

    let imageUrl = existingStudent.image;

    // Handle photo removal
    if (data.removePhoto) {
      try {
        if (existingStudent.image) {
          const publicId = existingStudent.image
            .split("/")
            .pop()
            ?.split(".")
            .shift();
          if (publicId) {
            await cloudinary.uploader.destroy(
              `${CLOUDINARY_CONFIG.FOLDER.STUDENTS}/${publicId}`
            );
          }
        }
        imageUrl = null;
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : "Failed to remove image"
        );
      }
    } else if (data.image) {
      try {
        if (existingStudent.image) {
          const publicId = existingStudent.image
            .split("/")
            .pop()
            ?.split(".")
            .shift();
          if (publicId) {
            await cloudinary.uploader.destroy(
              `${CLOUDINARY_CONFIG.FOLDER.STUDENTS}/${publicId}`
            );
          }
        }

        if (data.image instanceof File) {
          const bytes = await data.image.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const base64Image = buffer.toString("base64");

          const uploadResponse = await cloudinary.uploader.upload(
            `data:${data.image.type};base64,${base64Image}`,
            {
              folder: `${CLOUDINARY_CONFIG.FOLDER.STUDENTS}`,
              resource_type: "auto",
            }
          );
          imageUrl = uploadResponse.secure_url;
        } else {
          imageUrl = data.image;
        }
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : "Failed to update image"
        );
      }
    }

    const student = await prisma.student.update({
      where: {
        id: data.id,
      },
      data: {
        username: data.username,
        email: data.email,
        name: data.name,
        phone: data.phone,
        address: data.address,
        birthday: data.birthday
          ? new Date(data.birthday).toISOString()
          : undefined,
        gender: data.gender.toUpperCase() as "MALE" | "FEMALE",
        image: imageUrl,
        class: data.classId
          ? {
              connect: { id: data.classId },
            }
          : undefined,
        parent: data.parentId
          ? {
              connect: { id: data.parentId },
            }
          : undefined,
      },
    });

    revalidatePath(`${ROUTE_CONFIG.STUDENT_LIST}`);

    return {
      student,
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to update student"
    );
  }
};

// Parent
export const updateParent = async (data: ParentFormSchema) => {
  try {
    const existingParent = await prisma.parent.findUnique({
      where: { id: data.id },
    });
    if (!existingParent) throw new Error("Parent is not found");

    if (existingParent.name.toLowerCase() !== data.name.toLowerCase()) {
      const duplicateParent = await prisma.parent.findFirst({
        where: {
          name: {
            equals: data.name.trim(),
            mode: "insensitive",
          },
          NOT: { id: data.id },
        },
      });
      if (duplicateParent)
        throw new Error("Parent with this name already exists");
    }

    const parent = await prisma.parent.update({
      where: {
        id: data.id,
      },
      data: {
        username: data.username,
        email: data.email,
        name: data.name,
        phone: data.phone,
        address: data.address,
        students: {
          set: (data.students || []).map((studentId) => ({
            id: studentId,
          })),
        },
      },
    });

    revalidatePath(`${ROUTE_CONFIG.PARENT_LIST}`);

    return {
      parent,
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to update parent"
    );
  }
};

// Class
export const updateClass = async (data: ClassFormSchema) => {
  try {
    const existingClass = await prisma.class.findUnique({
      where: { id: data.id },
    });
    if (!existingClass) throw new Error("Class is not found");

    if (existingClass.name.toLowerCase() !== data.name.toLowerCase()) {
      const duplicateClass = await prisma.class.findFirst({
        where: {
          name: {
            equals: data.name.trim(),
            mode: "insensitive",
          },
          NOT: { id: data.id },
        },
      });
      if (duplicateClass)
        throw new Error("Class with this name already exists");
    }

    const classItem = await prisma.class.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        teacher: data.teacherId
          ? {
              connect: { id: data.teacherId },
            }
          : undefined,
        subjects: {
          set: (data.subjects || []).map((subjectId) => ({
            id: subjectId,
          })),
        },
        students: {
          set: (data.students || []).map((studentId) => ({
            id: studentId,
          })),
        },
      },
    });

    revalidatePath(`${ROUTE_CONFIG.CLASS_LIST}`);

    return {
      classItem,
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to update class"
    );
  }
};

// Subject
export const updateSubject = async (data: SubjectFormSchema) => {
  try {
    const existingSubject = await prisma.subject.findUnique({
      where: { id: data.id },
    });
    if (!existingSubject) throw new Error("Subject is not found");

    if (existingSubject.name.toLowerCase() !== data.name.toLowerCase()) {
      const duplicateSubject = await prisma.subject.findFirst({
        where: {
          name: {
            equals: data.name.trim(),
            mode: "insensitive",
          },
          NOT: { id: data.id },
        },
      });
      if (duplicateSubject)
        throw new Error("Subject with this name already exists");
    }

    const subject = await prisma.subject.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        description: data.description,
        class: data.classId
          ? {
              connect: { id: data.classId },
            }
          : undefined,
        lessons: {
          set: (data.lessons || []).map((lessonId) => ({
            id: lessonId,
          })),
        },
        teachers: {
          set: (data.teachers || []).map((teacherId) => ({
            id: teacherId,
          })),
        },
      },
    });

    revalidatePath(`${ROUTE_CONFIG.SUBJECT_LIST}`);

    return {
      subject,
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to update subject"
    );
  }
};

// Lesson
export const updateLesson = async (data: LessonFormSchema) => {
  try {
    const existingLesson = await prisma.lesson.findUnique({
      where: { id: data.id },
    });
    if (!existingLesson) throw new Error("Lesson is not found");

    if (existingLesson.name.toLowerCase() !== data.name.toLowerCase()) {
      const duplicateLesson = await prisma.lesson.findFirst({
        where: {
          name: {
            equals: data.name.trim(),
            mode: "insensitive",
          },
          NOT: { id: data.id },
        },
      });
      if (duplicateLesson)
        throw new Error("Lesson with this name already exists");
    }

    const lesson = await prisma.lesson.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        subject: data.subjectId
          ? {
              connect: { id: data.subjectId },
            }
          : undefined,
      },
    });

    revalidatePath(`${ROUTE_CONFIG.LESSON_LIST}`);

    return {
      lesson,
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to update lesson"
    );
  }
};

// Attendence
export const updateAttendance = async (data: AttendanceFormSchema) => {
  try {
    const existingAttendance = await prisma.attendance.findUnique({
      where: { id: data.id },
    });
    if (!existingAttendance) throw new Error("Attendance is not found");

    const attendance = await prisma.attendance.update({
      where: {
        id: data.id,
      },
      data: {
        present: data.present,
        date: new Date(data.date),
        student: data.studentId
          ? { connect: { id: data.studentId } }
          : undefined,
      },
    });

    revalidatePath(`${ROUTE_CONFIG.ATTENDANCE_LIST}`);

    return {
      attendance,
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to update attendance"
    );
  }
};

// Assignment
export const updateAssignment = async (data: AssignmentFormSchema) => {
  try {
    const existingAssignment = await prisma.assignment.findUnique({
      where: { id: data.id },
    });
    if (!existingAssignment) throw new Error("Assignment is not found");

    const assignment = await prisma.assignment.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        dueDate: data.dueDate && new Date(data.dueDate),
        subjectId: data.subjectId,
      },
    });

    revalidatePath(`${ROUTE_CONFIG.ASSIGNMENT_LIST}`);

    return {
      assignment,
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to update assignment"
    );
  }
};

// Exam
export const updateExam = async (data: ExamFormSchema) => {
  try {
    const existingExam = await prisma.exam.findUnique({
      where: { id: data.id },
    });
    if (!existingExam) throw new Error("Exam is not found");

    const exam = await prisma.exam.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        description: data.description,
        // ...(data.startTime && { startTime: new Date(data.startTime) }),
        // ...(data.endTime && { endTime: new Date(data.endTime) }),
        startTime: data.startTime && new Date(data.startTime),
        endTime: data.endTime && new Date(data.endTime),
        subject: data.subjectId
          ? {
              connect: { id: data.subjectId },
            }
          : undefined,
      },
    });

    revalidatePath(`${ROUTE_CONFIG.EXAM_LIST}`);

    return {
      exam,
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to update exam"
    );
  }
};

// Result
export const updateResult = async (data: ResultFormSchema) => {
  try {
    const existingResult = await prisma.result.findUnique({
      where: { id: data.id },
    });
    if (!existingResult) throw new Error("Result is not found");

    const result = await prisma.result.update({
      where: {
        id: data.id,
      },
      data: {
        score: data.score,
        comment: data.comment,
        student: data.studentId
          ? { connect: { id: data.studentId } }
          : undefined,
        exam: data.examId ? { connect: { id: data.examId } } : undefined,
        assignment: data.assignmentId
          ? { connect: { id: data.assignmentId } }
          : undefined,
      },
    });

    revalidatePath(`${ROUTE_CONFIG.RESULT_LIST}`);

    return {
      result,
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to update result"
    );
  }
};

// Event
export const updateEvent = async (data: EventFormSchema) => {
  try {
    const existingEvent = await prisma.event.findUnique({
      where: { id: data.id },
    });
    if (!existingEvent) throw new Error("Event is not found");

    if (existingEvent.name.toLowerCase() !== data.name.toLowerCase()) {
      const duplicateEvent = await prisma.event.findFirst({
        where: {
          name: {
            equals: data.name.trim(),
            mode: "insensitive",
          },
          NOT: { id: data.id },
        },
      });
      if (duplicateEvent)
        throw new Error("Event with this name already exists");
    }

    const event = await prisma.event.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        description: data.description,
        startTime: data.startTime && new Date(data.startTime),
        endTime: data.endTime && new Date(data.endTime),
        class: data.classId
          ? {
              connect: { id: data.classId },
            }
          : undefined,
      },
    });

    revalidatePath(`${ROUTE_CONFIG.EVENT_LIST}`);

    return {
      event,
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to update event"
    );
  }
};

// Announcement
export const updateAnnouncement = async (data: AnnouncementFormSchema) => {
  try {
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id: data.id },
    });
    if (!existingAnnouncement) throw new Error("Announcement is not found");

    if (existingAnnouncement.name.toLowerCase() !== data.name.toLowerCase()) {
      const duplicateAnnouncement = await prisma.announcement.findFirst({
        where: {
          name: {
            equals: data.name.trim(),
            mode: "insensitive",
          },
          NOT: { id: data.id },
        },
      });
      if (duplicateAnnouncement)
        throw new Error("Announcement with this name already exists");
    }

    const announcement = await prisma.announcement.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        description: data.description,
        date: data.date && new Date(data.date),
        class: data.classId
          ? {
              connect: { id: data.classId },
            }
          : undefined,
      },
    });

    revalidatePath(`${ROUTE_CONFIG.ANNOUNCEMENT_LIST}`);

    return {
      announcement,
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to update announcement"
    );
  }
};

//---------- DELETE ----------//
// Teacher
export const deleteTeacher = async ({ id }: { id: string }) => {
  try {
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id },
    });
    if (!existingTeacher) throw new Error("Teacher is not found");

    if (existingTeacher.image) {
      try {
        const publicId = existingTeacher.image.split("/").pop()?.split(".")[0];
        if (publicId) {
          await cloudinary.uploader.destroy(
            `${CLOUDINARY_CONFIG.FOLDER.TEACHERS}/${publicId}`
          );
        }
      } catch (cloudinaryError) {
        throw cloudinaryError;
      }
    }

    await prisma.teacher.delete({
      where: { id },
    });

    revalidatePath(`${ROUTE_CONFIG.TEACHER_LIST}`);

    return {
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete teacher"
    );
  }
};

// Student
export const deleteStudent = async ({ id }: { id: string }) => {
  try {
    const existingStudent = await prisma.student.findUnique({
      where: { id },
    });
    if (!existingStudent) throw new Error("Student is not found");

    if (existingStudent.image) {
      try {
        const publicId = existingStudent.image.split("/").pop()?.split(".")[0];
        if (publicId) {
          await cloudinary.uploader.destroy(
            `${CLOUDINARY_CONFIG.FOLDER.STUDENTS}/${publicId}`
          );
        }
      } catch (cloudinaryError) {
        throw cloudinaryError;
      }
    }

    await prisma.student.delete({
      where: { id },
    });

    revalidatePath(`${ROUTE_CONFIG.STUDENT_LIST}`);

    return {
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete student"
    );
  }
};

// Class
export const deleteClass = async ({ id }: { id: number }) => {
  try {
    const existingClass = await prisma.class.findUnique({
      where: { id },
    });
    if (!existingClass) throw new Error("Class is not found");

    await prisma.class.delete({
      where: { id },
    });

    revalidatePath(`${ROUTE_CONFIG.CLASS_LIST}`);

    return {
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete class"
    );
  }
};

// Subject
export const deleteSubject = async ({ id }: { id: number }) => {
  try {
    const existingSubject = await prisma.subject.findUnique({
      where: { id },
    });
    if (!existingSubject) throw new Error("Subject is not found");

    await prisma.subject.delete({
      where: { id },
    });

    revalidatePath(`${ROUTE_CONFIG.SUBJECT_LIST}`);

    return {
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete subject"
    );
  }
};

// Parent
export const deleteParent = async ({ id }: { id: string }) => {
  try {
    const existingParent = await prisma.parent.findUnique({
      where: { id },
    });
    if (!existingParent) throw new Error("Parent is not found");

    await prisma.parent.delete({
      where: { id },
    });

    revalidatePath(`${ROUTE_CONFIG.PARENT_LIST}`);

    return {
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete parent"
    );
  }
};

export const deleteLesson = async ({ id }: { id: number }) => {
  try {
    const existingLesson = await prisma.lesson.findUnique({
      where: { id },
    });
    if (!existingLesson) throw new Error("Lesson is not found");

    await prisma.lesson.delete({
      where: { id },
    });

    revalidatePath(`${ROUTE_CONFIG.LESSON_LIST}`);

    return {
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete lesson"
    );
  }
};

export const deleteExam = async ({ id }: { id: number }) => {
  try {
    const existingExam = await prisma.exam.findUnique({
      where: { id },
    });
    if (!existingExam) throw new Error("Exam is not found");

    await prisma.exam.delete({
      where: { id },
    });

    revalidatePath(`${ROUTE_CONFIG.EXAM_LIST}`);

    return {
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete exam"
    );
  }
};

export const deleteAssignment = async ({ id }: { id: number }) => {
  try {
    const existingAssignment = await prisma.assignment.findUnique({
      where: { id },
    });
    if (!existingAssignment) throw new Error("Assignment is not found");

    await prisma.assignment.delete({
      where: { id },
    });

    revalidatePath(`${ROUTE_CONFIG.ASSIGNMENT_LIST}`);

    return {
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete assignment"
    );
  }
};

export const deleteResult = async ({ id }: { id: number }) => {
  try {
    const existingResult = await prisma.result.findUnique({
      where: { id },
    });
    if (!existingResult) throw new Error("Result is not found");

    await prisma.result.delete({
      where: { id },
    });

    revalidatePath(`${ROUTE_CONFIG.RESULT_LIST}`);

    return {
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete result"
    );
  }
};

export const deleteAttendance = async ({ id }: { id: number }) => {
  try {
    const existingAttendance = await prisma.attendance.findUnique({
      where: { id },
    });
    if (!existingAttendance) throw new Error("Attendance is not found");

    await prisma.attendance.delete({
      where: { id },
    });

    revalidatePath(`${ROUTE_CONFIG.ATTENDANCE_LIST}`);

    return {
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete attendance"
    );
  }
};

export const deleteEvent = async ({ id }: { id: number }) => {
  try {
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });
    if (!existingEvent) throw new Error("Event is not found");

    await prisma.event.delete({
      where: { id },
    });

    revalidatePath(`${ROUTE_CONFIG.EVENT_LIST}`);

    return {
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete event"
    );
  }
};

export const deleteAnnouncement = async ({ id }: { id: number }) => {
  try {
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id },
    });
    if (!existingAnnouncement) throw new Error("Announcement is not found");

    await prisma.announcement.delete({
      where: { id },
    });

    revalidatePath(`${ROUTE_CONFIG.ANNOUNCEMENT_LIST}`);

    return {
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete announcement"
    );
  }
};

export const updateMessage = async (data: MessageFormSchema) => {
  try {
    const existingMessage = await prisma.message.findUnique({
      where: { id: data.id },
    });
    if (!existingMessage) throw new Error("Message is not found");

    const message = await prisma.message.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        content: data.content,
        read: data.read || false,
      },
    });

    revalidatePath(`${ROUTE_CONFIG.MESSAGE_LIST}`);

    return {
      message,
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to update message"
    );
  }
};

export const markMessageAsRead = async ({ id }: { id: number }) => {
  try {
    const existingMessage = await prisma.message.findUnique({
      where: { id },
    });
    if (!existingMessage) throw new Error("Message is not found");

    const message = await prisma.message.update({
      where: { id },
      data: {
        read: true,
      },
    });

    revalidatePath(`${ROUTE_CONFIG.MESSAGE_LIST}`);

    return {
      message,
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to mark message as read"
    );
  }
};

export const deleteMessage = async ({ id }: { id: number }) => {
  try {
    const existingMessage = await prisma.message.findUnique({
      where: { id },
    });
    if (!existingMessage) throw new Error("Message is not found");

    await prisma.message.delete({
      where: { id },
    });

    revalidatePath(`${ROUTE_CONFIG.MESSAGE_LIST}`);

    return {
      success: true,
      error: false,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete message"
    );
  }
};

// Additional helper functions
// Get teachers by subject
export const getTeachersBySubject = async (subjectId: number) => {
  try {
    if (!subjectId) throw new Error("Subject id is required");
    const teachers = await prisma.teacher.findMany({
      where: {
        subjects: {
          some: {
            id: subjectId,
          },
        },
      },
      include: {
        subjects: true,
        classes: true,
      },
    });

    return { teachers, success: true, error: false };
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to get teachers by subject"
    );
  }
};

// Get students by class
export const getStudentsByClass = async (classId: number) => {
  try {
    if (!classId) throw new Error("Class id is required");
    const students = await prisma.student.findMany({
      where: {
        classId: classId,
      },
      include: {
        class: true,
        attendances: true,
        results: true,
      },
    });

    return { students, success: true, error: false };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to get students by class"
    );
  }
};

// Get events by date range
export const getEventsByDateRange = async (startDate: Date, endDate: Date) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        class: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return { events, success: true, error: false };
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to get events by date range"
    );
  }
};

// Get attendance by student and date range
export const getAttendanceByStudentAndDateRange = async (
  studentId: string,
  startDate: Date,
  endDate: Date
) => {
  try {
    const attendances = await prisma.attendance.findMany({
      where: {
        studentId: studentId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        student: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    return { attendances, success: true, error: false };
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to get attendance by student and date range"
    );
  }
};

// Get upcoming exams
export const getUpcomingExams = async () => {
  try {
    const currentDate = new Date();
    const exams = await prisma.exam.findMany({
      where: {
        startTime: {
          gte: currentDate,
        },
      },
      include: {
        subject: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return { exams, success: true, error: false };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to get upcoming exams"
    );
  }
};

// Get assignments due soon
export const getAssignmentsDueSoon = async (daysAhead: number = 7) => {
  try {
    const currentDate = new Date();
    const futureDate = new Date();
    futureDate.setDate(currentDate.getDate() + daysAhead);

    const assignments = await prisma.assignment.findMany({
      where: {
        dueDate: {
          gte: currentDate,
          lte: futureDate,
        },
      },
      include: {
        subject: true,
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    return { assignments, success: true, error: false };
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to get assignments due soon"
    );
  }
};
