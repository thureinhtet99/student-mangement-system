import { NextRequest, NextResponse } from "next/server";
import { getTeacherPerformance } from "@/lib/actions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { performance, success, error } = await getTeacherPerformance(id);

    if (!success) {
      return NextResponse.json({ error }, { status: 404 });
    }

    return NextResponse.json({ performance, success: true });
  } catch (error) {
    console.error("Error fetching teacher performance:", error);
    return NextResponse.json(
      { error: "Failed to fetch teacher performance" },
      { status: 500 },
    );
  }
}
