import { getStudents } from "@/lib/actions";
import { NextResponse } from "next/server";

// Get students
export async function GET() {
  try {
    const { students } = await getStudents();
    return NextResponse.json(
      { students, success: "Fetched students successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 },
    );
  }
}
