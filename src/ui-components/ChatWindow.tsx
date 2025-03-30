"use client";
import { useEffect, useRef } from "react";
import ResponseFormatter from "./utility-components/ResponseFormatter";
import { useResumeStore } from "@/store/resumeStore";
import { IconLoader2 } from "@tabler/icons-react";

interface ChatWindowProps {
  isLoading?: boolean;
}

export function ChatWindow({ isLoading }: ChatWindowProps) {
  const messages = useResumeStore((state) => state.messages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, i) => (
        <div
          key={`${message.id}-${i}`}
          data-role={message.role}
          className={`flex ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}>
          <div
            className={`max-w-[80%] ${
              message.role === "user"
                ? "bg-white/20 text-white rounded-4xl px-5 py-2"
                : ""
            }`}>
            {message.role === "user" ? (
              message.content
            ) : (
              <ResponseFormatter response={message.content} />
            )}
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="max-w-[80%] bg-gray-100 dark:bg-gray-800 rounded-lg p-4 animate-pulse">
            <div className="flex items-center gap-2">
              <IconLoader2 className="animate-spin h-4 w-4 text-gray-500" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Generating response...
              </p>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
