import FormContainer from "@/components/FormContainer";
import FormModal from "@/components/FormModal";
import TableCard from "@/components/TableCard";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { announcementColumns } from "@/data/columns";
import { dateFormat } from "@/lib/dataTimeFormat";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getSortOrder } from "@/lib/utils";
import { AnnouncementListType } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

const renderRow = async (item: AnnouncementListType) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  return (
    <TableRow key={item.id}>
      <TableCell className="w-5/12 min-w-5/12 max-w-5/12">
        {item.name}
      </TableCell>
      <TableCell className="w-2/12 min-w-2/12 max-w-2/12">
        {item?.class?.name || "-"}
      </TableCell>
      <TableCell className="w-3/12 min-w-3/12 max-w-3/12 hidden md:table-cell text-xs">
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

      <TableCell className="w-1/12 min-w-1/12 max-w-1/12 hidden lg:table-cell">
        {item?.date ? dateFormat(item.date) : "-"}
      </TableCell>
      <TableCell className="w-1/12 min-w-1/12 max-w-1/12">
        <div className="flex justify-end items-center md:gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="announcement" type="update" data={item} />
              <FormContainer table="announcement" type="delete" id={item.id} />
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

const AnnouncementListPage = async ({
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
            searchCondition,
          ].filter((condition) => Object.keys(condition).length > 0),
        };

  const [announcements, count] = await prisma.$transaction([
    prisma.announcement.findMany({
      where: whereClause,
      include: { class: true },
      orderBy: getSortOrder(queryParams.sort),
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.announcement.count({
      where: whereClause,
    }),
  ]);

  return (
    <>
      <TableCard<AnnouncementListType>
        renderRow={renderRow}
        data={announcements as AnnouncementListType[]}
        columns={announcementColumns}
        page={p}
        count={count}
        title="All Announcements"
        table="announcement"
        queryParams={queryParams}
        role={role}
      />
    </>
  );
};

export default AnnouncementListPage;
