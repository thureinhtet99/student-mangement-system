import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClasses } from "@/lib/actions";

// Get classes
export async function GET() {
  try {
    const classes = await getClasses();
    return NextResponse.json(
      { classes, success: "Fetched classes successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 },
    );
  }
}

// Create class
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    // Validation
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const existingClass = await prisma.class.findUnique({
      where: { name },
    });

    if (existingClass) {
      return NextResponse.json(
        { error: "Class with this name already exists" },
        { status: 409 },
      );
    }

    // Create class
    const createClass = await prisma.class.create({
      data: {
        name,
      },
    });

    return NextResponse.json({ createClass }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create class" },
      { status: 500 },
    );
  }
}
