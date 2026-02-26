"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";

export default function ChatLayout() {
  const [selectedConversationId, setSelectedConversationId] =
    useState<Id<"conversations"> | null>(null);
  const currentUser = useQuery(api.users.getCurrentUser);

  if (!currentUser) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F4F6F8]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B7CF6]"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-[#F4F6F8]">
      {/* Sidebar - Fixed width on desktop */}
      <div
        className={`
          ${selectedConversationId ? "hidden lg:flex" : "flex"} 
          w-full lg:w-80 xl:w-96
          shrink-0 
          border-r border-[#E6E8EC] bg-white
        `}
      >
        <Sidebar
          selectedConversationId={selectedConversationId}
          onSelectConversation={(id) => setSelectedConversationId(id)}
        />
      </div>

      {/* Chat Area - Takes remaining space */}
      <div className="hidden lg:flex flex-1">
        <ChatArea
          conversationId={selectedConversationId}
          onBack={() => setSelectedConversationId(null)}
        />
      </div>

      {/* Mobile Chat Area - Full screen on mobile */}
      {selectedConversationId && (
        <div className="flex lg:hidden w-full">
          <ChatArea
            conversationId={selectedConversationId}
            onBack={() => setSelectedConversationId(null)}
          />
        </div>
      )}
    </div>
  );
}