"use server";

import { UAParser } from "ua-parser-js";
import { signIn } from "@/auth"; // ← NextAuth App Router helper
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators/auth";
import { transporter } from "@/lib/mail";
// import { LOGIN_ALERT_TEMPLATE } from "@/email/templates/login-alart";
import { headers } from "next/headers";
import { LOGIN_ALERT_TEMPLATE } from "@/email/templates/login-alart";
// import { LOGIN_ALERT_TEMPLATE } from "@email/templates/login-alart";

export async function loginAction(body: unknown) {
  /**
   * 1️⃣ Validate input
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
     * 2️⃣ NextAuth sign-in
     */
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!res || res.error) {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }

    /**
     * 3️⃣ Fetch user id (for tracking)
     */
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    /**
     * 4️⃣ Device tracking
     */
    const hdrs = await headers();
    const userAgent = hdrs.get("user-agent") ?? "Unknown device";
    const ipAddress = hdrs.get("x-forwarded-for") ?? "unknown";

    // Parse device info
    const parser = new UAParser(userAgent);
    const ua = parser.getResult();
    const deviceLabel = `${ua.browser.name ?? "Browser"} · ${ua.os.name ?? "OS"}`;

    // Optional: location (can integrate with geoIP service later)
    const location = "Unknown"; // placeholder

    await prisma.loginActivity.create({
      data: {
        userId: user.id,
        userAgent,
        ipAddress,
        device: deviceLabel,
        location,
      },
    });

    /**
     * 5️⃣ Login alert email (non-blocking)
     */
    // const parser = new UAParser(userAgent);
    // const ua = parser.getResult();

    // const deviceLabel = `${ua.browser.name ?? "Browser"} · ${
    //   ua.os.name ?? "OS"
    // }`;

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
