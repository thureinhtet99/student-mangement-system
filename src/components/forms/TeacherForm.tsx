"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpFromLine, LoaderCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { teacherFormSchema } from "@/lib/formSchema";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createTeacher, updateTeacher } from "@/lib/actions";
import { toast } from "sonner";
import Image from "next/image";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "../ui/label";
import { Separator } from "@/components/ui/separator";
import { CLOUDINARY_CONFIG } from "@/configs/appConfig";
import FormActionButton from "../FormActionButton";
import MultiSelectBox from "../MultiSelectBox";

// Schema type
type Inputs = z.infer<typeof teacherFormSchema>;

const TeacherForm = ({
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
  const [selectedSubjects, setSelectedSubjects] = useState<(string | number)[]>(
    data?.subjects?.map((t: any) => t.id) || [],
  );
  const [selectedClassItems, setSelectedClassItems] = useState<
    (string | number)[]
  >(data?.classes?.map((t: any) => t.id) || []);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [shouldRemovePhoto, setShouldRemovePhoto] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const initialSelectedSubjects = data?.subjects?.map((t: any) => t.id) || [];
  const initialSelectedClasses = data?.classes?.map((t: any) => t.id) || [];

  const subjects = relatedData?.subjects || [];
  const classItems = relatedData?.classItems || [];

  const form = useForm<Inputs>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      username: data?.username || "",
      email: data?.email || "",
      password: data?.password || "",
      name: data?.name || "",
      phone: data?.phone || "",
      address: data?.address || "",
      gender: data?.gender || "",
      birthday: data?.birthday ? new Date(data.birthday) : undefined,
      image: data?.image || "",
    },
  });

  const handleReset = () => {
    form.reset();
    setShouldRemovePhoto(false);
    setPreviewUrl(null);
    if (type === "create" || "update") {
      setSelectedSubjects(initialSelectedSubjects);
      setSelectedClassItems(initialSelectedClasses);
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
        return await createTeacher(values);
      } else {
        return await updateTeacher(values);
      }
    },
    onSuccess: () => {
      toast.success(
        `Teacher ${type === "create" ? "created" : "updated"} successfully`,
      );
      form.reset();
      setSelectedSubjects([]);
      setSelectedClassItems([]);
      setShouldRemovePhoto(false);
      setPreviewUrl(null);
      onClose?.();
    },
    onError: () => {
      toast.error(
        `Failed to ${type === "create" ? "create" : "update"} teacher`,
      );
    },
  });

  // onSubmit
  const onSubmit = (values: Inputs) => {
    const formData = {
      ...(type === "update" && data?.id && { id: data.id }),
      ...values,
      ...(shouldRemovePhoto && { removePhoto: true }),
      subjects: selectedSubjects.map((subject) => Number(subject)),
      classes: selectedClassItems.map((classItem) => Number(classItem)),
    };
    mutate(formData);
  };

  // Helper function to get display image
  const getDisplayImage = () => {
    if (shouldRemovePhoto) return null;
    if (previewUrl) return previewUrl;
    if (data?.image && type === "update") return data.image;
    return null;
  };

  // Helper function to check if there's a database image
  const hasDbImage = () => {
    return type === "update" && data?.image;
  };

  return (
    <Card className="w-full py-4">
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 py-4"
          >
            {isError && (
              <div className="bg-destructive/15 p-3 rounded-md">
                <p className="text-xs font-medium text-destructive">
                  {error?.message || "Something went wrong. Please try again"}
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
                          <Input
                            type="text"
                            placeholder="Enter username"
                            {...field}
                          />
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
                              placeholder="********"
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
                            <Input
                              type="text"
                              placeholder="Enter name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <MultiSelectBox
                      name="subject"
                      subject="teacher"
                      verb="teaching"
                      items={subjects}
                      selectedItems={selectedSubjects}
                      setSelectedItems={setSelectedSubjects}
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
                          <FormMessage />
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
                            <Input
                              type="text"
                              placeholder="Enter address"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-8">
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <FormControl>
                            <RadioGroup
                              className="gap-1"
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="MALE" id="male" />
                                <Label htmlFor="male">Male</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="FEMALE" id="female" />
                                <Label htmlFor="female">Female</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <MultiSelectBox
                      name="class"
                      subject="teacher"
                      verb="including"
                      items={classItems}
                      selectedItems={selectedClassItems}
                      setSelectedItems={setSelectedClassItems}
                    />

                    <FormField
                      control={form.control}
                      name="birthday"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(
                                  value ? new Date(value) : undefined,
                                );
                              }}
                              value={
                                field.value instanceof Date &&
                                !isNaN(field.value.getTime())
                                  ? field.value.toISOString().split("T")[0]
                                  : ""
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-6">
                  Profile Picture (Optional)
                </h3>
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                          <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary/20 bg-muted flex items-center justify-center">
                            {isImageLoading && (
                              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 animate-in fade-in duration-300">
                                <LoaderCircle className="animate-spin h-6 w-6" />
                              </div>
                            )}
                            {getDisplayImage() ? (
                              <Image
                                src={getDisplayImage()!}
                                alt="Profile"
                                fill
                                className="object-cover transition-all duration-300"
                                sizes="128px"
                                onLoadStart={() => setIsImageLoading(true)}
                                onLoad={() => setIsImageLoading(false)}
                                onError={() => setIsImageLoading(false)}
                              />
                            ) : (
                              <span className="text-muted-foreground text-xs text-center px-2">
                                {shouldRemovePhoto
                                  ? "Photo will be removed"
                                  : "No image selected"}
                              </span>
                            )}
                          </div>

                          <div className="space-y-3 flex-1 w-full sm:w-auto">
                            <div className="flex flex-col gap-2">
                              <Input
                                type="file"
                                id="imageUpload"
                                accept="image/jpeg,image/png,image/jpg,image/webp"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;

                                  setIsImageLoading(true);

                                  try {
                                    // Validate file size
                                    if (
                                      file.size >
                                      CLOUDINARY_CONFIG.MAX_FILE_SIZE
                                    ) {
                                      toast.error(
                                        "File size must be less than 2MB",
                                      );
                                      return;
                                    }

                                    // Validate file type
                                    const fileType = file.type.split("/")[1];
                                    if (
                                      !CLOUDINARY_CONFIG.ALLOWED_FORMATS.includes(
                                        fileType,
                                      )
                                    ) {
                                      toast.error(
                                        "Only JPG, PNG, and WebP files are allowed",
                                      );
                                      return;
                                    }

                                    // Create preview URL
                                    const url = URL.createObjectURL(file);
                                    setPreviewUrl(url);

                                    // Update form field
                                    field.onChange(file);
                                    setShouldRemovePhoto(false);

                                    toast.success(
                                      "Image selected successfully",
                                    );
                                  } catch (error) {
                                    toast.error("Failed to process image");
                                  } finally {
                                    setIsImageLoading(false);
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="secondary"
                                className="flex items-center justify-center gap-2 hover:scale-105 transition-all duration-200"
                                onClick={() =>
                                  document
                                    .getElementById("imageUpload")
                                    ?.click()
                                }
                                disabled={isImageLoading}
                              >
                                {isImageLoading ? (
                                  <LoaderCircle className="h-4 w-4 animate-spin" />
                                ) : (
                                  <ArrowUpFromLine className="h-4 w-4" />
                                )}
                                {getDisplayImage()
                                  ? "Change photo"
                                  : "Upload photo"}
                              </Button>

                              {(getDisplayImage() || shouldRemovePhoto) && (
                                <div className="flex gap-2">
                                  {!shouldRemovePhoto ? (
                                    <>
                                      {/* Only show remove button if there's a database image OR a preview */}
                                      {(hasDbImage() || previewUrl) && (
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            // Clean up preview URL
                                            if (previewUrl) {
                                              URL.revokeObjectURL(previewUrl);
                                              setPreviewUrl(null);
                                            }
                                            field.onChange("");

                                            // Only set shouldRemovePhoto if there's a database image
                                            if (hasDbImage()) {
                                              setShouldRemovePhoto(true);
                                            }

                                            setIsImageLoading(false);
                                          }}
                                          disabled={isImageLoading}
                                        >
                                          {hasDbImage()
                                            ? "Remove photo"
                                            : "Clear selection"}
                                        </Button>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled
                                      >
                                        Photo marked for removal
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => {
                                          setShouldRemovePhoto(false);
                                          // Restore original image if in update mode
                                          if (
                                            type === "update" &&
                                            data?.image
                                          ) {
                                            field.onChange(data.image);
                                          }
                                        }}
                                      >
                                        Undo
                                      </Button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                            <FormDescription>
                              Upload a profile picture (optional - JPG, PNG or
                              WebP, max 2MB)
                            </FormDescription>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormActionButton
              form={form}
              setSelectedItems={handleReset}
              setIsImageLoading={setIsImageLoading}
              resetMutation={resetMutation}
              isPending={isPending}
              isImageLoading={isImageLoading}
              type={type}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TeacherForm;
