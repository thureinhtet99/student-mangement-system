import { assignmentResultColumns, examResultColumns } from "@/data/columns";
import { ResultListType } from "@/types";
import { TableCell, TableRow } from "@/components/ui/table";
import TableCard from "@/components/TableCard";
import ResultTabs from "@/components/ResultTabs";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { dateFormat } from "@/lib/dataTimeFormat";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import FormContainer from "@/components/FormContainer";
import { resultSortOrder } from "@/lib/utils";

const renderRow = async (item: ResultListType) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // Determine the display name based on type
  const displayName = item.exam?.name || item.assignment?.name;

  return (
    <TableRow key={item.id}>
      <TableCell className="w-2/12 min-w-2/12 max-w-2/12">
        {item?.student?.name}
      </TableCell>
      <TableCell className="w-2/12 min-w-2/12 max-w-2/12">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.score >= 80
              ? "bg-green-100 text-green-800"
              : item.score >= 40
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          {item.score} / 100
        </span>
      </TableCell>
      <TableCell className="w-2/12 min-w-2/12 max-w-2/12 hidden md:table-cell">
        {displayName}
      </TableCell>
      <TableCell className="w-3/12 min-w-3/12 max-w-3/12 hidden lg:table-cell">
        {item?.comment ? (
          <span>
            {item?.comment?.length > 50
              ? `${item?.comment?.substring(0, 50)}.....`
              : item?.comment}
          </span>
        ) : (
          "-"
        )}
      </TableCell>
      <TableCell className="w-1/12 min-w-1/12 max-w-1/12 hidden md:table-cell">
        {item.createdAt ? dateFormat(item.createdAt) : "-"}
      </TableCell>
      <TableCell className="w-1/12 min-w-1/12 max-w-1/12">
        <div className="flex justify-end items-center md:gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="result" type="update" data={item} />
              <FormContainer table="result" type="delete" id={item.id} />
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
  const { page, tab, ...queryParams } = resolvedSearchParams;
  const p = page ? parseInt(page) : 1;
  const activeTab = tab || "exams";

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // Base role-based filter
  const baseRoleFilter =
    role === "admin"
      ? {}
      : {
          OR: [
            // Teacher - can see results for their class students
            {
              student: {
                class: {
                  teacher: {
                    id: userId as string,
                  },
                },
              },
            },
            // Student - can see their own results
            {
              student: {
                id: userId as string,
              },
            },
            // Parent - can see their children's results
            {
              student: {
                parent: {
                  id: userId as string,
                },
              },
            },
          ],
        };

  // Search conditions for exams
  const examSearchCondition = queryParams.search
    ? {
        OR: [
          {
            student: {
              name: {
                contains: queryParams.search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          },
          {
            exam: {
              name: {
                contains: queryParams.search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          },
        ],
      }
    : {};

  // Search conditions for assignments
  const assignmentSearchCondition = queryParams.search
    ? {
        OR: [
          {
            student: {
              name: {
                contains: queryParams.search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          },
          {
            assignment: {
              name: {
                contains: queryParams.search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          },
        ],
      }
    : {};

  // Build where clauses for each type
  const examWhereClause = {
    exam: { isNot: null }, // Only results with exams
    ...(Object.keys(baseRoleFilter).length > 0 && baseRoleFilter),
    ...(Object.keys(examSearchCondition).length > 0 &&
      activeTab === "exams" &&
      examSearchCondition),
  };

  const assignmentWhereClause = {
    assignment: { isNot: null }, // Only results with assignments
    ...(Object.keys(baseRoleFilter).length > 0 && baseRoleFilter),
    ...(Object.keys(assignmentSearchCondition).length > 0 &&
      activeTab === "assignments" &&
      assignmentSearchCondition),
  };

  // Base counts without search filters for tabs
  const examCountWhereClause = {
    exam: { isNot: null },
    ...(Object.keys(baseRoleFilter).length > 0 && baseRoleFilter),
  };

  const assignmentCountWhereClause = {
    assignment: { isNot: null },
    ...(Object.keys(baseRoleFilter).length > 0 && baseRoleFilter),
  };

  // Determine which data to fetch based on active tab
  const isExamTab = activeTab === "exams";
  const whereClause = isExamTab ? examWhereClause : assignmentWhereClause;

  const [results, examCount, assignmentCount] = await prisma.$transaction([
    prisma.result.findMany({
      where: whereClause,
      include: {
        student: true,
        exam: true,
        assignment: true,
      },
      orderBy: resultSortOrder(queryParams.sort),
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    // Count exam results
    prisma.result.count({
      where: examCountWhereClause,
    }),
    // Count assignment results
    prisma.result.count({
      where: assignmentCountWhereClause,
    }),
  ]);

  // Process results with proper type mapping
  const processedResults: ResultListType[] = results.map((item) => ({
    ...item,
    type: item.exam ? "exam" : "assignment",
  })) as ResultListType[];

  // Filter results based on active tab
  const filteredResults = processedResults.filter(
    (item) => item.type === (isExamTab ? "exam" : "assignment"),
  );

  const currentCount = isExamTab ? examCount : assignmentCount;

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <ResultTabs
        examCount={examCount}
        assignmentCount={assignmentCount}
        defaultValue="exams"
        examContent={
          activeTab === "exams" ? (
            <TableCard<ResultListType>
              renderRow={renderRow}
              data={filteredResults}
              columns={examResultColumns}
              page={p}
              count={currentCount}
              title="Exam Results"
              table="result"
              queryParams={{ ...queryParams, tab: "exams" }}
              role={role}
            />
          ) : null
        }
        assignmentContent={
          activeTab === "assignments" ? (
            <TableCard<ResultListType>
              renderRow={renderRow}
              data={filteredResults}
              columns={assignmentResultColumns}
              page={p}
              count={currentCount}
              title="Assignment Results"
              table="result"
              queryParams={{ ...queryParams, tab: "assignments" }}
              role={role}
            />
          ) : null
        }
      />
    </div>
  );
};

export default ResultListPage;
