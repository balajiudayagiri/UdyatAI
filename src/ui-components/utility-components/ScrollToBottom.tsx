import { IconArrowDown } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface ScrollToBottomProps {
  className?: string;
  onClick: () => void;
  isVisible: boolean;
}

export function ScrollToBottom({
  className,
  onClick,
  isVisible,
}: ScrollToBottomProps) {
  if (!isVisible) return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-24 right-8 p-2 rounded-full",
        "bg-primary text-primary-foreground shadow-lg",
        "hover:bg-primary/90 transition-all",
        "animate-bounce",
        className
      )}
      aria-label="Scroll to bottom">
      <IconArrowDown className="h-5 w-5" />
    </button>
  );
}
