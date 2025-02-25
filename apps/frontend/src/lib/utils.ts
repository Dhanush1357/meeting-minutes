import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const registerServiceWorker = () => {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered:", registration);
        })
        .catch((err) => {
          console.log("SW registration failed:", err);
        });
    });
  }
};

export const formatDate = (date: string | null, formatType: "date" | "time" | "full" = "full") => {
  if (!date) return "";
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  if (formatType === "date") {
    delete options.hour;
    delete options.minute;
    delete options.hour12;
  } else if (formatType === "time") {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  return new Date(date).toLocaleDateString("en-US", options);
};

export const generateRandomPassword = (length = 12) => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  return Array.from({ length }, () => charset[Math.floor(Math.random() * charset.length)]).join('');
};