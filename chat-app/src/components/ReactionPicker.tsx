"use client";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useEffect, useRef } from "react";

interface ReactionPickerProps {
  messageId: Id<"messages">;
  onClose: () => void;
}

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

export default function ReactionPicker({
  messageId,
  onClose,
}: ReactionPickerProps) {
  const toggleReaction = useMutation(api.reactions.toggleReaction);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleReaction = async (emoji: string) => {
    await toggleReaction({ messageId, emoji });
    onClose();
  };

  return (
    <div
      ref={pickerRef}
      className="bg-white border border-[#E6E8EC] rounded-2xl shadow-2xl p-2 flex gap-1 animate-fade-in"
    >
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => handleReaction(emoji)}
          className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-[#F4F6F8] rounded-lg transition-all hover:scale-125"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}