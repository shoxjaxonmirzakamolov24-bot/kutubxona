import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string) {
  try {
    return format(parseISO(dateString), "MMM d, yyyy h:mm a");
  } catch (error) {
    return dateString;
  }
}

export function getAuthToken() {
  return localStorage.getItem("auth_token");
}

export function setAuthToken(token: string) {
  localStorage.setItem("auth_token", token);
}

export function removeAuthToken() {
  localStorage.removeItem("auth_token");
}
