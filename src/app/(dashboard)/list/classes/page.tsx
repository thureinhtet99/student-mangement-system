import { classColumns } from "@/data/columns";
import FormContainer from "@/components/FormContainer";
import { TableCell, TableRow } from "@/components/ui/table";
import TableCard from "@/components/TableCard";
import { ClassListType } from "@/types";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/routeAccess";
import React from "react";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { getSortOrder } from "@/lib/utils";
import PeopleList from "@/components/PeopleList";
import { ROUTE_CONFIG } from "@/configs/appConfig";
import Link from "next/link";
import BadgeList from "@/components/BadgeList";

const renderRow = async (item: ClassListType) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  return (
    <TableRow key={item.id}>
      <TableCell className="w-2/12 min-w-2/12 max-w-3/12 ">
        {item.name}
      </TableCell>

      <TableCell className=" w-2/12 min-w-2/12 max-w-2/12">
        <Link
          href={`${ROUTE_CONFIG.TEACHER_LIST}/${item.id}`}
          className="text-secondColor hover:underline"
        >
          {item?.teacher?.name || "-"}
        </Link>
      </TableCell>
      <TableCell className="hidden lg:table-cell  w-3/12 min-w-3/12 max-w-3/12">
        <BadgeList table={item?.subjects ?? []} text="subject" />
      </TableCell>
      <TableCell className="hidden md:table-cell w-3/12 min-w-3/12 max-w-/12 text-xs ">
        <PeopleList
          table={item?.students ?? []}
          text="student"
          route={ROUTE_CONFIG.STUDENT_LIST}
        />
      </TableCell>
      <TableCell className=" w-1/12 min-w-1/12 max-w-1/12">
        <div className="flex justify-end items-center md:gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="class" type="update" data={item} />
              <FormContainer table="class" type="delete" id={item.id} />
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

const ClassListPage = async ({
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
            teacher: {
              name: {
                contains: queryParams.search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          },
          {
            subjects: {
              some: {
                name: {
                  contains: queryParams.search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            },
          },
          {
            students: {
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
          AND: [
            {
              OR: [
                // Teacher
                {
                  teacherId: userId,
                },
              ],
            },
            searchCondition,
          ].filter((condition) => Object.keys(condition).length > 0), // Remove empty conditions
        };
  const [classes, count] = await prisma.$transaction([
    prisma.class.findMany({
      where: whereClause,
      include: {
        teacher: true,
        subjects: true,
        students: true,
        events: true,
        announcements: true,
      },
      orderBy: getSortOrder(queryParams.sort),
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.class.count({
      where: whereClause,
    }),
  ]);

  return (
    <>
      <TableCard<ClassListType>
        renderRow={renderRow}
        data={classes}
        columns={classColumns}
        page={p}
        count={count}
        title="All Classes"
        table="class"
        queryParams={queryParams}
        role={role}
      />
    </>
  );
};

export default ClassListPage;
