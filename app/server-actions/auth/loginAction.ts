"use server";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { UAParser } from "ua-parser-js";

import { loginSchema } from "@/lib/validators/auth";
import { setAuthCookies } from "@/lib/auth/cookies";
import { prisma } from "@/lib/prisma";
import { transporter } from "@/lib/mail";
import { LOGIN_ALERT_TEMPLATE } from "@/email/templates/login-alart";
import { cookies, headers } from "next/headers";

export async function loginAction(body: unknown) {
  /**
   * 1️⃣ Validate input (client error)
   */
  const result = loginSchema.safeParse(body);

  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0].message,
    };
  }

  const { email, password } = result.data;

  try {
    /**
     * 2️⃣ Fetch user
     */
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }

    /**
     * 3️⃣ Verify password
     */
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }

    /**
     * 4️⃣ Tokens
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

    /**
     * 5️⃣ Device tracking
     */
    const deviceId = uuidv4();
    const hdrs = await headers();

    await prisma.device.create({
      data: {
        deviceId,
        refreshToken,
        userAgent: hdrs.get("user-agent") ?? "Unknown device",
        ipAddress: hdrs.get("x-forwarded-for") ?? "unknown",
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    /**
     * 6️⃣ Cookies (server-only)
     */
    const cookieStore = await cookies();
    setAuthCookies(cookieStore, { deviceId, accessToken });

    /**
     * 7️⃣ Login alert email (non-blocking)
     */
    const userAgent = hdrs.get("user-agent") ?? "Unknown device";

    const parser = new UAParser(userAgent);
    const ua = parser.getResult();

    const deviceLabel = `${ua.browser.name ?? "Browser"} · ${
      ua.os.name ?? "OS"
    }`;

    transporter
      .sendMail({
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: "New Login Detected",
        html: LOGIN_ALERT_TEMPLATE.replace("{{device}}", deviceLabel),
      })
      .catch(console.error);

    return {
      success: true,
      message: "Login successful",
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      message: "Internal server error",
    };
  }
}
