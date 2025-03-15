import { NextRequest, NextResponse } from "next/server";
import {
  supabaseAdmin,
  getStudents,
  getStudentById,
} from "@/app/lib/db/supabase";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (id) {
      // Get a specific student by ID
      const { data, error } = await getStudentById(id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!data) {
        return NextResponse.json(
          { error: "Student not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ data });
    } else {
      // Get all students
      const { data, error } = await getStudents();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data });
    }
  } catch (error) {
    console.error("Error in students API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.user_id || !body.email || !body.first_name || !body.last_name) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: user_id, email, first_name, and last_name are required",
        },
        { status: 400 }
      );
    }

    // Insert new student
    const { data, error } = await supabaseAdmin
      .from("students")
      .insert({
        id: body.id || uuidv4(),
        user_id: body.user_id,
        email: body.email,
        first_name: body.first_name,
        last_name: body.last_name,
        role: body.role,
        team_id: body.team_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Error in students API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Update student
    const { data, error } = await supabaseAdmin
      .from("students")
      .update({
        user_id: body.user_id,
        email: body.email,
        first_name: body.first_name,
        last_name: body.last_name,
        role: body.role,
        team_id: body.team_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error in students API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // Delete student
    const { error } = await supabaseAdmin
      .from("students")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in students API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
