import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTeachers } from "@/lib/actions";

// Get teachers
export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      orderBy: { name: "asc" },
      // select: {
      //   id: true,
      //   name: true,
      // },
    });
    return NextResponse.json(
      { teachers, success: true, message: "Fetched teachers successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch teachers" },
      { status: 500 },
    );
  }
}

// Create teacher
// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { name, email, subject, phoneNumber } = body;

//     // Validation
//     if (!name || !email || !subject) {
//       return NextResponse.json(
//         { error: "Name, email and subject are required" },
//         { status: 400 }
//       );
//     }

//     // Check if email already exists
//     const existingTeacher = await prisma.teacher.findUnique({
//       where: { email },
//     });

//     if (existingTeacher) {
//       return NextResponse.json(
//         { error: "Teacher with this email already exists" },
//         { status: 409 }
//       );
//     }

//     // Create teacher
//     const teacher = await prisma.teacher.create({
//       data: {
//         name,
//         email,
//         subject,
//         phoneNumber,
//       },
//     });

//     return NextResponse.json({ teacher }, { status: 201 });
//   } catch (error) {
//     console.error("Failed to create teacher:", error);
//     return NextResponse.json(
//       { error: "Failed to create teacher" },
//       { status: 500 }
//     );
//   }
// }
