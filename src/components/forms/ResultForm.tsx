"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resultFormSchema } from "@/lib/formSchema";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import FormActionButton from "../FormActionButton";
import { useMutation } from "@tanstack/react-query";
import { createResult, updateResult } from "@/lib/actions";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";
import { useState } from "react";

// Schema type
type Inputs = z.infer<typeof resultFormSchema>;

const ResultForm = ({
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
  const students = relatedData?.students || [];
  const exams = relatedData?.exams || [];
  const assignments = relatedData?.assignments || [];

  const [resultType, setResultType] = useState<"exam" | "assignment">(
    data?.examId ? "exam" : data?.assignmentId ? "assignment" : "exam",
  );

  const handleReset = () => {
    form.reset();
    form.clearErrors();
    resetMutation();
  };

  // useForm
  const form = useForm<Inputs>({
    resolver: zodResolver(resultFormSchema),
    defaultValues: {
      score: data?.score || 0,
      comment: data?.comment || "",
      studentId: data?.studentId || "",
      examId: data?.examId,
      assignmentId: data?.assignmentId,
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
        return await createResult(values);
      } else {
        return await updateResult(values);
      }
    },
    onSuccess: () => {
      toast.success(
        `Result ${type === "create" ? "created" : "updated"} successfully`,
      );
      form.reset();
      onClose?.();
    },
    onError: () => {
      toast.error(
        `Failed to ${type === "create" ? "create" : "update"} result`,
      );
    },
  });

  // onSubmit
  const onSubmit = (values: Inputs) => {
    const formData = {
      ...(type === "update" && data?.id && { id: data.id }),
      ...values,
      // Clear the opposite field based on result type
      examId: resultType === "exam" ? values.examId : undefined,
      assignmentId:
        resultType === "assignment" ? values.assignmentId : undefined,
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
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student</FormLabel>
                  {type === "create" ? (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="h-[400px]">
                        {students?.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            No students found
                          </SelectItem>
                        ) : (
                          students?.map((student: any) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  ) : (
                    <FormControl>
                      <Input
                        type="text"
                        value={
                          students.find(
                            (s: any) => s.id.toString() === field.value,
                          )?.name || ""
                        }
                        disabled
                        readOnly
                        className="bg-muted"
                      />
                    </FormControl>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Result Type</FormLabel>
              <Tabs
                value={resultType}
                onValueChange={(value: string) => {
                  const typedValue = value as "exam" | "assignment";
                  setResultType(typedValue);
                  // Clear opposite field when switching types
                  if (typedValue === "exam") {
                    form.resetField("assignmentId");
                  } else {
                    form.resetField("examId");
                  }
                }}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="exam">Exam</TabsTrigger>
                  <TabsTrigger value="assignment">Assignment</TabsTrigger>
                </TabsList>

                <TabsContent value="exam" className="mt-4">
                  <FormField
                    control={form.control}
                    name="examId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exam</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ? String(field.value) : ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select exam" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {exams?.length === 0 ? (
                              <SelectItem value="empty" disabled>
                                No exams found
                              </SelectItem>
                            ) : (
                              exams?.map((exam: any) => (
                                <SelectItem
                                  key={exam.id}
                                  value={String(exam.id)}
                                >
                                  {exam.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="assignment" className="mt-4">
                  <FormField
                    control={form.control}
                    name="assignmentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assignment</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ? String(field.value) : ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select assignment" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {assignments?.length === 0 ? (
                              <SelectItem value="empty" disabled>
                                No assignments found
                              </SelectItem>
                            ) : (
                              assignments?.map((assignment: any) => (
                                <SelectItem
                                  key={assignment.id}
                                  value={String(assignment.id)}
                                >
                                  {assignment.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
            </div>

            <FormField
              control={form.control}
              name="score"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Score (0-100)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Enter score"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter comment (optional)"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a brief comment of the result (optional)
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
              customReset={handleReset}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ResultForm;
