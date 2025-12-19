// import { cookies } from "next/headers";

// export async function setAuthCookies({
//   deviceId,
//   accessToken,
// }: {
//   deviceId: string;
//   accessToken: string;
// }) {
//   const cookieStore = await cookies();

//   cookieStore.set("device_id", deviceId, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
//     maxAge: 60 * 60 * 24 * 365,
//     path: "/",
//   });

//   cookieStore.set("accessToken", accessToken, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
//     maxAge: 15 * 60,
//     path: "/",
//   });
// }

type AuthCookieInput = {
  deviceId: string;
  accessToken: string;
};

// export async function setAuthCookies(
export function setAuthCookies(
  cookieStore: {
    set: (
      name: string,
      value: string,
      options?: {
        httpOnly?: boolean;
        secure?: boolean;
        sameSite?: "strict" | "lax" | "none";
        maxAge?: number;
        path?: string;
      }
    ) => void;
  },
  { deviceId, accessToken }: AuthCookieInput
) {
  cookieStore.set("device_id", deviceId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  cookieStore.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 15 * 60,
    path: "/",
  });
}
