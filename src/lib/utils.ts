import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getSortOrder = (sortParam: string | undefined) => {
  switch (sortParam) {
    case "newest":
      return { createdAt: "desc" as const };
    case "oldest":
      return { createdAt: "asc" as const };
    case "ascending_name":
      return { name: "asc" as const };
    case "descending_name":
      return { name: "desc" as const };
    default:
      return { createdAt: "desc" as const }; // Default to newest
  }
};
export const resultSortOrder = (sortParam: string | undefined) => {
  switch (sortParam) {
    case "newest":
      return { createdAt: "desc" as const };
    case "oldest":
      return { createdAt: "asc" as const };
    case "ascending_student_name":
      return {
        student: {
          name: "asc" as const,
        },
      };
    case "descending_student_name":
      return {
        student: {
          name: "desc" as const,
        },
      };
    case "score_high":
      return { score: "desc" as const };
    case "score_low":
      return { score: "asc" as const };
    default:
      return { createdAt: "desc" as const }; // Default to newest
  }
};
