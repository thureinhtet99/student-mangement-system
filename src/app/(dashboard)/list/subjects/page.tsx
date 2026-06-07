import { subjectColumns } from "@/data/columns";
import { TableCell, TableRow } from "@/components/ui/table";
import TableCard from "@/components/TableCard";
import { SubjectListType } from "@/types";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/routeAccess";
import React from "react";
import { auth } from "@clerk/nextjs/server";
import FormContainer from "@/components/FormContainer";
import { getSortOrder } from "@/lib/utils";
import { ROUTE_CONFIG } from "@/configs/appConfig";
import { Prisma } from "@prisma/client";
import BadgeList from "@/components/BadgeList";
import PeopleList from "@/components/PeopleList";

const renderRow = async (item: SubjectListType) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  return (
    <TableRow key={item.id}>
      <TableCell className="w-2/12 min-w-2/12 max-w-2/12">
        {item.name}
      </TableCell>
      <TableCell className="hidden md:table-cell text-xs w-2/12 min-w-2/12 max-w-2/12">
        <PeopleList
          table={item?.teachers ?? []}
          text="teacher"
          route={ROUTE_CONFIG.TEACHER_LIST}
        />
      </TableCell>

      <TableCell className="hidden lg:table-cell w-1/12 min-w-1/12 max-w-1/12">
        {item?.class?.name || "-"}
      </TableCell>

      <TableCell className="w-3/12 min-w-3/12 max-w-3/12">
        <BadgeList table={item?.lessons ?? []} />
      </TableCell>

      <TableCell className="hidden lg:table-cell text-xs w-3/12 min-w-3/12 max-w-3/12">
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
      <TableCell className="w-1/12 min-w-1/12 max-w-1/12">
        <div className="flex justify-end items-center md:gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="subject" type="update" data={item} />
              <FormContainer table="subject" type="delete" id={item.id} />
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

const SubjectListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const resolvedSearchParams = await searchParams;
  const { page, ...queryParams } = resolvedSearchParams;
  const p = page ? parseInt(page) : 1;

  const { sessionClaims } = await auth();
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
            teachers: {
              some: {
                name: {
                  contains: queryParams.search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            },
          },
          {
            lessons: {
              some: {
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
          AND: [searchCondition].filter(
            (condition) => Object.keys(condition).length > 0,
          ),
        };

  const [subjects, count] = await prisma.$transaction([
    prisma.subject.findMany({
      where: whereClause,
      include: { teachers: true, lessons: true, class: true },
      orderBy: getSortOrder(queryParams.sort),
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.subject.count({
      where: whereClause,
    }),
  ]);

  return (
    <>
      <TableCard<SubjectListType>
        renderRow={renderRow}
        data={subjects}
        columns={subjectColumns}
        page={p}
        count={count}
        title="All Subjects"
        table="subject"
        queryParams={queryParams}
        role={role}
      />
    </>
  );
};

export default SubjectListPage;
