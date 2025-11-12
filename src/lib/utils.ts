import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates and normalizes a return URL to prevent open redirect attacks.
 * Only allows relative paths starting with '/' and disallows:
 * - Absolute URLs (with protocol like http://, https://, javascript:, etc.)
 * - Protocol-relative URLs (starting with //)
 * - URLs containing control characters or dangerous patterns
 *
 * @param url - The URL to validate
 * @returns A safe relative path or null if validation fails
 */
export function validateReturnUrl(url: string | null): string | null {
  if (!url) {
    return null;
  }

  try {
    const decoded = decodeURIComponent(url);
    const trimmed = decoded.trim();

    if (!trimmed.startsWith("/")) {
      return null;
    }

    if (trimmed.startsWith("//")) {
      return null;
    }

    const lowercased = trimmed.toLowerCase();
    const dangerousProtocols = ["http:", "https:", "javascript:", "data:", "vbscript:", "file:"];
    if (dangerousProtocols.some((protocol) => lowercased.includes(protocol))) {
      return null;
    }

    for (let i = 0; i < trimmed.length; i++) {
      const charCode = trimmed.charCodeAt(i);
      if ((charCode >= 0 && charCode <= 31) || charCode === 127) {
        return null;
      }
    }

    return trimmed;
  } catch {
    return null;
  }
}
