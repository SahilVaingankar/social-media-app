"use server";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import { prisma } from "@/lib/prisma";
import { setAuthCookies } from "@/lib/auth/cookies";
import { transporter } from "@/lib/mail";
import { signupSchema } from "@/lib/validators/auth";
import { WELCOME_TEMPLATE } from "@/email/templates/welcome";
import { cookies, headers } from "next/headers";

export async function signupAction(body: unknown) {
  /**
   * 1️⃣ Validate input
   */
  const result = signupSchema.safeParse(body);

  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0].message,
    };
  }

  const { username, email, password } = result.data;

  try {
    /**
     * 2️⃣ Check existing user
     */
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return {
        success: false,
        message: "User already exists, please login",
      };
    }

    /**
     * 3️⃣ Hash password
     */
    const passwordHash = await bcrypt.hash(password, 10);

    /**
     * 4️⃣ Create user
     */
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

    /**
     * 5️⃣ AUTO LOGIN
     */
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_TOKEN_SECRET!,
      { expiresIn: "7d" }
    );

    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_ACCESS_TOKEN_SECRET!,
      { expiresIn: "15m" }
    );

    const deviceId = uuidv4();

    /**
     * 6️⃣ Store device
     */
    const hdrs = await headers(); // ✅ fixed for Server Action

    await prisma.device.create({
      data: {
        deviceId,
        refreshToken,
        userAgent: hdrs.get("user-agent") ?? "Unknown device", // ✅ use .get, no ()
        ipAddress: hdrs.get("x-forwarded-for") ?? "unknown", // ✅ same
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    /**
     * 7️⃣ Cookies
     */
    const cookieStore = await cookies();
    setAuthCookies(cookieStore, { deviceId, accessToken });

    /**
     * 8️⃣ Welcome email (non-blocking)
     */
    transporter
      .sendMail({
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: "Welcome to social-media-application",
        html: WELCOME_TEMPLATE.replace("{{email}}", user.email),
      })
      .catch(console.error);

    return {
      success: true,
      message: "Registration and login successful",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Internal server error",
    };
  }
}
