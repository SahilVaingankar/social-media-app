// app/api/check-username/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { username } = await req.json();

  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { username },
  });

  return NextResponse.json({
    available: !user,
  });
}
