"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { assignmentFormSchema } from "@/lib/formSchema";
import {
  Form,
  FormControl,
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
import { useMutation } from "@tanstack/react-query";
import { createAssignment, updateAssignment } from "@/lib/actions";
import { toast } from "sonner";
import FormActionButton from "../FormActionButton";
import { formatDateTimeLocal } from "@/lib/dataTimeFormat";

// Schema type
type Inputs = z.infer<typeof assignmentFormSchema>;

const AssignmentForm = ({
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

  const form = useForm<Inputs>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      name: data?.name || "",
      dueDate: data?.dueDate ? new Date(data.dueDate) : undefined,
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
        return await createAssignment(values);
      } else {
        return await updateAssignment(values);
      }
    },
    onSuccess: () => {
      toast.success(
        `Assignment ${type === "create" ? "created" : "updated"} successfully`,
      );
      form.reset();
      onClose?.();
    },
    onError: () => {
      toast.error(
        `Failed to ${type === "create" ? "create" : "update"} assignment`,
      );
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
                    <Input placeholder="Enter assignment name" {...field} />
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
                  <FormLabel>Subjects</FormLabel>
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

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due date</FormLabel>
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

export default AssignmentForm;
