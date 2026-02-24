import { type ClassValue, clsx } from "clsx";
import { formatDistanceToNow, format, isToday, isThisYear } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatMessageTime(timestamp: number): string {
  const date = new Date(timestamp);

  if (isToday(date)) {
    return format(date, "h:mm a"); 
  } else if (isThisYear(date)) {
    return format(date, "MMM d, h:mm a"); 
  } else {
    return format(date, "MMM d, yyyy, h:mm a"); 
  }
}

export function formatLastSeen(timestamp: number): string {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}