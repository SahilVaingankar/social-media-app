import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import { prisma } from "@/lib/prisma";
import { setAuthCookies } from "@/lib/auth/cookies";
import { transporter } from "@/lib/mail";
import { signupSchema } from "@/lib/validators/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    /**
     * Validate input
     */

    const { error, value } = signupSchema.validate(body);
    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    const { username, email, password } = value;

    /**
     * Check existing user
     */
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists, please login" },
        { status: 409 }
      );
    }

    /**
     * Hash password
     */
    const passwordHash = await bcrypt.hash(password, 10);

    /**
     * Create user
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
     * AUTO LOGIN
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
     * Store device
     */
    await prisma.device.create({
      data: {
        deviceId,
        refreshToken,
        userAgent: req.headers.get("user-agent"),
        ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    /**
     * Cookies
     */
    setAuthCookies({ deviceId, accessToken });

    /**
     * Welcome email (non-blocking)
     */
    transporter
      .sendMail({
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: "Welcome to E-commerce website",
        html: `<h1>Welcome to E-commerce website. Your account has been created with email id: ${user.email}</h1>`,
      })
      .catch(console.error);

    return NextResponse.json(
      {
        success: true,
        message: "Registration and login successful",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
