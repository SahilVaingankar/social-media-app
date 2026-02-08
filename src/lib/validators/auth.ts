// import Joi from "joi";

// // Username: letters, numbers, underscores, dots; 3-30 chars
// const usernamePattern = /^[a-zA-Z0-9_.]+$/;

// export const signupSchema = Joi.object({
//   username: Joi.string()
//     .pattern(usernamePattern)
//     .min(3)
//     .max(30)
//     .required()
//     .messages({
//       "string.base": "Username must be a string",
//       "string.empty": "Username is required",
//       "string.min": "Username must be at least 3 characters",
//       "string.max": "Username cannot exceed 30 characters",
//       "string.pattern.base":
//         "Username can only contain letters, numbers, underscores, and dots",
//       "any.required": "Username is required",
//     }),
//   email: Joi.string()
//     .email({ tlds: { allow: false } })
//     .required()
//     .messages({
//       "string.email": "Please enter a valid email",
//       "string.empty": "Email is required",
//       "any.required": "Email is required",
//     }),
//   password: Joi.string().min(8).required().messages({
//     "string.min": "Password must be at least 8 characters",
//     "string.empty": "Password is required",
//     "any.required": "Password is required",
//   }),
// });

// export const loginSchema = Joi.object({
//   email: Joi.string()
//     .email({ tlds: { allow: false } })
//     .required()
//     .messages({
//       "string.email": "Please enter a valid email",
//       "string.empty": "Email is required",
//       "any.required": "Email is required",
//     }),
//   password: Joi.string().min(8).required().messages({
//     "string.min": "Password must be at least 8 characters",
//     "string.empty": "Password is required",
//     "any.required": "Password is required",
//   }),
// });

import { z } from "zod";

// Username: letters, numbers, underscores, dots; 3–30 chars
const usernamePattern = /^[a-zA-Z0-9_.]+$/;

export const signupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(
      usernamePattern,
      "Username can only contain letters, numbers, underscores, and dots"
    ),

  email: z.string().email("Please enter a valid email"),

  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.email("Please enter a valid email"),

  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Optional (industry standard)
export type SignupData = z.infer<typeof signupSchema>;
export type LoginData = z.infer<typeof loginSchema>;
