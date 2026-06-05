import { getSubjectById } from "@/lib/actions";
import { NextResponse } from "next/server";

// Get subjects
export async function GET(request: Request, { id }: { id: string }) {
  try {
    // const id = parseInt(id, 10);
    const { subject } = await getSubjectById(id);
    return NextResponse.json(
      { subject, success: "Fetched subject successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch subject" },
      { status: 500 },
    );
  }
}
