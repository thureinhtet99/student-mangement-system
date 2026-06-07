import { parentColumns } from "@/data/columns";
import { ParentListType } from "@/types";
import { TableCell, TableRow } from "@/components/ui/table";
import TableCard from "@/components/TableCard";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/routeAccess";
import { auth } from "@clerk/nextjs/server";
import React from "react";
import { Prisma } from "@prisma/client";
import FormContainer from "@/components/FormContainer";
import { getSortOrder } from "@/lib/utils";
import PeopleList from "@/components/PeopleList";
import { ROUTE_CONFIG } from "@/configs/appConfig";

const renderRow = async (item: ParentListType) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  return (
    <TableRow key={item.id}>
      <TableCell className="w-3/12 min-w-3/12 max-w-3/12">
        <p>{item.name}</p>
        <p className="text-xs text-muted-foreground hidden md:table-cell">
          {item?.email || "-"}
        </p>
      </TableCell>
      <TableCell className="hidden lg:table-cell w-1/12 min-w-1/12 max-w-1/12">
        {item.id.length > 6
          ? `${item.id.substring(0, 6)}${"*".repeat(4)}`
          : item.id}
      </TableCell>
      <TableCell className="w-3/12 min-w-3/12 max-w-3/12 text-xs">
        <PeopleList
          table={item?.students as ParentListType[]}
          text="student"
          route={ROUTE_CONFIG.STUDENT_LIST}
        />
      </TableCell>
      <TableCell className="hidden md:table-cell w-2/12 min-w-2/12 max-w-2/12 ">
        {item?.phone || "-"}
      </TableCell>
      <TableCell className="hidden lg:table-cell  w-2/12 min-w-2/12 max-w-2/12">
        {item?.address || "-"}
      </TableCell>
      <TableCell className="w-1/12 min-w-1/12 max-w-1/12">
        <div className="flex justify-end items-center md:gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="parent" type="update" data={item} />
              <FormContainer table="parent" type="delete" id={item.id} />
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

const ParentListPage = async ({
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
              // Teacher
              students: {
                some: {
                  class: {
                    teacherId: userId as string,
                  },
                },
              },
            },
            searchCondition,
          ].filter((condition) => Object.keys(condition).length > 0), // Remove empty conditions
        };

  const [parents, count] = await prisma.$transaction([
    prisma.parent.findMany({
      where: whereClause,
      include: { students: true },
      orderBy: getSortOrder(queryParams.sort),
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.parent.count({
      where: whereClause,
    }),
  ]);

  return (
    <>
      <TableCard<ParentListType>
        renderRow={renderRow}
        data={parents}
        columns={parentColumns}
        page={p}
        count={count}
        title="All Parents"
        table="parent"
        queryParams={queryParams}
        role={role}
      />
    </>
  );
};

export default ParentListPage;
