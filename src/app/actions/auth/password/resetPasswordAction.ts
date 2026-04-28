"use server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { resetPasswordSchema } from "@/lib/validators/auth";

export async function resetPasswordAction(body: unknown) {
  const result = resetPasswordSchema.safeParse(body);

  if (!result.success) {
    return { success: false, message: result.error.issues[0].message };
  }

  const { newPassword } = result.data;

  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("resetOtpToken")?.value;

    if (!token) {
      return {
        success: false,
        message: "No token found, Please verify with otp again.",
      };
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const record = await prisma.authToken.findFirst({
      where: {
        tokenHash,
        type: "PASSWORD_RESET",
        expiresAt: { gte: new Date() },
      },
      select: { userId: true, id: true },
    });

    if (!record) {
      return { success: false, message: "Invalid or Expired token" };
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: record.userId,
        },
        data: {
          passwordHash: newPasswordHash,
        },
      }),
      prisma.authToken.delete({
        where: { id: record.id },
      }),
    ]);

    cookieStore.delete("resetOtpToken");

    return { success: true, message: "Password reset successful" };
  } catch (error) {
    console.error("Error in resetPasswordAction:", error);
    return { success: false, message: "Internal server error" };
  }
}
