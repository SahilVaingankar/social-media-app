import { NextResponse } from "next/server";

type Body = {
  name?: string;
  email?: string;
  password?: string;
};

export async function POST(req: Request) {
  try {
    const body: Body = await req.json();
    const { name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // TODO: Replace this block with real database logic (Prisma)
    // Example: check if user exists, hash password, create user
    // For now we simulate success but do not persist data

    return NextResponse.json(
      { message: "User created (stub)", user: { name: name ?? null, email } },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
