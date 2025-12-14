import type { AstroCookies } from "astro";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import type { Database } from "./database.types.ts";
import { SUPABASE_URL, SUPABASE_PUBLIC_KEY } from "astro:env/server";

export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
};

function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  return cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name, value: rest.join("=") };
  });
}

export const createSupabaseServerInstance = (context: { headers: Headers; cookies: AstroCookies; url?: URL }) => {
  const isHttps =
    context.url?.protocol === "https:" ||
    context.headers.get("X-Forwarded-Proto") === "https" ||
    context.headers.get("CF-Visitor")?.includes('"scheme":"https"');

  const dynamicCookieOptions: CookieOptionsWithName = {
    ...cookieOptions,
    secure: isHttps !== undefined ? isHttps : cookieOptions.secure,
  };

  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_PUBLIC_KEY, {
    cookieOptions: dynamicCookieOptions,
    cookies: {
      getAll() {
        return parseCookieHeader(context.headers.get("Cookie") ?? "");
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => context.cookies.set(name, value, options));
      },
    },
  });

  return supabase;
};

export const DEFAULT_USER_ID = "9916d162-88fb-42ba-939d-5fd28f770ed1";

export type SupabaseClient = ReturnType<typeof createSupabaseServerInstance>;
