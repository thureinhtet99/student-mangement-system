import AttendanceChart from "@/components/AttendanceChart";
import CountChart from "@/components/CountChart";
import UserCard from "@/components/UserCard";
import Announcements from "@/components/Announcements";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Event from "@/components/Event";
import { auth } from "@clerk/nextjs/server";
import { ROUTE_CONFIG } from "@/configs/appConfig";
import "react-calendar/dist/Calendar.css";
import { getAttendances } from "@/lib/actions";
import Calendar from "react-calendar";
import { AttendanceListType } from "@/types";

const AdminPage = async () => {
  const studentCounts = await prisma.student.groupBy({
    by: ["gender"],
    _count: true,
  });

  const boys =
    studentCounts.find((student) => student.gender === "MALE")?._count || 0;
  const girls =
    studentCounts.find((student) => student.gender === "FEMALE")?._count || 0;

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const whereClause =
    role !== "admin"
      ? {
          AND: [
            {
              OR: [
                // Teacher
                {
                  class: {
                    teacherId: userId as string,
                  },
                },
                // Student
                {
                  class: {
                    students: {
                      some: { id: userId as string },
                    },
                  },
                },
                // Parent
                {
                  class: {
                    students: {
                      some: { parentId: userId as string },
                    },
                  },
                },
              ],
            },
          ].filter((condition) => Object.keys(condition).length > 0),
        }
      : undefined;

  const events = await prisma.event.findMany({
    where: whereClause,
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  const attendanceData = await getAttendances();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* LEFT SECTION */}
          <div className="xl:col-span-2 space-y-6">
            {/* USER CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <UserCard type="admin" />
              <UserCard type="teacher" />
              <UserCard type="student" />
              <UserCard type="parent" />
            </div>

            {/* CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* COUNT CHART */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[450px]">
                  <CountChart boys={boys} girls={girls} />
                </div>
              </div>

              {/* ATTENDANCE CHART */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[450px]">
                  <AttendanceChart
                    attendances={
                      attendanceData.attendances as AttendanceListType[]
                    }
                  />
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="h-full">
                    <div className="flex justify-between items-center mb-2">
                      <h1 className="text-lg font-semibold text-gray-800">
                        Events
                      </h1>
                      <Link
                        href={ROUTE_CONFIG.EVENT_LIST}
                        className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
                      >
                        View All
                      </Link>
                    </div>
                    <div className="space-y-4">
                      {events.length > 0 ? (
                        events.map((announce) => (
                          <div
                            key={announce.id}
                            className="border-l-4 border-l-gray-300 bg-gray-50 rounded-r-lg p-2 hover:bg-gray-100 transition-colors"
                          >
                            <Event
                              title={announce.name}
                              description={announce.description || ""}
                              date={announce.startTime || new Date()}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No events available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <Calendar />
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <Announcements />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
