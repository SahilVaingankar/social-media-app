import { NextResponse } from "next/server";
import { setTimeout } from "timers/promises";

type Body = {
  email?: string;
  password?: string;
};

export async function POST(req: Request) {
  try {
    const body: Body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await setTimeout(2000);
    console.log("waiting...");

    // TODO: Replace this block with real database lookup and password verification
    // Example: find user by email, verify password with bcrypt, return session/token

    // For now we accept any credentials and respond success for demonstration
    return NextResponse.json(
      { message: "Signed in (stub)", user: { email } },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
