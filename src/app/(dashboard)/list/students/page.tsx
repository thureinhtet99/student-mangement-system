import Link from "next/link";
import { studentColumns } from "@/data/columns";
import { Eye, Mars, Venus } from "lucide-react";
import { StudentListType } from "@/types";
import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TableCard from "@/components/TableCard";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { dateFormat } from "@/lib/dataTimeFormat";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import FormContainer from "@/components/FormContainer";
import { ROUTE_CONFIG } from "@/configs/appConfig";
import { getSortOrder } from "@/lib/utils";
import EyeButton from "@/components/EyeButton";

const renderRow = async (item: StudentListType) => {
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
              href={`${ROUTE_CONFIG.STUDENT_LIST}/${item.id}`}
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
      <TableCell className="w-2/12 min-w-2/12 max-w-2/12">
        {item.id.length > 6
          ? `${item.id.substring(0, 6)}${"*".repeat(4)}`
          : item.id}
      </TableCell>
      <TableCell className="hidden lg:table-cell justify-center lowercase w-1/12 min-w-1/12 max-w-1/12">
        {item?.gender === "MALE" ? <Mars size={18} /> : <Venus size={18} />}
      </TableCell>
      <TableCell className="hidden md:table-cell w-2/12 min-w-2/12 max-w-2/12">
        {item?.class?.name || "-"}
      </TableCell>
      <TableCell className="hidden md:table-cell w-1/12 min-w-1/12 max-w-1/12">
        {item?.grade?.level || "-"}
      </TableCell>
      <TableCell className="hidden lg:table-cell w-1/12 min-w-1/12 max-w-1/12">
        {item?.birthday ? dateFormat(item?.birthday) : "-"}
      </TableCell>
      <TableCell className="hidden lg:table-cell w-1/12 min-w-1/12 max-w-1/12">
        {item?.phone || "-"}
      </TableCell>
      <TableCell className="w-1/12 min-w-1/12 max-w-1/12">
        <div className="flex justify-end items-center">
          <EyeButton href={`${ROUTE_CONFIG.STUDENT_LIST}/${item.id}`} />
          {role === "admin" && (
            <>
              <FormContainer table="student" type="update" data={item} />
              <FormContainer table="student" type="delete" id={item.id} />
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

const StudentListPage = async ({
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
              class: {
                teacherId: userId, // Teacher can only see their students
              },
            },
            searchCondition, // Apply search filter if provided
          ].filter((condition) => Object.keys(condition).length > 0), // Remove empty conditions
        };

  const [students, count] = await prisma.$transaction([
    prisma.student.findMany({
      where: whereClause,
      include: { class: true, grade: true },
      orderBy: getSortOrder(queryParams.sort),
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.student.count({
      where: whereClause,
    }),
  ]);

  return (
    <>
      <TableCard<StudentListType>
        renderRow={renderRow}
        data={students}
        columns={studentColumns}
        page={p}
        count={count}
        title="All Students"
        table="student"
        queryParams={queryParams}
        role={role}
      />
    </>
  );
};

export default StudentListPage;
