"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { MessageSquarePlus, Search } from "lucide-react";
import { useState } from "react";
import ConversationList from "./ConversationList";
import UserSearch from "./UserSearch";
import { Id } from "../../convex/_generated/dataModel";

interface SidebarProps {
  selectedConversationId: Id<"conversations"> | null;
  onSelectConversation: (id: Id<"conversations">) => void;
}

export default function Sidebar({
  selectedConversationId,
  onSelectConversation,
}: SidebarProps) {
  const { user } = useUser();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="shrink-0 border-b border-[#E6E8EC] bg-white">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-10 w-10",
                },
              }}
            />
            <div className="flex flex-col">
              <span className="font-serif font-semibold text-[#2E3440]">
                {user?.fullName || "User"}
              </span>
              <span className="text-xs text-[#2E3440]/60">Online</span>
            </div>
          </div>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 hover:bg-[#F4F6F8] rounded-lg transition-colors group"
            title="New conversation"
          >
            <MessageSquarePlus className="w-5 h-5 text-[#2E3440]/70 group-hover:text-[#8B7CF6]" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2E3440]/40" />
            <input
              type="text"
              placeholder="Search conversations..."
              onClick={() => setIsSearchOpen(true)}
              readOnly
              className="font-normal w-full pl-10 pr-4 py-2.5 bg-[#F4F6F8] border border-[#E6E8EC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B7CF6] focus:border-transparent cursor-pointer hover:bg-[#F4F6F8]/80 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-hidden">
        <ConversationList
          selectedConversationId={selectedConversationId}
          onSelectConversation={onSelectConversation}
        />
      </div>

      {/* User Search Modal */}
      {isSearchOpen && (
        <UserSearch
          onClose={() => setIsSearchOpen(false)}
          onSelectUser={(conversationId) => {
            onSelectConversation(conversationId);
            setIsSearchOpen(false);
          }}
        />
      )}
    </div>
  );
}