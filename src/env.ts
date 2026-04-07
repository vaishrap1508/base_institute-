import { z } from 'zod';

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Must be a valid Supabase URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase Anon Key is required"),
  
  // Redis (Upstash)
  UPSTASH_REDIS_REST_URL: z.string().url("Must be a valid Upstash Redis URL").optional().or(z.literal('')),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional().or(z.literal('')),
  
  // Environment Mode
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const _env = envSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  NODE_ENV: process.env.NODE_ENV,
});

if (!_env.success) {
  console.error("❌ Invalid environment variables:");
  console.error(_env.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = _env.data;
