import { assignmentColumns } from "@/data/columns";
import { AssignmentListType } from "@/types";
import TableCard from "@/components/TableCard";
import { TableCell, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/routeAccess";
import { auth } from "@clerk/nextjs/server";
import { dateTimeFormat } from "@/lib/dataTimeFormat";
import { Prisma } from "@prisma/client";
import FormContainer from "@/components/FormContainer";
import { getSortOrder } from "@/lib/utils";

const renderRow = async (item: AssignmentListType) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  return (
    <TableRow key={item.id}>
      <TableCell className="w-5/12 min-w-5/12 max-w-5/12">
        {item.name}
      </TableCell>
      <TableCell className="w-3/12 min-w-3/12 max-w-3/12 hidden md:table-cell">
        {item?.subject?.name || "-"}
      </TableCell>
      <TableCell className="w-3/12 min-w-3/12 max-w-3/12">
        {item.dueDate ? dateTimeFormat(item.dueDate) : "-"}
      </TableCell>
      <TableCell className="w-1/12 min-w-2/12 max-w-1/12">
        <div className="flex justify-end items-center md:gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="assignment" type="update" data={item} />
              <FormContainer table="assignment" type="delete" id={item.id} />
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

const AssignmentListPage = async ({
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

  const [assignments, count] = await prisma.$transaction([
    prisma.assignment.findMany({
      where: whereClause,
      include: {
        subject: true,
        results: true,
      },
      orderBy: getSortOrder(queryParams.sort),
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.assignment.count({
      where: whereClause,
    }),
  ]);

  return (
    <>
      <TableCard<AssignmentListType>
        renderRow={renderRow}
        data={assignments as AssignmentListType[]}
        columns={assignmentColumns}
        page={p}
        count={count}
        title="All Assignments"
        table="assignment"
        queryParams={queryParams}
        role={role}
      />
    </>
  );
};

export default AssignmentListPage;
