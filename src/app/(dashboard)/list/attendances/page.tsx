import { attendanceColumns } from "@/data/columns";
import { AttendanceListType } from "@/types";
import TableCard from "@/components/TableCard";
import { TableCell, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/routeAccess";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { resultSortOrder } from "@/lib/utils";
import { dateFormat } from "@/lib/dataTimeFormat";
import FormContainer from "@/components/FormContainer";
import { Badge } from "@/components/ui/badge";

const renderRow = async (item: AttendanceListType) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  return (
    <TableRow key={item.id}>
      <TableCell className="w-3/12 min-w-3/12 max-w-3/12">
        {item?.student?.name}
      </TableCell>
      <TableCell className="w-3/12 min-w-3/12 max-w-3/12">
        {item?.student?.class?.name}
      </TableCell>
      <TableCell className="w-3/12 min-w-3/12 max-w-3/12">
        <Badge
          variant="default"
          className={`${
            item.present === true
              ? "bg-green-500 hover:bg-green-400"
              : "bg-red-500 hover:bg-red-400"
          }
            transition-colors duration-200 text-xs font-medium`}
        >
          {item.present === true ? "present" : "absent"}
        </Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell w-2/12 min-w-2/12 max-w-2/12">
        {dateFormat(item.date)}
      </TableCell>
      <TableCell className="w-1/12 min-w-1/12 max-w-1/12">
        <div className="flex justify-end items-center md:gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="attendance" type="update" data={item} />
              <FormContainer table="attendance" type="delete" id={item.id} />
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

const AttendanceListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const resolvedSearchParams = await searchParams;
  const { page, ...queryParams } = resolvedSearchParams;
  const p = page ? parseInt(page) : 1;

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const searchCondition = queryParams.search
    ? {
        OR: [
          {
            student: {
              name: {
                contains: queryParams.search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          },
        ],
      }
    : {};

  const whereClause =
    role === "admin"
      ? searchCondition
      : {
          AND: [
            {
              OR: [
                // Teacher
                {
                  student: {
                    class: {
                      teacher: {
                        id: userId as string,
                      },
                    },
                  },
                },
                // Student
                {
                  student: {
                    id: userId as string,
                  },
                },
                // Parent
                {
                  student: {
                    parent: {
                      id: userId as string,
                    },
                  },
                },
              ],
            },
            searchCondition, // Apply search filter if provided
          ].filter((condition) => Object.keys(condition).length > 0), // Remove empty conditions
        };

  const [attendances, count] = await prisma.$transaction([
    prisma.attendance.findMany({
      where: whereClause,
      include: {
        student: {
          include: {
            class: true,
          },
        },
      },
      orderBy: resultSortOrder(queryParams.sort),
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.attendance.count({
      where: whereClause,
    }),
  ]);

  return (
    <>
      <TableCard<AttendanceListType>
        renderRow={renderRow}
        data={attendances as AttendanceListType[]}
        columns={attendanceColumns}
        page={p}
        count={count}
        title="All Attendances"
        table="attendance"
        queryParams={queryParams}
        role={role}
      />
    </>
  );
};

export default AttendanceListPage;
