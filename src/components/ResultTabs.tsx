"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";

interface ResultTabsProps {
  examCount: number;
  assignmentCount: number;
  examContent: React.ReactNode;
  assignmentContent: React.ReactNode;
  defaultValue?: string;
}

export default function ResultTabs({
  examCount,
  assignmentCount,
  examContent,
  assignmentContent,
  defaultValue = "exams",
}: ResultTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentTab = searchParams.get("tab") || defaultValue;

  const handleTabChange = (value: string) => {
    if (value === currentTab) return;

    // setIsTransitioning(true);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    params.delete("page"); // Reset to first page when changing tabs
    params.delete("search"); // Reset search when changing tabs
    params.delete("sort"); // Reset sort when changing tabs
    router.push(`?${params.toString()}`);

    // Reset transition state after animation completes
    setTimeout(() => setIsTransitioning(false), 100);
  };

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4 h-auto">
        <TabsTrigger
          value="exams"
          className="transition-all duration-300 ease-in-out text-sm"
        >
          <span className="hidden sm:inline">Exams ({examCount})</span>
          <span className="sm:hidden">Exams ({examCount})</span>
        </TabsTrigger>
        <TabsTrigger
          value="assignments"
          className="transition-all duration-300 ease-in-out text-sm"
        >
          <span className="hidden sm:inline">
            Assignments ({assignmentCount})
          </span>
          <span className="sm:hidden">Assign. ({assignmentCount})</span>
        </TabsTrigger>
      </TabsList>

      <div className="relative min-h-[300px] sm:min-h-[400px]">
        {/* Loading overlay during transitions */}
        {isTransitioning && (
          <div className="flex justify-center items-center p-4 sm:p-8">
            <LoaderCircle className="animate-spin w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        )}

        <TabsContent
          value="exams"
          className={cn(
            "mt-0 transition-all duration-300 ease-in-out p-0",
            "data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-2",
            "data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=inactive]:slide-out-to-top-2",
            currentTab === "exams"
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2",
          )}
        >
          {examContent}
        </TabsContent>

        <TabsContent
          value="assignments"
          className={cn(
            "mt-0 transition-all duration-300 ease-in-out p-0",
            "data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-2",
            "data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=inactive]:slide-out-to-top-2",
            currentTab === "assignments"
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2",
          )}
        >
          {assignmentContent}
        </TabsContent>
      </div>
    </Tabs>
  );
}
