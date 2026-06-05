import Link from "next/link";
import BigCalendar from "@/components/BigCalender";
import Announcements from "@/components/Announcements";
import TeacherPerformance from "@/components/TeacherPerformance";
import { Calendar1, Mail, Phone, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getTeacherById } from "@/lib/actions";
import { ROUTE_CONFIG } from "@/configs/appConfig";
import FormContainer from "@/components/FormContainer";
import { dateFormat } from "@/lib/dataTimeFormat";
import { Badge } from "@/components/ui/badge";
import Performance from "@/components/Performance";

const SingleTeacherPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const { teacher, error } = await getTeacherById(id);

  if (error || !teacher) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Teacher Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The teacher you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <Button asChild>
              <Link href={ROUTE_CONFIG.TEACHER_LIST}>Back to teachers</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      <div className="w-full xl:w-2/3">
        <Card className="flex-1">
          <CardContent className="space-y-4 py-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex justify-center sm:justify-start">
                <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                  <AvatarImage
                    src={teacher?.image || undefined}
                    alt={teacher.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-sm font-semibold">
                    {teacher.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 space-y-1">
                <div className="text-center sm:text-left">
                  <h2 className="text-xl font-bold tracking-tight">
                    {teacher.name}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    ID: {teacher.id}
                  </p>
                </div>
              </div>
              <div className="flex justify-center sm:justify-end">
                <FormContainer
                  table="teacher"
                  type="update"
                  data={{
                    id: teacher.id,
                    username: teacher.username,
                    name: teacher.name,
                    email: teacher.email,
                    phone: teacher.phone,
                    address: teacher.address,
                    gender: teacher.gender,
                    birthday: teacher.birthday,
                    image: teacher.image,
                  }}
                />
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="space-y-3">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Contact Information
              </h3>
              <div className="grid gap-2">
                <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                  <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">Email</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {teacher?.email || "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                  <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">Phone</p>
                    <p className="text-xs text-muted-foreground">
                      {teacher?.phone || "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                  <Calendar1 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">Birthday</p>
                    <p className="text-xs text-muted-foreground">
                      {teacher?.birthday ? dateFormat(teacher?.birthday) : "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                  <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">Address</p>
                    <p className="text-xs text-muted-foreground">
                      {teacher?.address || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BOTTOM */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Teacher&apos;s Schedule</CardTitle>
          </CardHeader>
          <CardContent className="h-[750px]">
            <BigCalendar />
          </CardContent>
        </Card>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        {/* Teacher Information Section */}
        <Card>
          <CardContent>
            <div className="py-4">
              <div>
                <h3 className="font-medium mb-3">Teacher Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Subjects</span>
                    <div className="flex flex-wrap items-end justify-end gap-1 max-w-[200px]">
                      {teacher?.subjects && teacher?.subjects?.length > 0 ? (
                        teacher?.subjects.map((t, index) => (
                          <span key={t.id} className="inline-flex items-center">
                            <span className="text-sm">{t.name}</span>
                            {index < (teacher?.subjects?.length ?? 0) - 1 && (
                              <span className="text-muted-foreground">, </span>
                            )}
                          </span>
                        ))
                      ) : (
                        <span className="font-medium text-muted-foreground">
                          No subjects
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Class</span>
                    <Badge variant="outline">
                      {teacher?.classes && teacher?.classes?.length > 0 ? (
                        teacher?.classes.map((t, index) => (
                          <span key={t.id} className="inline-flex items-center">
                            <span className="text-sm">{t.name}</span>
                            {index < (teacher?.classes?.length ?? 0) - 1 && (
                              <span className="text-muted-foreground">, </span>
                            )}
                          </span>
                        ))
                      ) : (
                        <span className="font-medium text-muted-foreground">
                          No classes
                        </span>
                      )}{" "}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Gender</span>
                    <Badge variant="secondary">{teacher.gender}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance */}
        {/* <Card>
          <CardContent>
            <div className="py-4">
              <div>
                <h3 className="font-medium mb-3">Performance</h3>
                <div className="space-y-3">
                  <Performance />
                  </div>
              </div>
            </div>
          </CardContent>
        </Card> */}
        {/* <TeacherPerformance
          teacherId={teacher.id}
          subjects={teacher.subjects || []}
          classes={teacher.classes || []}
        /> */}

        {/* Announcement */}
        <Card>
          <CardContent>
            <div className="py-4">
              <div className="space-y-3">
                <Announcements />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SingleTeacherPage;
