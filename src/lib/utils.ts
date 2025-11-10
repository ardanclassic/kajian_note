/**
 * Utility Functions
 * Helper functions for common operations
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with proper precedence
 * Used for conditional styling in components
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate username from full name
 * Example: "Ahmad Zaki" -> "ahmadzaki"
 */
export function generateUsername(fullName: string): string {
  return fullName
    .toLowerCase()
    .replace(/\s+/g, "") // Remove spaces
    .replace(/[^a-z0-9]/g, "") // Remove special characters
    .slice(0, 20); // Max 20 characters
}

/**
 * Validate username format
 * Rules: alphanumeric, 3-20 characters, lowercase
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-z0-9]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Validate PIN format
 * Rules: exactly 6 digits
 */
export function isValidPIN(pin: string): boolean {
  const pinRegex = /^\d{6}$/;
  return pinRegex.test(pin);
}

/**
 * Format phone number for display
 * Example: "081234567890" -> "0812-3456-7890"
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return "";

  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 0) return "";
  if (cleaned.length <= 4) return cleaned;
  if (cleaned.length <= 8) return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;

  return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8, 12)}`;
}

/**
 * Generate dummy email for Supabase Auth
 * Format: {username}@kajiannote.local
 */
export function generateDummyEmail(username: string): string {
  return `${username}@kajiannote.com`;
}

/**
 * Sleep/delay function
 * Useful for testing loading states
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Truncate text with ellipsis
 * Example: truncateText("Long text here", 10) -> "Long text..."
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Capitalize first letter of each word
 * Example: "ahmad zaki" -> "Ahmad Zaki"
 */
export function capitalizeWords(text: string): string {
  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Get initials from name
 * Example: "Ahmad Zaki" -> "AZ"
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

/**
 * Check if value is empty
 * Handles null, undefined, empty string, empty array, empty object
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Generate random string
 * Useful for generating IDs
 */
export function randomString(length: number = 10): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Debounce function
 * Delays execution until after wait milliseconds have elapsed
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
