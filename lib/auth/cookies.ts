type AuthCookieInput = {
  deviceId: string;
  accessToken: string;
};

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
