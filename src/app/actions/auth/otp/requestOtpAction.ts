"use server";

import { PASSWORD_RESET_TEMPLATE } from "@/email/templates/reset-password";
import { transporter } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { hash, randomInt } from "crypto";
import crypto from "crypto";
import { requestOtpSchema } from "@/lib/validators/auth";

export async function requestOtpAction(body: unknown) {
  const result = requestOtpSchema.safeParse(body);

  if (!result.success) {
    return { success: false, message: result.error.issues[0].message };
  }

  const { email } = result.data;

  // generate random 6-digit otp
  const otp = randomInt(100000, 1000000).toString();

  // hash otp
  const codeHash = crypto.createHash("sha256").update(otp).digest("hex");

  try {
    // fetch user data
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, otpBlockedUntil: true, name: true, username: true },
    });

    // check if user exists
    if (!user) {
      return { success: false, message: "User not found" };
    }

    // ts fix
    const blockedUntil = user.otpBlockedUntil as Date | null;

    // check prev otp attempts
    const recentOtps = await prisma.otp.findMany({
      where: {
        userId: user.id,
        type: "PASSWORD_RESET",
        createdAt: {
          gte: new Date(Date.now() - 15 * 60 * 1000),
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { createdAt: true },
    });

    // handle soft-cooldown
    if (recentOtps.length > 2) {
      const lastOtpTime = recentOtps[0].createdAt.getTime();
      const diff = Date.now() - lastOtpTime;

      if (diff < 30 * 1000) {
        return {
          success: false,
          message: "Wait 30 seconds before requesting again.",
        };
      }
    }

    // handle hard-cooldown
    if (recentOtps.length === 5) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          data: { otpBlockedUntil: new Date(Date.now() + 15 * 60 * 1000) },
        },
      });
      return { success: false, message: "Too many requests. Try later." };
    }

    if (blockedUntil && blockedUntil > new Date()) {
      return { success: false, message: "Too many requests. Try later." };
    }

    // update db
    await prisma.$transaction([
      prisma.otp.updateMany({
        where: {
          userId: user.id,
          type: "PASSWORD_RESET",
          consumedAt: null,
        },
        data: { consumedAt: new Date() },
      }),
      prisma.otp.create({
        data: {
          codeHash,
          userId: user.id,
          type: "PASSWORD_RESET",
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 2 * 60 * 1000),
        },
      }),
    ]);

    // send mail
    transporter
      .sendMail({
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: "Password Reset Request",
        html: PASSWORD_RESET_TEMPLATE.replace(
          "{{user}}",
          user.username,
        ).replace("{{otp}}", otp),
      })
      .catch(console.error);

    return {
      success: true,
      message: "Please enter the OTP sent to your email",
    };
  } catch (error) {
    console.error("Error in requestOtpAction:", error);
    return { success: false, message: "Internal server error" };
  }
}
