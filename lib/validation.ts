import { z } from 'zod'

// User validation schemas
export const CreateUserSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(255, 'Name must be less than 255 characters')
    .trim(),
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase(),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(255, 'Password must be less than 255 characters'),
  role: z.enum(['admin', 'user'], {
    errorMap: () => ({ message: 'Role must be admin or user' })
  })
})

export const UpdateUserSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(255, 'Name must be less than 255 characters')
    .trim()
    .optional(),
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .optional(),
  role: z.enum(['admin', 'user'], {
    errorMap: () => ({ message: 'Role must be admin or user' })
  }).optional(),
  is_active: z.boolean().optional()
})

export const ChangePasswordSchema = z.object({
  newPassword: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(255, 'Password must be less than 255 characters'),
  currentPassword: z.string().optional() // Optional for admin changing other user passwords
})

export const LoginSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .toLowerCase(),
  password: z.string()
    .min(1, 'Password is required')
})

// API Response schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional()
})

// Validation helper functions
export function validateCreateUser(data: unknown) {
  return CreateUserSchema.safeParse(data)
}

export function validateUpdateUser(data: unknown) {
  return UpdateUserSchema.safeParse(data)
}

export function validateChangePassword(data: unknown) {
  return ChangePasswordSchema.safeParse(data)
}

export function validateLogin(data: unknown) {
  return LoginSchema.safeParse(data)
}

// Sanitization functions
export function sanitizeUserInput(input: string): string {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/[<>]/g, '') // Remove < and > characters
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

// Error formatting
export function formatValidationErrors(errors: z.ZodError) {
  return errors.errors.map(error => ({
    field: error.path.join('.'),
    message: error.message
  }))
}