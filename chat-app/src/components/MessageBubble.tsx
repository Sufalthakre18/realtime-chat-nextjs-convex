// src/components/MessageBubble.tsx
"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { formatMessageTime } from "@/lib/utils";
import UserAvatar from "./UserAvatar";
import ReactionPicker from "./ReactionPicker";
import { Smile, Trash2, MoreVertical } from "lucide-react";

interface MessageBubbleProps {
  message: any;
  isOwn: boolean;
  sender: any;
  showAvatar: boolean;
  conversationId: Id<"conversations">;
}

export default function MessageBubble({
  message,
  isOwn,
  sender,
  showAvatar,
  conversationId,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const reactions = useQuery(api.reactions.getReactions, {
    messageId: message._id,
  });

  const handleDelete = async () => {
    if (confirm("Delete this message?")) {
      await deleteMessage({ messageId: message._id });
    }
  };

  return (
    <div
      className={`flex gap-3 group ${isOwn ? "flex-row-reverse" : "flex-row"}`}
      onMouseEnter={() => setShowActions(true)}
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

      {/* message Content */}
      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[70%]`}>
        {/* sender name (for group chats) */}
        {!isOwn && showAvatar && (
          <span className="text-xs font-semibold text-slate-600 mb-1 px-3">
            {sender?.name}
          </span>
        )}

        <div className="relative">
          {/* message bubble */}
          <div
            className={`
              px-4 py-2.5 rounded-2xl shadow-sm
              ${
                isOwn
                  ? "bg-linear-to-br from-indigo-600 to-indigo-700 text-white"
                  : "bg-white text-slate-900 border border-slate-200"
              }
              ${message.isDeleted ? "italic opacity-75" : ""}
            `}
          >
            {message.isDeleted ? (
              <span className="text-sm">This message was deleted</span>
            ) : (
              <p className="text-sm leading-relaxed wrap-break-word whitespace-pre-wrap">
                {message.content}
              </p>
            )}
          </div>

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
                className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                title="React"
              >
                <Smile className="w-4 h-4 text-slate-600" />
              </button>

              {isOwn && (
                <button
                  onClick={handleDelete}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              )}
            </div>
          )}

         
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

        
        {reactions && Object.keys(reactions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(reactions).map(([emoji, data]: [string, any]) => (
              <button
                key={emoji}
                onClick={() => setShowReactionPicker(true)}
                className="px-2 py-1 bg-white border border-slate-200 rounded-full text-xs flex items-center gap-1 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <span>{emoji}</span>
                <span className="text-slate-600 font-medium">{data.count}</span>
              </button>
            ))}
          </div>
        )}

     
        <span className={`text-xs text-slate-500 mt-1 px-1 ${isOwn ? "text-right" : ""}`}>
          {formatMessageTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}