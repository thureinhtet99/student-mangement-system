import { eventColumns } from "@/data/columns";
import { EventListType } from "@/types";
import TableCard from "@/components/TableCard";
import { TableCell, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { dateTimeFormat } from "@/lib/dataTimeFormat";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import FormContainer from "@/components/FormContainer";
import { getSortOrder } from "@/lib/utils";

const renderRow = async (item: EventListType) => {
  const { sessionClaims } = await auth();

  const role = (sessionClaims?.metadata as { role?: string })?.role;

  return (
    <TableRow key={item.id}>
      <TableCell className="w-3/12 min-w-3/12 max-w-3/12">
        {item.name}
      </TableCell>
      <TableCell className="hidden md:table-cell w-1/12 min-w-1/12 max-w-1/12">
        {item.class?.name || "-"}
      </TableCell>
      <TableCell className="hidden md:table-cell w-3/12 min-w-3/12 max-w-3/12 text-xs">
        {item?.description ? (
          <span>
            {item?.description?.length > 50
              ? `${item?.description?.substring(0, 50)}.....`
              : item?.description}
          </span>
        ) : (
          <span>-</span>
        )}
      </TableCell>
      <TableCell className="w-2/12 min-w-2/12 max-w-2/12">
        {item?.startTime ? dateTimeFormat(item?.startTime) : "-"}
      </TableCell>
      <TableCell className="hidden lg:table-cell w-2/12 min-w-2/12 max-w-2/12">
        {item?.endTime ? dateTimeFormat(item?.endTime) : "-"}
      </TableCell>
      <TableCell className="w-1/12 min-w-1/12 max-w-1/12">
        <div className="flex justify-end items-center md:gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="event" type="update" data={item} />
              <FormContainer table="event" type="delete" id={item.id} />
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

const ResultListPage = async ({
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
            class: {
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
            searchCondition,
          ].filter((condition) => Object.keys(condition).length > 0),
        };

  const [events, count] = await prisma.$transaction([
    prisma.event.findMany({
      where: whereClause,
      include: { class: true },
      orderBy: getSortOrder(queryParams.sort),
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.event.count({
      where: whereClause,
    }),
  ]);

  return (
    <>
      <TableCard<EventListType>
        renderRow={renderRow}
        data={events}
        columns={eventColumns}
        page={p}
        count={count}
        title="All Events"
        table="event"
        queryParams={queryParams}
        role={role}
      />
    </>
  );
};

export default ResultListPage;
