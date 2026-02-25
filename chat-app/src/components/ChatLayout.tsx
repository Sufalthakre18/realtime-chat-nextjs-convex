"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";

export default function ChatLayout() {
  const [selectedConversationId, setSelectedConversationId] = useState<Id<"conversations"> | null>(null);
  const currentUser = useQuery(api.users.getCurrentUser);

  if (!currentUser) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50">
      <div className={`${selectedConversationId ? "hidden" : "flex"} lg:flex w-full lg:w-80 xl:w-96 shrink-0 border-r border-slate-200 bg-white`}>
        <Sidebar
          selectedConversationId={selectedConversationId}
          onSelectConversation={(id) => setSelectedConversationId(id)}
        />
      </div>

      <div className={`${!selectedConversationId ? "hidden" : "flex"} lg:flex flex-1 w-full`}>
        <ChatArea
          conversationId={selectedConversationId}
          onBack={() => setSelectedConversationId(null)}
        />
      </div>
    </div>
  );
}