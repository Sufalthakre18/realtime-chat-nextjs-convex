"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { formatMessageTime } from "@/lib/utils";
import UserAvatar from "./UserAvatar";
import ReactionPicker from "./ReactionPicker";
import { Smile, Trash2 } from "lucide-react";

interface MessageBubbleProps {
  message: any;
  isOwn: boolean;
  sender: any;
  showAvatar: boolean;
  conversationId: any;
}

export default function MessageBubble({
  message,
  isOwn,
  sender,
  showAvatar,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [loadReactions, setLoadReactions] = useState(false);
  
  const deleteMessage = useMutation(api.messages.deleteMessage);
  
  const reactions = useQuery(
    api.reactions.getReactions,
    loadReactions ? { messageId: message._id } : "skip"
  );

  const handleDelete = async () => {
    if (confirm("Delete this message?")) {
      await deleteMessage({ messageId: message._id });
    }
  };

  const handleMouseEnter = () => {
    setShowActions(true);
    setLoadReactions(true);
  };

  return (
    <div
      className={`flex gap-3 group ${isOwn ? "flex-row-reverse" : "flex-row"}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="shrink-0">
        {showAvatar && !isOwn ? (
          <UserAvatar
            name={sender?.name || "User"}
            imageUrl={sender?.imageUrl}
            size="sm"
          />
        ) : (
          <div className="w-8" />
        )}
      </div>

      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[70%]`}>
        {!isOwn && showAvatar && (
          <span className="text-xs font-serif font-semibold text-[#2E3440]/70 mb-1 px-3">
            {sender?.name}
          </span>
        )}

        <div className="relative">
          <div
            className={`
              px-4 py-2.5 rounded-2xl shadow-sm
              ${
                isOwn
                  ? "bg-[#3B4252] text-white"
                  : "bg-[#E5E9F0] text-[#2E3440] border border-[#E6E8EC]"
              }
              ${message.isDeleted ? "italic opacity-75" : ""}
            `}
          >
            {message.isDeleted ? (
              <span className="text-sm font-mono">This message was deleted</span>
            ) : (
              <p className="text-sm font-mono leading-relaxed break-words whitespace-pre-wrap">
                {message.content}
              </p>
            )}
          </div>

          {/* Quick Actions */}
          {!message.isDeleted && (
            <div
              className={`
                absolute top-0 flex items-center gap-1 transition-opacity
                ${showActions ? "opacity-100" : "opacity-0"}
                ${isOwn ? "right-full mr-2" : "left-full ml-2"}
              `}
            >
              <button
                onClick={() => setShowReactionPicker(!showReactionPicker)}
                className="p-1.5 bg-white border border-[#E6E8EC] rounded-lg hover:bg-[#F4F6F8] transition-colors shadow-sm"
                title="React"
              >
                <Smile className="w-4 h-4 text-[#2E3440]/70" />
              </button>

              {isOwn && (
                <button
                  onClick={handleDelete}
                  className="p-1.5 bg-white border border-[#E6E8EC] rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              )}
            </div>
          )}

          {/* Reaction Picker */}
          {showReactionPicker && (
            <div
              className={`absolute top-full mt-2 z-10 ${
                isOwn ? "right-0" : "left-0"
              }`}
            >
              <ReactionPicker
                messageId={message._id}
                onClose={() => setShowReactionPicker(false)}
              />
            </div>
          )}
        </div>

        {/* Display Reactions */}
        {reactions && reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                onClick={() => {
                  setShowReactionPicker(true);
                  setLoadReactions(true);
                }}
                className="px-2 py-1 bg-white border border-[#E6E8EC] rounded-full text-xs flex items-center gap-1 hover:bg-[#F4F6F8] transition-colors shadow-sm"
              >
                <span>{reaction.emoji}</span>
                <span className="text-[#2E3440]/70 font-medium">{reaction.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className={`text-xs text-[#2E3440]/50 mt-1 px-1 ${isOwn ? "text-right" : ""}`}>
          {formatMessageTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}