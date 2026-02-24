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
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [message]);

  const handleTyping = () => {
    setTyping({ conversationId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // set new timeout to remove typing indicator after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      removeTyping({ conversationId });
    }, 2000);
  };

  const handleSend = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSending) return;

    setIsSending(true);
    setMessage("");

    try {
      await sendMessage({
        conversationId,
        content: trimmedMessage,
      });
      await removeTyping({ conversationId });
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessage(trimmedMessage); // restore message on error
      alert("Failed to send message. Please try again.");
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
    handleTyping();
  };

  return (
    <div className="shrink-0 border-t border-slate-200 bg-white p-4">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={isSending}
            rows={1}
            className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed max-h-32"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!message.trim() || isSending}
          className="shrink-0 w-12 h-12 bg-linear-to-br from-indigo-600 to-indigo-700 text-white rounded-full flex items-center justify-center hover:from-indigo-700 hover:to-indigo-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg"
        >
          {isSending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      <p className="text-xs text-slate-500 mt-2 px-1">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
}