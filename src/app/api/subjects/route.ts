import { getSubjects } from "@/lib/actions";
import { NextResponse } from "next/server";

// Get subjects
export async function GET() {
  try {
    const { subjects } = await getSubjects();
    return NextResponse.json(
      { subjects, success: "Fetched subjects successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 },
    );
  }
}
