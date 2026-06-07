import { lessonColumns } from "@/data/columns";
import { LessonListType } from "@/types";
import { TableCell, TableRow } from "@/components/ui/table";
import TableCard from "@/components/TableCard";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/routeAccess";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import FormContainer from "@/components/FormContainer";
import { getSortOrder } from "@/lib/utils";

const renderRow = async (item: LessonListType) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  return (
    <TableRow key={item.id}>
      <TableCell className="w-4/12 min-w-4/12 max-w-4/12">
        {item.name}
      </TableCell>
      <TableCell className="w-7/12 min-w-7/12 max-w-7/12">
        {item?.subject?.name || "-"}
      </TableCell>
      <TableCell className="w-1/12 min-w-1/12 max-w-1/12">
        <div className="flex justify-end items-center md:gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="lesson" type="update" data={item} />
              <FormContainer table="lesson" type="delete" id={item.id} />
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

const LessonListPage = async ({
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
              // Teacher
              subject: {
                class: {
                  teacherId: userId as string,
                },
              },
            },
            searchCondition,
          ].filter((condition) => Object.keys(condition).length > 0), // Remove empty conditions
        };

  const [lessons, count] = await prisma.$transaction([
    prisma.lesson.findMany({
      where: whereClause,
      include: { subject: true },
      orderBy: getSortOrder(queryParams.sort),
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.lesson.count({
      where: whereClause,
    }),
  ]);

  return (
    <>
      <TableCard<LessonListType>
        renderRow={renderRow}
        data={lessons}
        columns={lessonColumns}
        page={p}
        count={count}
        title="All Lessons"
        table="lesson"
        queryParams={queryParams}
        role={role}
      />
    </>
  );
};

export default LessonListPage;
