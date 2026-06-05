"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { createClass, updateClass } from "@/lib/actions";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { classFormSchema } from "@/lib/formSchema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import FormActionButton from "../FormActionButton";
import MultiSelectBox from "../MultiSelectBox";

// Schema type
type Inputs = z.infer<typeof classFormSchema>;

const ClassForm = ({
  type,
  data,
  onClose,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  onClose?: () => void;
  relatedData?: any;
}) => {
  const [selectedSubjects, setSelectedSubjects] = useState<(string | number)[]>(
    data?.subjects?.map((t: any) => t.id) || [],
  );
  const [selectedStudents, setSelectedStudents] = useState<(string | number)[]>(
    data?.students?.map((t: any) => t.id) || [],
  );

  const initialSelectedStudents = data?.students?.map((t: any) => t.id) || [];
  const initialSelectedSubjects = data?.subjects?.map((t: any) => t.id) || [];

  const teachers = relatedData?.teachers || [];
  const students = relatedData?.students || [];
  const subjects = relatedData?.subjects || [];

  const form = useForm<Inputs>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: data?.name || "",
      teacherId: data?.teacherId || "",
    },
  });

  const handleReset = () => {
    form.reset();
    if (type === "create" || "update") {
      setSelectedStudents(initialSelectedStudents);
      setSelectedSubjects(initialSelectedSubjects);
    }
  };

  // Mutation
  const {
    isPending,
    isError,
    error,
    mutate,
    reset: resetMutation,
  } = useMutation({
    mutationFn: async (values: Inputs) => {
      if (type === "create") {
        return await createClass(values);
      } else {
        return await updateClass(values);
      }
    },
    onSuccess: () => {
      toast.success(
        `Class is ${type === "create" ? "created" : "updated"} successfully`,
      );
      form.reset();
      setSelectedSubjects([]);
      setSelectedStudents([]);
      onClose?.();
    },
  });

  const onSubmit = (values: Inputs) => {
    const formData = {
      ...(type === "update" && data?.id && { id: data.id }),
      ...values,
      subjects: selectedSubjects,
      students: selectedStudents,
    };
    mutate(formData);
  };

  return (
    <Card className="w-full py-4 border-0">
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter class name" {...field} />
                  </FormControl>
                  {isError && (
                    <p className="text-xs font-medium text-destructive mt-1">
                      {error?.message}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Students */}
              <MultiSelectBox
                name="student"
                subject="class"
                verb="including"
                items={students}
                selectedItems={selectedStudents}
                setSelectedItems={setSelectedStudents}
              />

              {/* Subjects */}
              <MultiSelectBox
                name="subject"
                subject="class"
                verb="including"
                items={subjects}
                selectedItems={selectedSubjects}
                setSelectedItems={setSelectedSubjects}
              />

              {/* Teacher */}

              <FormField
                control={form.control}
                name="teacherId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teacher</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select teacher" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teachers?.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            No teachers found
                          </SelectItem>
                        ) : (
                          teachers?.map((teacher: any) => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              {teacher.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    <FormDescription>
                      Select the teacher this class will be including
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

            {/* Form actions */}
            <FormActionButton
              form={form}
              setSelectedItems={handleReset}
              resetMutation={resetMutation}
              isPending={isPending}
              type={type}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ClassForm;
