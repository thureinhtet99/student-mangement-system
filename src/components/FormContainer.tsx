import { FormContainerType } from "@/types";
import FormModal from "./FormModal";
import { prisma } from "@/lib/prisma";

const FormContainer = async ({ table, type, data, id }: FormContainerType) => {
  let relatedData: Record<string, any> = {};

  if (type !== "delete") {
    try {
      switch (table) {
        case "subject":
          const lessonsForSubject = await prisma.lesson.findMany({
            orderBy: { name: "asc" },
            select: {
              id: true,
              name: true,
            },
          });
          const classesForSubject = await prisma.class.findMany({
            orderBy: { name: "asc" },
            select: {
              id: true,
              name: true,
            },
          });
          const teachersForSubject = await prisma.teacher.findMany({
            orderBy: { name: "asc" },
            select: {
              id: true,
              name: true,
            },
          });
          relatedData = {
            lessons: lessonsForSubject,
            classes: classesForSubject,
            teachers: teachersForSubject,
          };
          break;
        case "class":
          const teachersForClass = await prisma.teacher.findMany({
            orderBy: { name: "asc" },
            select: {
              id: true,
              name: true,
            },
          });
          const subjectsForClass = await prisma.subject.findMany({
            orderBy: { name: "asc" },
            select: {
              id: true,
              name: true,
            },
          });
          const studentsForClass = await prisma.student.findMany({
            orderBy: { name: "asc" },
            select: {
              id: true,
              name: true,
            },
          });
          relatedData = {
            teachers: teachersForClass,
            subjects: subjectsForClass,
            students: studentsForClass,
          };
          break;
        case "student":
          const classesForStudent = await prisma.class.findMany({
            orderBy: { name: "asc" },
            select: {
              id: true,
              name: true,
            },
          });
          const parentsForStudent = await prisma.parent.findMany({
            orderBy: { name: "asc" },
            select: {
              id: true,
              name: true,
            },
          });
          relatedData = {
            classes: classesForStudent,
            parents: parentsForStudent,
          };
          break;
        case "teacher":
          const classItems = await prisma.class.findMany({
            orderBy: { name: "asc" },
            select: {
              id: true,
              name: true,
            },
          });
          relatedData = { classes: classItems };
          break;
        case "parent":
        case "attendance":
          const studentsForParent = await prisma.student.findMany({
            orderBy: { name: "asc" },
            select: {
              id: true,
              name: true,
            },
          });
          relatedData = { students: studentsForParent };
          break;
        case "teacher":
        case "lesson":
        case "exam":
        case "assignment":
          const subjects = await prisma.subject.findMany({
            orderBy: { name: "asc" },
            select: {
              id: true,
              name: true,
            },
          });
          relatedData = { subjects };
          break;
        case "event":
        case "announcement":
          const classesForEvent = await prisma.class.findMany({
            orderBy: { name: "asc" },
            select: {
              id: true,
              name: true,
            },
          });
          relatedData = {
            classes: classesForEvent,
          };
          break;
        case "result":
          const studentsForResult = await prisma.student.findMany({
            orderBy: { name: "asc" },
            select: {
              id: true,
              name: true,
            },
          });
          const examsForResult = await prisma.exam.findMany({
            orderBy: { name: "asc" },
            select: {
              id: true,
              name: true,
            },
          });
          const assignmentsForResult = await prisma.assignment.findMany({
            orderBy: { name: "asc" },
            select: {
              id: true,
              name: true,
            },
          });
          relatedData = {
            students: studentsForResult,
            exams: examsForResult,
            assignments: assignmentsForResult,
          };
          break;
        // Add other cases for different tables here

        default:
          // No related data needed for this table
          break;
      }
    } catch (error) {
      relatedData = {};
    }
  }

  return (
    <FormModal
      table={table}
      type={type}
      data={data}
      id={id}
      relatedData={relatedData}
    />
  );
};

export default FormContainer;
