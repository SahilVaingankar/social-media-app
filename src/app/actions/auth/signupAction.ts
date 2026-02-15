"use server";

import { signIn } from "@/auth"; // ← NextAuth App Router helper
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/prisma";
import { cookies, headers } from "next/headers";
import { signupSchema } from "@/lib/validators/auth";
import { transporter } from "@/lib/mail";
import { WELCOME_TEMPLATE } from "@/email/templates/welcome";
// import { WELCOME_TEMPLATE } from "@/templates/welcome";
// import { WELCOME_TEMPLATE } from "@/email/templates/welcome";

export async function signupAction(body: unknown) {
  // 1️⃣ Validate input
  const result = signupSchema.safeParse(body);

  if (!result.success) {
    return { success: false, message: result.error.issues[0].message };
  }

  const { username, email, password, name, bio } = result.data;

  try {
    // 2️⃣ Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return { success: false, message: "User already exists, please login" };
    }

    // 3️⃣ Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 4️⃣ Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
      },
    });

    // 🔐 Auto-login (creates session)
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    // 8️⃣ Welcome email (non-blocking)
    transporter
      .sendMail({
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: "Welcome to social-media-application",
        html: WELCOME_TEMPLATE.replace("{{email}}", user.email),
      })
      .catch(console.error);

    return { success: true, message: "Registration and login successful" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Internal server error" };
  }
}
