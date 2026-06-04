"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { parentFormSchema } from "@/lib/formSchema";
import { useState } from "react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";
import { createParent, updateParent } from "@/lib/actions";
import FormActionButton from "../FormActionButton";
import MultiSelectBox from "../MultiSelectBox";

// Schema type
type Inputs = z.infer<typeof parentFormSchema>;

const ParentForm = ({
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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<(string | number)[]>(
    data?.students?.map((t: any) => t.id) || [],
  );

  const initialSelectedStudents = data?.students?.map((t: any) => t.id) || [];

  const students = relatedData?.students || [];

  const form = useForm<Inputs>({
    resolver: zodResolver(parentFormSchema),
    defaultValues: {
      username: data?.username || "",
      email: data?.email || "",
      password: data?.password || "",
      name: data?.name || "",
      phone: data?.phone || "",
      address: data?.address || "",
    },
  });

  const handleReset = () => {
    form.reset();
    if (type === "create" || "update") {
      setSelectedStudents(initialSelectedStudents);
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
        return await createParent(values);
      } else {
        return await updateParent(values);
      }
    },
    onSuccess: () => {
      toast.success(
        `Parent ${type === "create" ? "created" : "updated"} successfully`,
      );
      form.reset();
      setSelectedStudents([]);
      onClose?.();
    },
    onError: (error) => {
      toast.error(
        `Failed to ${type === "create" ? "create" : "update"} parent: ${
          error.message
        }`,
      );
    },
  });

  // onSubmit
  const onSubmit = (values: Inputs) => {
    const formData = {
      ...(type === "update" && data?.id && { id: data.id }),
      ...values,
      students: selectedStudents,
    };
    mutate(formData);
  };

  return (
    <Card className="w-full shadow-sm">
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 py-4"
          >
            {isError && (
              <div className="bg-destructive/15 p-3 rounded-md">
                <p className="text-sm font-medium text-destructive">
                  {error?.message || "Something went wrong. Please try again."}
                </p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-6">
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={isPasswordVisible ? "text" : "password"}
                              placeholder="*******"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                              onClick={() =>
                                setIsPasswordVisible(!isPasswordVisible)
                              }
                            >
                              {isPasswordVisible ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-6">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-8">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="Enter phone"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter address" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-8">
                    <MultiSelectBox
                      name="student"
                      subject="parent"
                      verb="including"
                      items={students}
                      selectedItems={selectedStudents}
                      setSelectedItems={setSelectedStudents}
                    />
                  </div>
                </div>
              </div>
            </div>

            <FormActionButton
              form={form}
              setSelectedItems={handleReset} // Pass custom reset function instead of setSelectedStudents
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

export default ParentForm;
