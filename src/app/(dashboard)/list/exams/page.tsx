import { examColumns } from "@/data/columns";
import { ExamListType } from "@/types";
import TableCard from "@/components/TableCard";
import { TableCell, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/routeAccess";
import { dateFormat, timeFormat } from "@/lib/dataTimeFormat";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import FormContainer from "@/components/FormContainer";
import { getSortOrder } from "@/lib/utils";

const renderRow = async (item: ExamListType) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  return (
    <TableRow key={item.id}>
      <TableCell className="w-2/12 min-w-2/12 max-w-2/12">
        {item.name}
      </TableCell>
      <TableCell className="hidden md:table-cell w-2/12 min-w-2/12 max-w-2/12">
        {item?.subject?.name || "-"}
      </TableCell>
      <TableCell className="hidden lg:table-cell w-2/12 min-w-2/12 max-w-2/12">
        {item?.subject?.class?.name || "-"}
      </TableCell>
      <TableCell className="hidden lg:table-cell text-xs w-2/12 min-w-2/12 max-w-2/12">
        {item?.description ? (
          <span>
            {item?.description?.length > 50
              ? `${item?.description?.substring(0, 50)}.....`
              : item?.description}
          </span>
        ) : (
          "-"
        )}
      </TableCell>
      <TableCell className="w-1/12 min-w-1/12 max-w-1/12">
        {dateFormat(item.startTime)}
      </TableCell>
      <TableCell className="hidden md:table-cell w-2/12 min-w-2/12 max-w-2/12">
        {timeFormat(item.startTime)}-{timeFormat(item.endTime)}
      </TableCell>
      <TableCell className="w-1/12 min-w-1/12 max-w-1/12">
        <div className="flex justify-end items-center md:gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="exam" type="update" data={item} />
              <FormContainer table="exam" type="delete" id={item.id} />
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

const ExamListPage = async ({
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
            name: {
              contains: queryParams.search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            subject: {
              name: {
                contains: queryParams.search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          },
          {
            subject: {
              class: {
                name: {
                  contains: queryParams.search,
                  mode: Prisma.QueryMode.insensitive,
                },
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
                  subject: {
                    class: {
                      teacher: {
                        id: userId as string,
                      },
                    },
                  },
                },
                // Student
                {
                  subject: {
                    class: {
                      students: {
                        some: {
                          id: userId as string,
                        },
                      },
                    },
                  },
                },
                // Parent
                {
                  subject: {
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
                },
              ],
            },
            searchCondition, // Apply search filter if provided
          ].filter((condition) => Object.keys(condition).length > 0), // Remove empty conditions
        };

  const [exams, count] = await prisma.$transaction([
    prisma.exam.findMany({
      where: whereClause,
      include: {
        subject: {
          include: {
            class: true,
          },
        },
      },
      orderBy: getSortOrder(queryParams.sort),
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.exam.count({
      where: whereClause,
    }),
  ]);

  return (
    <>
      <TableCard<ExamListType>
        renderRow={renderRow}
        data={exams as ExamListType[]}
        columns={examColumns}
        page={p}
        count={count}
        title="All Exams"
        table="exam"
        queryParams={queryParams}
        role={role}
      />
    </>
  );
};

export default ExamListPage;
