import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET!;
if (!JWT_SECRET) throw new Error("JWT secret is not defined");

export interface AccessTokenPayload extends JwtPayload {
  id: string; // user id
  email: string;
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AccessTokenPayload;

    // Optional runtime check for extra safety
    if (!payload.id || !payload.email) {
      throw new Error("Token payload missing required fields");
    }

    return payload;
  } catch (err) {
    throw new Error("Invalid or expired access token");
  }
}
