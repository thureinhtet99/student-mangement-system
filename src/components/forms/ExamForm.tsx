"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { examFormSchema } from "@/lib/formSchema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import FormActionButton from "../FormActionButton";
import { useMutation } from "@tanstack/react-query";
import { createExam, updateExam } from "@/lib/actions";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";
import { formatDateTimeLocal } from "@/lib/dataTimeFormat";

// Schema type
type Inputs = z.infer<typeof examFormSchema>;

const ExamForm = ({
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
  const subjects = relatedData?.subjects || [];

  // useForm
  const form = useForm<Inputs>({
    resolver: zodResolver(examFormSchema),
    defaultValues: {
      name: data?.name || "",
      description: data?.description || "",
      startTime: data?.startTime ? new Date(data.startTime) : undefined,
      endTime: data?.endTime ? new Date(data.endTime) : undefined,
      subjectId: data?.subjectId || "",
    },
  });

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
        return await createExam(values);
      } else {
        return await updateExam(values);
      }
    },
    onSuccess: () => {
      toast.success(
        `Exam ${type === "create" ? "created" : "updated"} successfully`,
      );
      form.reset();
      onClose?.();
    },
    onError: () => {
      toast.error(`Failed to ${type === "create" ? "create" : "update"} exam`);
    },
  });

  // onSubmit
  const onSubmit = (values: Inputs) => {
    const formData = {
      ...(type === "update" && data?.id && { id: data.id }),
      ...values,
    };
    mutate(formData);
  };

  return (
    <Card className="w-full py-4">
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {isError && (
              <div className="bg-destructive/15 p-3 rounded-md">
                <p className="text-xs font-medium text-destructive">
                  {error?.message || "Something went wrong. Please try again"}
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
                    <Input placeholder="Enter exam name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ? String(field.value) : ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects?.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          No subjects found
                        </SelectItem>
                      ) : (
                        subjects?.map((c: any) => (
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start time</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? new Date(value) : undefined);
                        }}
                        value={
                          field.value instanceof Date &&
                          !isNaN(field.value.getTime())
                            ? formatDateTimeLocal(field.value)
                            : ""
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End time</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? new Date(value) : undefined);
                        }}
                        value={
                          field.value instanceof Date &&
                          !isNaN(field.value.getTime())
                            ? formatDateTimeLocal(field.value)
                            : ""
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
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
                      placeholder="Enter exam description"
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a brief description of the exam (optional).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormActionButton
              form={form}
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

export default ExamForm;
