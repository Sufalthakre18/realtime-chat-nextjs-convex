"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export default function ChatLayout() {
  const [selectedConversationId, setSelectedConversationId] = useState<Id<"conversations"> | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);
  const updateOnlineStatus = useMutation(api.users.updateOnlineStatus);

  // update online status 
  useEffect(() => {
    if (!currentUser) return;

    updateOnlineStatus({ isOnline: true });

    const interval = setInterval(() => {
      updateOnlineStatus({ isOnline: true });
    }, 30000); // heartbeat every 30 seconds

    return () => {
      clearInterval(interval);
      updateOnlineStatus({ isOnline: false });
    };
  }, [currentUser, updateOnlineStatus]);

  const handleSelectConversation = (conversationId: Id<"conversations">) => {
    setSelectedConversationId(conversationId);
    setIsMobileMenuOpen(false);
  };

  const handleBackToList = () => {
    setSelectedConversationId(null);
    setIsMobileMenuOpen(true);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50">
     
      <div
        className={`
          ${selectedConversationId ? "hidden" : "flex"} 
          lg:flex
          w-full lg:w-80 xl:w-96
          shrink-0
          border-r border-slate-200
          bg-white
        `}
      >
        <Sidebar
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      {/* chat area*/}
      <div
        className={`
          ${!selectedConversationId ? "hidden" : "flex"}
          lg:flex
          flex-1
          w-full
        `}
      >
        <ChatArea
          conversationId={selectedConversationId}
          onBack={handleBackToList}
        />
      </div>
    </div>
  );
}