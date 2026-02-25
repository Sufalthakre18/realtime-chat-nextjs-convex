"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import UserAvatar from "./UserAvatar";
import { formatMessageTime } from "@/lib/utils";
import EmptyState from "./EmptyState";

interface ConversationListProps {
  selectedConversationId: Id<"conversations"> | null;
  onSelectConversation: (id: Id<"conversations">) => void;
}

export default function ConversationList({
  selectedConversationId,
  onSelectConversation,
}: ConversationListProps) {
  const conversations = useQuery(api.conversations.getUserConversations);

  if (conversations === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B7CF6]"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return <EmptyState type="no-conversations" />;
  }

  return (
    <div className="overflow-y-auto h-full">
      {conversations.map((conversation) => (
        <button
          key={conversation._id}
          onClick={() => onSelectConversation(conversation._id)}
          className={`
            w-full p-4 flex items-start gap-3 hover:bg-[#F4F6F8] transition-colors border-l-4 text-left
            ${selectedConversationId === conversation._id ? "bg-[#E5E9F0] border-[#2E3440]" : "border-transparent"}
          `}
        >
          <UserAvatar
            name={conversation.name}
            imageUrl={conversation.imageUrl}
            isOnline={conversation.isOnline}
            showOnline
            size="md"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="font-serif text-[#2E3440] truncate">
                {conversation.name}
              </span>
              {conversation.lastMessageAt && (
                <span className="text-xs font-mono text-[#2E3440]/60 shrink-0 ml-2">
                  {formatMessageTime(conversation.lastMessageAt)}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm font-mono text-[#2E3440]/70 truncate">
                {conversation.lastMessagePreview || "No messages yet"}
              </p>
              {conversation.unreadCount > 0 && (
                <span className="shrink-0 ml-2 bg-[#8B7CF6] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {conversation.unreadCount}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}