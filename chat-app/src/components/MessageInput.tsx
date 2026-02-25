// src/components/MessageInput.tsx - WITH SAFE typing
"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Send, Loader2 } from "lucide-react";

interface MessageInputProps {
  conversationId: Id<"conversations">;
}

export default function MessageInput({ conversationId }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sendMessage = useMutation(api.messages.sendMessage);
  const setTyping = useMutation(api.typing.setTyping);
  const removeTyping = useMutation(api.typing.removeTyping);
  
  const lastTypingRef = useRef<number>(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [message]);

  const handleTyping = () => {
    const now = Date.now();
    
    // Only send typing indicator every 10 SECONDS (very safe!)
    if (now - lastTypingRef.current > 10000) {
      setTyping({ conversationId }).catch(() => {});
      lastTypingRef.current = now;
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Remove typing after 3 seconds of no typing
    typingTimeoutRef.current = setTimeout(() => {
      removeTyping({ conversationId }).catch(() => {});
    }, 3000);
  };

  const handleSend = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSending) return;

    setIsSending(true);
    const messageToSend = trimmedMessage;
    setMessage("");

    try {
      await sendMessage({
        conversationId,
        content: messageToSend,
      });
      await removeTyping({ conversationId });
    } catch (error) {
      console.error("Failed:", error);
      setMessage(messageToSend);
      alert("Failed to send. Try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (e.target.value.trim()) {
      handleTyping();
    }
  };

  return (
    <div className="shrink-0 border-t border-slate-200 bg-white p-4">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={isSending}
          rows={1}
          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white max-h-32"
        />

        <button
          onClick={handleSend}
          disabled={!message.trim() || isSending}
          className="shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-full flex items-center justify-center disabled:opacity-50 shadow-lg"
        >
          {isSending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}