"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface TypingIndicatorProps {
  conversationId: Id<"conversations">;
}

export default function TypingIndicator({
  conversationId,
}: TypingIndicatorProps) {
  const typingUsers = useQuery(api.typing.getTypingUsers, { conversationId });

  if (!typingUsers || typingUsers.length === 0) return null;

  const names = typingUsers.map((u) => u.name).join(", ");
  const text =
    typingUsers.length === 1
      ? `${names} is typing`
      : `${names} are typing`;

  return (
    <div className="px-4 py-2 text-sm text-[#2E3440]/60 italic flex items-center gap-2">
      <span>{text}</span>
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-[#8B7CF6] rounded-full animate-pulse-dot" />
        <span className="w-1.5 h-1.5 bg-[#8B7CF6] rounded-full animate-pulse-dot [animation-delay:0.2s]" />
        <span className="w-1.5 h-1.5 bg-[#8B7CF6] rounded-full animate-pulse-dot [animation-delay:0.4s]" />
      </div>
    </div>
  );
}