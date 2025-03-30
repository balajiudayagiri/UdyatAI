"use client";

import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ChatWindow } from "./ChatWindow";
import { useResumeStore } from "@/store/resumeStore";
import { ScrollToBottom } from "./utility-components/ScrollToBottom";

interface ResumeData {
  experience: string[];
  education: string[];
  skills: string[];
  achievements: string[];
  objective: string[];
}

interface ResumeContext {
  type: "greeting" | "question" | "resume" | null;
  missingFields: string[];
  currentSection: string | null;
  collectedData: Partial<ResumeData>;
  isComplete: boolean;
}

const REQUIRED_FIELDS = [
  "experience",
  "education",
  "skills",
  "achievements",
  "objective",
] as const;

type ResumeField = (typeof REQUIRED_FIELDS)[number];

export function PlaceholdersAndVanishInputDemo() {
  const addMessage = useResumeStore((state) => state.addMessage);
  const updateResumeSection = useResumeStore(
    (state) => state.updateResumeSection
  );

  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [context, setContext] = useState<ResumeContext>({
    type: null,
    missingFields: [],
    currentSection: null,
    collectedData: {},
    isComplete: false,
  });

  const placeholders = [
    "Tell me about your work experience",
    "What are your key skills?",
    "Describe your educational background",
    "What are your career achievements?",
    "What position are you applying for?",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const detectSection = (input: string): ResumeField | null => {
    return (
      REQUIRED_FIELDS.find((field) => input.toLowerCase().includes(field)) ||
      null
    );
  };

  const analyzeResumeInput = (input: string) => {
    const sections: Partial<ResumeData> = {};
    const missing: string[] = [];

    REQUIRED_FIELDS.forEach((field) => {
      const regex = new RegExp(
        `${field}[:\\s]([^]*?)(?=(?:${REQUIRED_FIELDS.join("|")})[:\\s]|$)`,
        "i"
      );
      const match = input.match(regex);

      if (match && match[1].trim()) {
        sections[field as keyof ResumeData] = match[1]
          .trim()
          .split("\n")
          .filter((line) => line.trim());
      } else {
        missing.push(field);
      }
    });

    return { sections, missing };
  };

  const generateCompleteResume = (data: Partial<ResumeData>) => {
    return `# Professional Resume

${
  data.objective
    ? `## Professional Summary
${data.objective.join("\n")}`
    : ""
}

## Professional Experience
${data.experience ? data.experience.map((exp) => `- ${exp}`).join("\n") : ""}

## Education
${data.education ? data.education.map((edu) => `- ${edu}`).join("\n") : ""}

## Skills & Expertise
${data.skills ? data.skills.map((skill) => `- ${skill}`).join("\n") : ""}

## Key Achievements
${
  data.achievements
    ? data.achievements.map((achievement) => `- ${achievement}`).join("\n")
    : ""
}`;
  };

  const handleGreeting = () => {
    return {
      type: "greeting" as const,
      response: `Hello! 👋 I'm your AI resume assistant. I can help you:

* Create a professional resume from scratch
* Update existing resume sections
* Answer questions about resume writing
* Provide career advice and tips
* Review and improve your content

Would you like to create a new resume or have specific questions?`,
    };
  };

  const handleResumeCreation = (input: string) => {
    const { sections, missing } = analyzeResumeInput(input);

    if (
      input.toLowerCase().includes("create") &&
      input.toLowerCase().includes("resume")
    ) {
      if (missing.length === 0) {
        const completeResume = generateCompleteResume(sections);
        return {
          type: "resume" as const,
          response: `Great! I've created a complete resume based on your information:

${completeResume}

Would you like me to refine any section?`,
          missingFields: [],
          collectedData: sections,
          isComplete: true,
        };
      } else {
        return {
          type: "resume" as const,
          response: `I'll help you create a professional resume. Here's what I've got so far:

${Object.keys(sections)
  .map((section) => `✓ ${section}`)
  .join("\n")}

I still need information about:
${missing
  .map((field) => `- ${field}:\n${getFieldPrompt(field as ResumeField)}`)
  .join("\n\n")}

Let's start with your ${missing[0]}. Please provide the details.`,
          missingFields: missing,
          collectedData: sections,
          isComplete: false,
        };
      }
    }
    return null;
  };

  const getFieldPrompt = (field: ResumeField): string => {
    const prompts: Record<ResumeField, string> = {
      experience: `Please include:
* Your role and company
* Duration of employment
* Key responsibilities
* Notable achievements`,
      education: `Please include:
* Degree and major
* Institution name
* Graduation year
* Relevant coursework`,
      skills: `Please include:
* Technical skills
* Soft skills
* Tools and technologies
* Certifications`,
      achievements: `Please include:
* Quantifiable results
* Awards and recognition
* Projects completed
* Impact made`,
      objective: `Please include:
* Target position
* Career goals
* Value proposition
* Industry focus`,
    };
    return prompts[field];
  };

  const handleQuestion = (input: string) => {
    const commonQuestions = {
      format: `Here are some resume formatting best practices:

* Keep it to 1-2 pages
* Use clear headings and consistent formatting
* Include white space for readability
* Use bullet points for achievements
* Choose a professional font`,
      skills: `When listing skills, remember to:

* Match skills to the job description
* Include both hard and soft skills
* Group skills by category
* Highlight proficiency levels
* Provide concrete examples`,
      keywords: `To optimize your resume for ATS:

* Use industry-standard terms
* Include relevant technical skills
* Match keywords from job posting
* Use full terms before abbreviations
* Avoid graphics and custom fonts`,
    };

    const questionType = Object.keys(commonQuestions).find((key) =>
      input.toLowerCase().includes(key)
    );

    return questionType
      ? {
          type: "question" as const,
          response:
            commonQuestions[questionType as keyof typeof commonQuestions],
        }
      : null;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input || loading) return;

    try {
      setLoading(true);
      setInput(""); // Clear input immediately after submission
      addMessage("user", input);

      // Check for greetings
      if (input.toLowerCase().match(/^(hi|hello|hey|greetings)/)) {
        const result = handleGreeting();
        addMessage("assistant", result.response);
        setContext({ ...context, type: result.type });
        return;
      }

      // Handle resume creation intent
      if (
        input.toLowerCase().includes("create") &&
        input.toLowerCase().includes("resume")
      ) {
        const result = handleResumeCreation(input);
        if (result) {
          addMessage("assistant", result.response);
          setContext({
            type: "resume",
            missingFields: result.missingFields,
            currentSection: result.missingFields[0] || null,
            collectedData: {
              ...context.collectedData,
              ...result.collectedData,
            },
            isComplete: result.isComplete,
          });

          if (result.isComplete) {
            updateResumeSection({
              id: Date.now().toString(),
              type: "complete",
              content: result.response,
            });
          }
          return;
        }
      }

      // Handle questions
      if (input.toLowerCase().includes("?")) {
        const result = handleQuestion(input);
        if (result) {
          addMessage("assistant", result.response);
          setContext({ ...context, type: result.type });
          return;
        }
      }

      // Handle section updates in resume creation mode
      if (context.type === "resume" && context.currentSection) {
        const updatedData = {
          ...context.collectedData,
          [context.currentSection]: [
            ...(context.collectedData[
              context.currentSection as keyof ResumeData
            ] || []),
            input,
          ],
        };

        setContext((prev) => ({
          ...prev,
          collectedData: updatedData,
        }));

        // Check if this was the last section
        if (context.missingFields.length === 1) {
          const completeResume = generateCompleteResume(updatedData);
          addMessage(
            "assistant",
            `Perfect! I've collected all the information. Here's your complete resume:

${completeResume}

Would you like me to refine any section?`
          );

          updateResumeSection({
            id: Date.now().toString(),
            type: "complete",
            content: completeResume,
          });

          setContext((prev) => ({
            ...prev,
            isComplete: true,
            missingFields: [],
            currentSection: null,
          }));
          return;
        }

        // Move to next section
        const nextFields = context.missingFields.slice(1);
        const nextPrompt = `Great! Now, let's work on your ${nextFields[0]}:
${getFieldPrompt(nextFields[0] as ResumeField)}`;

        addMessage("assistant", nextPrompt);
        setContext((prev) => ({
          ...prev,
          missingFields: nextFields,
          currentSection: nextFields[0],
        }));
        return;
      }

      // Generate resume section
      const section = detectSection(input);
      const prompt =
        context.type === "resume"
          ? `Create a professional ${context.currentSection} section for: ${input}`
          : `Create a professional resume section for: ${input}`;

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `${prompt}
Format the response in markdown with:
- Clear section headings (##)
- Bullet points for achievements
- Keywords relevant to the industry
- Quantifiable results where possible
- Professional tone and language`,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      addMessage("assistant", data.message);

      if (section) {
        updateResumeSection({
          id: Date.now().toString(),
          type:
            section === "achievements" || section === "objective"
              ? "summary"
              : section,
          content: data.message,
        });
      }
    } catch (error: unknown) {
      console.error("Generation error:", error);
      addMessage(
        "assistant",
        "Error: Failed to generate resume content. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const [showScrollButton, setShowScrollButton] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Add this new function
  const handleScroll = () => {
    if (!chatContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const bottomThreshold = 100; // Show button when user scrolls up more than 100px from bottom
    setShowScrollButton(
      scrollHeight - scrollTop - clientHeight > bottomThreshold
    );
  };

  const scrollToBottom = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  };
  const messages = useResumeStore((state) => state.messages);
  return (
    <React.Fragment>
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className={cn(
          "grow overflow-y-auto relative md:px-4 w-full",
          "[&::-webkit-scrollbar]:w-1",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full",
          "dark:[&::-webkit-scrollbar-track]:bg-transparent",
          "dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500",
          messages.length === 0 && "flex items-center justify-center"
        )}>
        <ChatWindow isLoading={loading} />
        <ScrollToBottom isVisible={showScrollButton} onClick={scrollToBottom} />
      </div>
      <div
        className={cn(
          "w-full max-w-2xl mx-auto transition-all duration-300",
          messages.length === 0
            ? "absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2"
            : "my-5 max-md:mb-15 max-md:mx-3"
        )}>
        {messages.length === 0 && (
          <div className="flex flex-col mb-3 items-center justify-center space-y-2 text-center">
            <h1 className="text-2xl font-bold">Welcome to UdyatAi</h1>
            <p className="text-gray-500">
              Start by asking me anything about resume writing or share your
              existing resume for updates.
            </p>
          </div>
        )}
        <PlaceholdersAndVanishInput
          placeholders={placeholders}
          onChange={handleChange}
          onSubmit={onSubmit}
          className={messages.length === 0 ? "scale-110" : ""}
        />
      </div>
    </React.Fragment>
  );
}
