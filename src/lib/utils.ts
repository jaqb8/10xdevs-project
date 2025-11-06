import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely converts a Date or string to ISO string format.
 * Handles both Date objects and string dates depending on the database driver.
 *
 * @param date - Date object or ISO string
 * @returns ISO string representation of the date
 */
export function toISOString(date: Date | string): string {
  if (date instanceof Date) {
    return date.toISOString();
  }
  if (typeof date === "string") {
    return new Date(date).toISOString();
  }
  throw new Error(`Invalid date type: ${typeof date}`);
}
