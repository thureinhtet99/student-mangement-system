"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { LoaderCircle, Pencil, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  deleteAnnouncement,
  deleteAssignment,
  deleteAttendance,
  deleteClass,
  deleteEvent,
  deleteExam,
  deleteLesson,
  deleteParent,
  deleteResult,
  deleteStudent,
  deleteSubject,
  deleteTeacher,
} from "@/lib/actions";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { FormContainerType } from "@/types";

const deleteActionMap = {
  teacher: deleteTeacher,
  student: deleteStudent,
  parent: deleteParent,
  subject: deleteSubject,
  class: deleteClass,
  lesson: deleteLesson,
  exam: deleteExam,
  assignment: deleteAssignment,
  announcement: deleteAnnouncement,
  attendance: deleteAttendance,
  result: deleteResult,
  event: deleteEvent,
};

// Lazy loading
const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
  loading: () => (
    <div className="flex justify-center items-center p-4">
      <LoaderCircle className="animate-spin" />
    </div>
  ),
});
const StudentForm = dynamic(() => import("./forms/StudentForm"), {
  loading: () => (
    <div className="flex justify-center items-center p-4">
      <LoaderCircle className="animate-spin" />
    </div>
  ),
});
const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"), {
  loading: () => (
    <div className="flex justify-center items-center p-4">
      <LoaderCircle className="animate-spin" />
    </div>
  ),
});
const ParentForm = dynamic(() => import("./forms/ParentForm"), {
  loading: () => (
    <div className="flex justify-center items-center p-4">
      <LoaderCircle className="animate-spin" />
    </div>
  ),
});
const ClassForm = dynamic(() => import("./forms/ClassForm"), {
  loading: () => (
    <div className="flex justify-center items-center p-4">
      <LoaderCircle className="animate-spin" />
    </div>
  ),
});
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), {
  loading: () => (
    <div className="flex justify-center items-center p-4">
      <LoaderCircle className="animate-spin" />
    </div>
  ),
});
const LessonForm = dynamic(() => import("./forms/LessonForm"), {
  loading: () => (
    <div className="flex justify-center items-center p-4">
      <LoaderCircle className="animate-spin" />
    </div>
  ),
});
const ExamForm = dynamic(() => import("./forms/ExamForm"), {
  loading: () => (
    <div className="flex justify-center items-center p-4">
      <LoaderCircle className="animate-spin" />
    </div>
  ),
});
const AssignmentForm = dynamic(() => import("./forms/AssignmentForm"), {
  loading: () => (
    <div className="flex justify-center items-center p-4">
      <LoaderCircle className="animate-spin" />
    </div>
  ),
});
const ResultForm = dynamic(() => import("./forms/ResultForm"), {
  loading: () => (
    <div className="flex justify-center items-center p-4">
      <LoaderCircle className="animate-spin" />
    </div>
  ),
});
const AttendanceForm = dynamic(() => import("./forms/AttendanceForm"), {
  loading: () => (
    <div className="flex justify-center items-center p-4">
      <LoaderCircle className="animate-spin" />
    </div>
  ),
});
const EventForm = dynamic(() => import("./forms/EventForm"), {
  loading: () => (
    <div className="flex justify-center items-center p-4">
      <LoaderCircle className="animate-spin" />
    </div>
  ),
});

// Forms
const forms: {
  [table: string]: (
    type: "create" | "update",
    data?: any,
    onClose?: () => void,
    relatedData?: any,
  ) => JSX.Element;
} = {
  teacher: (type, data, onClose, relatedData) => (
    <TeacherForm
      type={type}
      data={data}
      onClose={onClose}
      relatedData={relatedData}
    />
  ),
  student: (type, data, onClose, relatedData) => (
    <StudentForm
      type={type}
      data={data}
      onClose={onClose}
      relatedData={relatedData}
    />
  ),
  parent: (type, data, onClose, relatedData) => (
    <ParentForm
      type={type}
      data={data}
      onClose={onClose}
      relatedData={relatedData}
    />
  ),
  subject: (type, data, onClose, relatedData) => (
    <SubjectForm
      type={type}
      data={data}
      onClose={onClose}
      relatedData={relatedData}
    />
  ),
  announcement: (type, data, onClose, relatedData) => (
    <AnnouncementForm
      type={type}
      data={data}
      onClose={onClose}
      relatedData={relatedData}
    />
  ),
  assignment: (type, data, onClose, relatedData) => (
    <AssignmentForm
      type={type}
      data={data}
      onClose={onClose}
      relatedData={relatedData}
    />
  ),
  attendance: (type, data, onClose, relatedData) => (
    <AttendanceForm
      type={type}
      data={data}
      onClose={onClose}
      relatedData={relatedData}
    />
  ),
  class: (type, data, onClose, relatedData) => (
    <ClassForm
      type={type}
      data={data}
      onClose={onClose}
      relatedData={relatedData}
    />
  ),
  event: (type, data, onClose, relatedData) => (
    <EventForm
      type={type}
      data={data}
      onClose={onClose}
      relatedData={relatedData}
    />
  ),
  exam: (type, data, onClose, relatedData) => (
    <ExamForm
      type={type}
      data={data}
      onClose={onClose}
      relatedData={relatedData}
    />
  ),
  lesson: (type, data, onClose, relatedData) => (
    <LessonForm
      type={type}
      data={data}
      onClose={onClose}
      relatedData={relatedData}
    />
  ),
  result: (type, data, onClose, relatedData) => (
    <ResultForm
      type={type}
      data={data}
      onClose={onClose}
      relatedData={relatedData}
    />
  ),
};

const FormContent = ({
  table,
  type,
  data,
  id,
  onClose,
  relatedData,
}: {
  table: string;
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
  onClose?: () => void;
  relatedData?: any;
}) => {
  // Mutation
  const { isPending, mutate } = useMutation({
    mutationFn: (variables: { id: number | string }) => {
      const deleteAction =
        deleteActionMap[table as keyof typeof deleteActionMap];
      return deleteAction(variables as any);
    },
    onSuccess: () => {
      toast.success(
        `${
          table.charAt(0).toUpperCase() + table.slice(1)
        } is deleted successfully`,
      );
      onClose?.();
    },
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (id) mutate({ id });
  };

  return type === "delete" && id ? (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 p-4">
      <span className="text-center font-medium">
        Are you sure you want to delete this {table}?
      </span>
      <Button
        variant="destructive"
        type="submit"
        className="self-center"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <LoaderCircle className="animate-spin h-4 w-4" />
            Deleting...
          </>
        ) : (
          "Delete"
        )}
      </Button>
    </form>
  ) : type === "create" || type === "update" ? (
    forms[table](type, data, onClose, relatedData)
  ) : (
    "Form not found"
  );
};

const FormModal = ({
  table,
  type,
  data,
  id,
  relatedData,
}: FormContainerType) => {
  const [open, setOpen] = useState(false);

  const size = type === "create" ? "w-9 h-9" : "w-7 h-7";
  const icon =
    type === "create" ? (
      <Plus />
    ) : type === "update" ? (
      <Pencil size={16} />
    ) : (
      <Trash2 size={16} />
    );

  const handleClose = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div
          className={`${size} flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors`}
        >
          {icon}
        </div>
      </DialogTrigger>
      <DialogContent className="w-[90vw] max-w-[800px] sm:max-w-[600px] md:max-w-[700px] max-h-[85vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle>
            {type === "create"
              ? `Create ${table}`
              : type === "update" && `Update ${table}`}
          </DialogTitle>
        </DialogHeader>
        <FormContent
          table={table}
          type={type}
          data={data}
          id={id}
          onClose={handleClose}
          relatedData={relatedData}
        />
      </DialogContent>
    </Dialog>
  );
};

export default FormModal;
