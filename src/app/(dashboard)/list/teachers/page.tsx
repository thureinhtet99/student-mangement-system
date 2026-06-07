import FormContainer from "@/components/FormContainer";
import { TeacherListType } from "@/types";
import Link from "next/link";
import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { teacherColumns } from "@/data/columns";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/routeAccess";
import React from "react";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { ROUTE_CONFIG } from "@/configs/appConfig";
import TableCard from "@/components/TableCard";
import { getSortOrder } from "@/lib/utils";
import BadgeList from "@/components/BadgeList";
import EyeButton from "@/components/EyeButton";

const renderRow = async (item: TeacherListType) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  return (
    <TableRow key={item.id}>
      <TableCell className="py-0 w-3/12 min-w-3/12 max-w-3/12">
        <div className="flex items-center gap-x-3">
          <Avatar>
            <AvatarImage
              src={item?.image || undefined}
              alt={item.name}
              className="object-cover"
            />
            <AvatarFallback className="capitalize">
              {item.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <Link
              href={`${ROUTE_CONFIG.TEACHER_LIST}/${item.id}`}
              className="md:hidden font-medium hover:underline"
            >
              {item.name}
            </Link>
            <p className="hidden md:block">{item.name}</p>
            <p className="text-xs text-muted-foreground hidden md:table-cell">
              {item?.email || "-"}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className=" w-1/12 min-w-1/12 max-w-1/12">
        {item.id.length > 6
          ? `${item.id.substring(0, 6)}${"*".repeat(4)}`
          : item.id}
      </TableCell>
      <TableCell className="hidden md:table-cell w-3/12 min-w-3/12 max-w-3/12">
        <BadgeList table={item?.subjects ? item?.subjects : []} />
      </TableCell>
      <TableCell className="hidden md:table-cell w-2/12 min-w-2/12 max-w-2/12">
        <BadgeList table={item?.classes ? item?.classes : []} />
      </TableCell>
      <TableCell className="hidden lg:table-cell w-2/12 min-w-2/12 max-w-2/12">
        {item?.phone || "-"}
      </TableCell>
      <TableCell className="w-1/12 min-w-1/12 max-w-1/12">
        <div className="flex justify-end items-center md:gap-2">
          <EyeButton href={`${ROUTE_CONFIG.TEACHER_LIST}/${item.id}`} />
          {role === "admin" && (
            <>
              <FormContainer table="teacher" type="update" data={item} />
              <FormContainer table="teacher" type="delete" id={item.id} />
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

const TeacherListPage = async ({
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
            id: {
              contains: queryParams.search,
              mode: Prisma.QueryMode.insensitive,
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
            classes: {
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
              id: userId as string,
            },
            searchCondition,
          ].filter((condition) => Object.keys(condition).length > 0), // Remove empty conditions
        };

  const [teachers, count] = await prisma.$transaction([
    prisma.teacher.findMany({
      where: whereClause,
      include: { subjects: true, classes: true },
      orderBy: getSortOrder(queryParams.sort),
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.teacher.count({
      where: whereClause,
    }),
  ]);

  return (
    <>
      <TableCard<TeacherListType>
        renderRow={renderRow}
        data={teachers}
        columns={teacherColumns}
        page={p}
        count={count}
        title="All Teachers"
        table="teacher"
        queryParams={queryParams}
        role={role}
      />
    </>
  );
};

export default TeacherListPage;
