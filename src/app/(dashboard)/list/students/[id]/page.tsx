import Link from "next/link";
import BigCalendar from "@/components/BigCalender";
import Performance from "@/components/Performance";
import { Calendar1, Mail, Phone, MapPin, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getStudentById } from "@/lib/actions";
import { ROUTE_CONFIG } from "@/configs/appConfig";
import FormContainer from "@/components/FormContainer";
import { dateFormat } from "@/lib/dataTimeFormat";
import { StudentListType } from "@/types";

const SingleStudentPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const { student, error } = await getStudentById(id);

  if (error || !student) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Student Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The student you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <Button asChild>
              <Link href={ROUTE_CONFIG.STUDENT_LIST}>Back to Students</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        {/* USER INFO CARD */}
        <Card className="flex-1">
          <CardContent className="space-y-4 py-4">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex justify-center sm:justify-start">
                <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                  <AvatarImage
                    src={student?.image || undefined}
                    alt={student.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-sm font-semibold">
                    {student.name
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
                    {student.name}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    ID: {student.id}
                  </p>
                </div>
              </div>
              <div className="flex justify-center sm:justify-end">
                <FormContainer
                  table="student"
                  type="update"
                  data={{
                    id: student.id,
                    username: student.username,
                    name: student.name,
                    email: student.email,
                    phone: student.phone,
                    address: student.address,
                    gender: student.gender,
                    birthday: student.birthday,
                    image: student.image,
                    parentId: student.parentId,
                    classId: student.classId,
                    gradeId: student.gradeId,
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
                      {student?.email || "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                  <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">Phone</p>
                    <p className="text-xs text-muted-foreground">
                      {student?.phone || "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                  <Calendar1 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">Birthday</p>
                    <p className="text-xs text-muted-foreground">
                      {student?.birthday ? dateFormat(student?.birthday) : "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
                  <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">Address</p>
                    <p className="text-xs text-muted-foreground">
                      {student?.address || "-"}
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
            <CardTitle>Student&apos;s Schedule</CardTitle>
          </CardHeader>
          <CardContent className="h-[750px]">
            <BigCalendar />
          </CardContent>
        </Card>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        {/* Attendance Section */}
        <Card>
          <CardContent>
            <div className="py-4">
              <div>
                <h3 className="font-medium mb-3 flex items-center justify-between">
                  <span>Attendance Summary</span>
                  <Badge variant="outline">{new Date().getFullYear()}</Badge>
                </h3>

                {/* Monthly Attendance Breakdown */}
                <div className="space-y-3 mb-4">
                  {(() => {
                    const monthlyData: Record<
                      string,
                      { present: number; absent: number; total: number }
                    > = {};
                    const currentYear = new Date().getFullYear();

                    // Initialize all months
                    for (let i = 0; i < 12; i++) {
                      const monthName = new Date(currentYear, i).toLocaleString(
                        "default",
                        { month: "long" },
                      );
                      monthlyData[monthName] = {
                        present: 0,
                        absent: 0,
                        total: 0,
                      };
                    }

                    // Calculate attendance for each month
                    student?.attendances?.forEach((attendance) => {
                      const attendanceDate = new Date(attendance.date);
                      if (attendanceDate.getFullYear() === currentYear) {
                        const monthName = attendanceDate.toLocaleString(
                          "default",
                          { month: "long" },
                        );
                        if (monthlyData[monthName]) {
                          monthlyData[monthName].total += 1;
                          if (attendance.present) {
                            monthlyData[monthName].present += 1;
                          } else {
                            monthlyData[monthName].absent += 1;
                          }
                        }
                      }
                    });

                    const monthsWithData = Object.entries(monthlyData)
                      .filter(([_, data]) => data.total > 0)
                      .slice(0, 6); // Show only first 6 months with data

                    if (monthsWithData.length === 0) {
                      return (
                        <div className="text-sm text-muted-foreground text-center py-4 border rounded-lg bg-muted/50">
                          No attendance data available
                        </div>
                      );
                    }

                    return monthsWithData.map(([month, data]) => (
                      <div
                        key={month}
                        className="p-3 rounded-lg border bg-muted/50"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">{month}</span>
                          <span className="text-xs text-muted-foreground">
                            {data.total} days
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-green-600">
                              {data.present}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Present
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-red-600">
                              {data.absent}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Absent
                            </div>
                          </div>
                        </div>
                        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-green-500 h-full transition-all duration-300"
                            style={{
                              width: `${
                                data.total > 0
                                  ? (data.present / data.total) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 text-center">
                          {data.total > 0
                            ? Math.round((data.present / data.total) * 100)
                            : 0}
                          % attendance rate
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Student Information Section */}
        <Card>
          <CardContent>
            <div className="py-4">
              <div>
                <h3 className="font-medium mb-3">Student Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Parent</span>
                    <span className="font-medium">
                      {student?.parent?.name || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Siblings</span>
                    <div className="flex flex-wrap items-end justify-end gap-1 max-w-[200px]">
                      {student?.parent?.students &&
                      student?.parent?.students?.length > 0 ? (
                        student?.parent?.students.map(
                          (sibling: StudentListType, index: number) => (
                            <span
                              key={sibling.id}
                              className="inline-flex items-center"
                            >
                              <Link
                                href={`${ROUTE_CONFIG.STUDENT_LIST}/${sibling.id}`}
                                className="font-medium underline text-blue-600 hover:text-blue-800 text-right"
                              >
                                <span className="text-sm">{sibling.name}</span>
                              </Link>
                              {index <
                                (student?.parent?.students?.length ?? 0) -
                                  1 && (
                                <span className="text-muted-foreground ml-1">
                                  ,
                                </span>
                              )}
                            </span>
                          ),
                        )
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Class</span>
                    <Badge variant="outline">
                      {student?.class?.name || ""}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Grade</span>
                    <Badge variant="outline">
                      {student?.grade?.level
                        ? `${student?.grade.level}th Grade`
                        : "-"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Gender</span>
                    <Badge variant="secondary">{student.gender}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Results Section */}
        <Card>
          <CardContent>
            <div className="py-4">
              <div>
                <h3 className="font-medium mb-3">Recent Results</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {student?.results && student?.results?.length > 0 ? (
                    student?.results.map((result, index) => (
                      <div
                        key={result.id}
                        className="flex justify-between items-center text-sm p-3 rounded-lg border bg-muted/50"
                      >
                        <span className="text-muted-foreground">
                          {result?.exam?.name ||
                            result?.assignment?.name ||
                            `Result ${index + 1}`}
                        </span>
                        <Badge
                          variant={result.score >= 70 ? "default" : "outline"}
                        >
                          {result.score}/100
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-4 border rounded-lg bg-muted/50">
                      No results available
                    </div>
                  )}
                </div>
                {/* {student?.results && student?.results?.length > 0 && (
                  <>
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden mt-3">
                      <div
                        className="bg-foreground h-full transition-all duration-300"
                        style={{
                          width: `${
                            student?.results?.length > 0
                              ? student?.results.reduce(
                                  (sum, result) => sum + result.score,
                                  0
                                ) / student?.results?.length
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 text-center">
                      {Math.round(
                        student?.results.reduce(
                          (sum, result) => sum + result.score,
                          0
                        ) / student?.results?.length
                      )}
                      /100 Average Score
                    </div>
                  </>
                )} */}
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
                  <Performance results={student?.results} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card> */}
        {/* Announcement */}
        {/* <Card>
          <CardContent>
            <div className="py-4">
              <div className="space-y-3">
                <Announcements />
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
};

export default SingleStudentPage;
