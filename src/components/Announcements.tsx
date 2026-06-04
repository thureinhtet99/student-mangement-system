import { prisma } from "@/lib/prisma";
import Event from "./Event";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ROUTE_CONFIG } from "@/configs/appConfig";

const Announcements = async () => {
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
                    teacher: {
                      id: userId as string,
                    },
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
                      some: {
                        parent: {
                          id: userId as string,
                        },
                      },
                    },
                  },
                },
              ],
            },
          ].filter((condition) => Object.keys(condition).length > 0),
        }
      : undefined;

  const announcements = await prisma.announcement.findMany({
    where: whereClause,
    orderBy: { date: "desc" },
    take: 5,
  });

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-lg font-semibold text-gray-800">Announcements</h1>
        <Link
          href={ROUTE_CONFIG.ANNOUNCEMENT_LIST}
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          View All
        </Link>
      </div>
      <div className="space-y-4 py-2">
        {announcements.length > 0 ? (
          announcements.map((announce) => (
            <div
              key={announce.id}
              className="border-l-4 border-l-gray-300 rounded-md p-2 shadow-sm"
            >
              <Event
                title={announce.name}
                description={announce.description || ""}
                date={announce.date || new Date()}
              />
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No announcements available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
