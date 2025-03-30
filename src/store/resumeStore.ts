import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface ResumeSection {
  id: string;
  type: "experience" | "education" | "skills" | "summary" | "complete";
  content: string;
}

interface ResumeState {
  messages: Message[];
  currentResume: ResumeSection[];
  versions: Array<{ id: string; sections: ResumeSection[] }>;
  addMessage: (role: "user" | "assistant", content: string) => void;
  updateResumeSection: (section: ResumeSection) => void;
  saveVersion: () => void;
}

export const useResumeStore = create<ResumeState>()(
  immer((set) => ({
    messages: [],
    currentResume: [],
    versions: [],
    addMessage: (role, content) =>
      set((state) => {
        state.messages.push({
          id: Date.now().toString(),
          role,
          content,
          timestamp: Date.now(),
        });
      }),
    updateResumeSection: (section) =>
      set((state) => {
        const existingIndex = state.currentResume.findIndex(
          (s) => s.type === section.type
        );
        if (existingIndex >= 0) {
          state.currentResume[existingIndex] = section;
        } else {
          state.currentResume.push(section);
        }
      }),
    saveVersion: () =>
      set((state) => {
        state.versions.push({
          id: Date.now().toString(),
          sections: [...state.currentResume],
        });
      }),
  }))
);
