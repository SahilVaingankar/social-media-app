import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import { loginSchema } from "@/lib/validators/auth";
import { setAuthCookies } from "@/lib/auth/cookies";
import { prisma } from "@/lib/prisma";
import { transporter } from "@/lib/mail";
import { LOGIN_ALERT_TEMPLATE } from "@/email/templates/login-alart";
import { UAParser } from "ua-parser-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { error, value } = loginSchema.validate(body);
    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    const { email, password } = value;

    /**
     * Fetch user
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
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    /**
     * Verify password
     */
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    /**
     * Tokens
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
     * Device tracking
     */
    const deviceId = uuidv4();

    await prisma.device.create({
      data: {
        deviceId,
        refreshToken,
        userAgent: req.headers.get("user-agent"),
        ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    /**
     * Cookies
     */
    setAuthCookies({ deviceId, accessToken });

    /**
     * Email notification (non-blocking)
     */

    const userAgent = req.headers.get("user-agent") ?? "Unknown device";

    // Parse device name
    const parser = new UAParser(userAgent);
    const ua = parser.getResult();

    const deviceLabel = `${ua.browser.name ?? "Browser"} · ${
      ua.os.name ?? "OS"
    }`;

    // Geo-IP lookup (for testing)
    async function getLocationFromIp(ip: string | null) {
      if (!ip) return "Unknown location";

      try {
        const res = await fetch(`https://ipapi.co/${ip}/json/`);
        const data = await res.json();

        if (data.error) return "Unknown location";

        return `${data.region ?? "Unknown state"}, ${data.country_name ?? ""}`;
      } catch {
        return "Unknown location";
      }
    }

    // Send email using same in-memory data
    transporter
      .sendMail({
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: "New Login Detected",
        html: LOGIN_ALERT_TEMPLATE.replace("{{device}}", deviceLabel),
      })
      .catch(console.error);

    return NextResponse.json(
      { success: true, message: "Login successful" },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
