"use client";

import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import React, { useState } from "react";
import ResponseFormatter from "./utility-components/ResponseFormatter";
import { cn } from "@/lib/utils";

export function PlaceholdersAndVanishInputDemo() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [input, setInput] = useState("");

  const placeholders = [
    "Tell me about your work experience",
    "What are your key skills?",
    "Describe your educational background",
    "What are your career achievements?",
    "What position are you applying for?",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
    setInput(e.target.value);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // const formData = new FormData(e.currentTarget);
    // const input = formData.get("input")?.toString();
    console.log({ input });
    if (!input) return;

    try {
      setLoading(true);
      setResult(""); // Clear previous result

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `
Response Instructions:
- Use Markdown formatting
- Use ## for section headings
- Use bullet points for lists
- Include code blocks if relevant
- Keep formatting consistent and clean

User Query: ${input}

Please provide a well-structured response using proper formatting.`,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setResult(data.message);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Generation error:", error);
      setResult("Error: Failed to generate resume content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <React.Fragment>
      <div
        className={cn(
          "grow overflow-y-auto relative px-4 w-full",
          "[&::-webkit-scrollbar]:w-1",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full",
          " dark:[&::-webkit-scrollbar-track]:bg-transparent",
          "dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
        )}>
        {!loading && !result && (
          <div className="flex flex-col items-center justify-center h-full py-10">
            <h2 className="mb-5 sm:mb-10 text-xl text-center sm:text-5xl dark:text-white text-black">
              UdyatAi
            </h2>
            <p className="mb-10 sm:mb-20 text-sm text-center sm:text-md dark:text-white text-black">
              Generate impressive resumes powered by AI in minutes
            </p>
          </div>
        )}

        {loading && (
          <div className="space-y-4 w-full max-w-2xl mx-auto">
            {/* Title Skeleton */}
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mx-auto w-48"></div>
            {/* Subtitle Skeleton */}
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mx-auto w-64"></div>
            {/* Content Loading Skeleton */}
            <div className="mt-8 space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-4/6"></div>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-8 p-6 max-w-5xl w-full mx-auto ">
            <ResponseFormatter response={result} />
          </div>
        )}
      </div>
      <div className="w-full max-w-2xl mx-auto my-5 max-md:mb-10">
        <PlaceholdersAndVanishInput
          placeholders={placeholders}
          onChange={handleChange}
          onSubmit={onSubmit}
        />
      </div>
    </React.Fragment>
  );
}
