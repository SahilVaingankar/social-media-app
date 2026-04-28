"use server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { cookies } from "next/headers";
import { verifyOtpSchema } from "@/lib/validators/auth";

// Things to be careful about (you’ll likely run into these)
// ❗ Don’t allow expired OTP
// ❗ Don’t allow reused OTP
// ❗ Always hash token before storing
// ❗ Token should be long + random (not like OTP)

export async function verifyOtpAction(email: string, body: unknown) {
  const result = verifyOtpSchema.safeParse(body);

  if (!result.success) {
    return { success: false, message: result.error.issues[0].message };
  }

  const { otp } = result.data;

  // hash otp
  const codeHash = crypto.createHash("sha256").update(otp).digest("hex");

  try {
    // fetch latest otp
    const latestOtp = await prisma.otp.findFirst({
      where: {
        user: { email },
        type: "PASSWORD_RESET",
        consumedAt: null,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: "desc" },
      select: { codeHash: true, id: true, userId: true, attempts: true },
    });

    // check otp vaidity
    if (!latestOtp) {
      return { success: false, message: "Invalid or expired OTP" };
    }

    // check otp vaidity
    if (latestOtp.attempts >= 5) {
      return {
        success: false,
        message: "Too many attempts. Please request a new OTP.",
      };
    }

    if (latestOtp.codeHash !== codeHash) {
      await prisma.otp.updateMany({
        where: {
          id: latestOtp.id,
          attempts: { lt: 5 },
        },
        data: { attempts: { increment: 1 } },
      });
      return { success: false, message: "Invalid OTP" };
    }

    // create resetOtpToken
    const resetOtpToken = crypto.randomBytes(32).toString("hex");

    // hash resetOtpToken
    const resetOtpTokenHash = crypto
      .createHash("sha256")
      .update(resetOtpToken)
      .digest("hex");

    // transection update db and set otp as consumed
    await prisma.$transaction([
      prisma.otp.update({
        where: { id: latestOtp.id },
        data: { consumedAt: new Date() },
      }),
      prisma.authToken.upsert({
        where: {
          userId_type: {
            userId: latestOtp.userId,
            type: "PASSWORD_RESET",
          },
        },
        update: {
          tokenHash: resetOtpTokenHash,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
        create: {
          userId: latestOtp.userId,
          type: "PASSWORD_RESET",
          tokenHash: resetOtpTokenHash,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins expiry
        },
      }),
    ]);

    // send cookies
    const cookieStore = await cookies();

    cookieStore.set("resetOtpToken", resetOtpToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60, // 15 mins
      path: "/",
    });

    return { success: true, message: "OTP verified" };
  } catch (error) {
    console.error("Error in requestOtpAction:", error);
    return { success: false, message: "Internal server error" };
  }
}
