"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { subjectFormSchema } from "@/lib/formSchema";
import { useState } from "react";
import { createSubject, updateSubject } from "@/lib/actions";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import MultiSelectBox from "../MultiSelectBox";
import FormActionButton from "../FormActionButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

// Schema type
type Inputs = z.infer<typeof subjectFormSchema>;

const SubjectForm = ({
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
  const [selectedLessons, setSelectedLessons] = useState<(string | number)[]>(
    data?.lessons?.map((t: any) => t.id) || [],
  );
  const [selectedTeachers, setSelectedTeachers] = useState<(string | number)[]>(
    data?.teachers?.map((t: any) => t.id) || [],
  );
  const initialSelectedLessons = data?.lessons?.map((t: any) => t.id) || [];
  const initialSelectedTeachers = data?.teachers?.map((t: any) => t.id) || [];

  const lessons = relatedData?.lessons || [];
  const teachers = relatedData?.teachers || [];
  const classes = relatedData?.classes || [];

  const form = useForm<Inputs>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: {
      name: data?.name || "",
      description: data?.description || "",
    },
  });

  const handleReset = () => {
    form.reset();
    if (type === "create" || "update") {
      setSelectedLessons(initialSelectedLessons);
      setSelectedTeachers(initialSelectedTeachers);
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
        return await createSubject(values);
      } else {
        return await updateSubject(values);
      }
    },
    onSuccess: () => {
      toast.success(
        `Subject is ${type === "create" ? "created" : "updated"} successfully`,
      );
      form.reset();
      setSelectedLessons([]);
      setSelectedTeachers([]);
      onClose?.();
    },
    onError: () => {
      toast.error(
        `Failed to ${type === "create" ? "create" : "update"} subject`,
      );
    },
  });

  const onSubmit = (values: Inputs) => {
    const formData = {
      ...(type === "update" && data?.id && { id: data.id }),
      ...values,
      lessons: selectedLessons,
      teachers: selectedTeachers,
    };
    mutate(formData);
  };

  return (
    <Card className="w-full py-4 border-0">
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {isError && (
              <div className="bg-destructive/15 p-3 rounded-md mb-4">
                <p className="text-sm font-medium text-destructive">
                  Error:{" "}
                  {error?.message || "Something went wrong. Please try again."}
                </p>
              </div>
            )}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter subject name" {...field} />
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
              <div className="space-y-8">
                <FormField
                  control={form.control}
                  name="classId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class</FormLabel>
                      <Select
                        value={field.value ? String(field.value) : ""}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {classes?.length === 0 ? (
                            <SelectItem value="empty" disabled>
                              No classes found
                            </SelectItem>
                          ) : (
                            classes?.map((c: any) => (
                              <SelectItem key={c.id} value={String(c.id)}>
                                {c.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <MultiSelectBox
                  name="lesson"
                  subject="subjects"
                  verb="including"
                  items={lessons}
                  selectedItems={selectedLessons}
                  setSelectedItems={setSelectedLessons}
                />
              </div>

              <MultiSelectBox
                name="teacher"
                subject="subjects"
                verb="including"
                items={teachers}
                selectedItems={selectedTeachers}
                setSelectedItems={setSelectedTeachers}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter subject description"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a brief description of the subject (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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

export default SubjectForm;
