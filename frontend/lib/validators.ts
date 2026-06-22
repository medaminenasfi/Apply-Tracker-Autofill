import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof LoginSchema>;

export const SignupSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type SignupFormData = z.infer<typeof SignupSchema>;

export const ApplicationCreateSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  position: z.string().min(1, 'Job title is required'),
  url: z.string().url('Invalid job link URL'),
  dateApplied: z.string().min(1, 'Date applied is required'),
  deadline: z.string().optional(),
  note: z.string().min(1, 'Notes are required'),
  status: z.enum(['applied', 'interview', 'accepted', 'rejected']).default('applied'),
  source: z.enum(['manual', 'extension']).default('manual'),
});

export type ApplicationCreateFormData = z.infer<typeof ApplicationCreateSchema>;

export const ApplicationEditSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  position: z.string().min(1, 'Job title is required'),
  url: z.string().url('Invalid job link URL'),
  dateApplied: z.string().min(1, 'Date applied is required'),
  deadline: z.string().optional(),
  status: z.enum(['applied', 'interview', 'accepted', 'rejected']),
});

export type ApplicationEditFormData = z.infer<typeof ApplicationEditSchema>;

/** @deprecated Use ApplicationCreateSchema */
export const ApplicationSchema = ApplicationCreateSchema;
/** @deprecated Use ApplicationCreateFormData */
export type ApplicationFormData = ApplicationCreateFormData;

export const ProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  countryCode: z.string().optional(),
  university: z.string().optional(),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  portfolio: z.string().url('Invalid portfolio URL').optional().or(z.literal('')),
});

export type ProfileFormData = z.infer<typeof ProfileSchema>;
