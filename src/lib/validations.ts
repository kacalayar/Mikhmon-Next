import { z } from "zod";

// Router validation schemas
export const routerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  host: z.string().min(1, "Host is required").max(255),
  port: z.coerce.number().int().min(1).max(65535).default(8728),
  username: z.string().min(1, "Username is required").max(100),
  password: z.string().min(1, "Password is required").max(255),
  hotspotName: z.string().max(100).optional(),
  dnsName: z.string().max(255).optional(),
  currency: z.string().max(10).default("Rp"),
  autoReload: z.coerce.number().int().min(0).max(3600).default(10),
});

export const routerUpdateSchema = routerSchema.partial();

// Connection test schema
export const connectionTestSchema = z.object({
  host: z.string().min(1, "Host is required").max(255),
  port: z.coerce.number().int().min(1).max(65535).default(8728),
});

// Hotspot user schemas
export const hotspotUserSchema = z.object({
  name: z.string().min(1, "Username is required").max(100),
  password: z.string().max(255).optional(),
  profile: z.string().min(1, "Profile is required").max(100),
  comment: z.string().max(255).optional(),
  disabled: z.boolean().optional(),
  server: z.string().max(100).optional(),
  "limit-uptime": z.string().max(50).optional(),
  "limit-bytes-in": z.string().max(50).optional(),
  "limit-bytes-out": z.string().max(50).optional(),
  "limit-bytes-total": z.string().max(50).optional(),
});

export const hotspotUserUpdateSchema = z.object({
  id: z.string().min(1, "User ID is required"),
  action: z.enum(["enable", "disable", "reset"]).optional(),
  name: z.string().max(100).optional(),
  password: z.string().max(255).optional(),
  profile: z.string().max(100).optional(),
  comment: z.string().max(255).optional(),
});

// Hotspot profile schema
export const hotspotProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  "shared-users": z.string().max(10).optional(),
  "rate-limit": z.string().max(100).optional(),
  "session-timeout": z.string().max(50).optional(),
  "idle-timeout": z.string().max(50).optional(),
  "keepalive-timeout": z.string().max(50).optional(),
});

// Generate users schema
export const generateUsersSchema = z.object({
  prefix: z.string().max(20).default(""),
  profile: z.string().min(1, "Profile is required").max(100),
  quantity: z.coerce.number().int().min(1).max(1000).default(1),
  usernameLength: z.coerce.number().int().min(4).max(20).default(6),
  passwordLength: z.coerce.number().int().min(4).max(20).default(6),
  usernameType: z.enum(["numeric", "alphanumeric", "alpha"]).default("numeric"),
  passwordType: z
    .enum(["numeric", "alphanumeric", "alpha", "same"])
    .default("same"),
  comment: z.string().max(255).optional(),
  server: z.string().max(100).optional(),
});

// PPP secret schema
export const pppSecretSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  password: z.string().max(255).optional(),
  service: z.string().min(1, "Service is required").max(50),
  profile: z.string().min(1, "Profile is required").max(100),
  "local-address": z.string().max(50).optional(),
  "remote-address": z.string().max(50).optional(),
  comment: z.string().max(255).optional(),
});

// IP Binding schema
export const ipBindingSchema = z.object({
  "mac-address": z.string().max(20).optional(),
  address: z.string().max(50).optional(),
  "to-address": z.string().max(50).optional(),
  server: z.string().max(100).optional(),
  type: z.enum(["regular", "bypassed", "blocked"]).default("regular"),
  comment: z.string().max(255).optional(),
});

// Session/Cookie data schema
export const sessionDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  host: z.string(),
  port: z.number(),
  user: z.string(),
  password: z.string(),
});

// Utility function to validate and parse
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues
      .map((e: z.ZodIssue) => e.message)
      .join(", ");
    return { success: false, error: errors };
  }
  return { success: true, data: result.data };
}

// ID parameter validation (for ?id=xxx query params)
export const idParamSchema = z.string().min(1, "ID is required");

// IP Binding action schema (for PUT operations)
export const ipBindingActionSchema = z.object({
  id: z.string().min(1, "ID is required"),
  action: z.enum(["enable", "disable"]),
});

// Quick Print package schema
export const quickPrintSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  server: z.string().max(100).default("all"),
  userMode: z.string().max(50).default("u"),
  nameLength: z.coerce.number().int().min(4).max(20).default(6),
  prefix: z.string().max(20).default(""),
  character: z.string().max(20).default("0123456789"),
  profile: z.string().min(1, "Profile is required").max(100),
  timeLimit: z.string().max(50).optional(),
  dataLimit: z.string().max(50).optional(),
  dataUnit: z.string().max(20).optional(),
  comment: z.string().max(255).optional(),
  validity: z.string().max(50).optional(),
  price: z.string().max(50).optional(),
  sellingPrice: z.string().max(50).optional(),
});

// Report filter schema
export const reportFilterSchema = z.object({
  idhr: z.string().optional(),
  idbl: z.string().optional(),
});

// Type exports
export type RouterInput = z.infer<typeof routerSchema>;
export type HotspotUserInput = z.infer<typeof hotspotUserSchema>;
export type HotspotProfileInput = z.infer<typeof hotspotProfileSchema>;
export type GenerateUsersInput = z.infer<typeof generateUsersSchema>;
export type PppSecretInput = z.infer<typeof pppSecretSchema>;
export type IpBindingInput = z.infer<typeof ipBindingSchema>;
export type SessionData = z.infer<typeof sessionDataSchema>;
export type IpBindingActionInput = z.infer<typeof ipBindingActionSchema>;
export type QuickPrintInput = z.infer<typeof quickPrintSchema>;
