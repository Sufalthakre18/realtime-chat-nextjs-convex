"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ArrowLeft, MoreVertical, Users } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import UserAvatar from "./UserAvatar";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import EmptyState from "./EmptyState";
import { ChevronDown } from "lucide-react";

interface ChatAreaProps {
  conversationId: Id<"conversations"> | null;
  onBack: () => void;
}

export default function ChatArea({ conversationId, onBack }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const markAsRead = useMutation(api.messages.markAsRead);

  const currentUser = useQuery(api.users.getCurrentUser);
  const conversation = useQuery(
    api.conversations.getConversationWithDetails,
    conversationId ? { conversationId } : "skip"
  );
  const messages = useQuery(
    api.messages.getMessages,
    conversationId ? { conversationId } : "skip"
  );

  useEffect(() => {
    if (conversationId) {
      const timer = setTimeout(() => {
        markAsRead({ conversationId }).catch(() => { });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [conversationId, markAsRead]);

  useEffect(() => {
    if (!messages || messages.length === 0) return;

    const container = messagesContainerRef.current;
    if (!container) return;

    const isScrolledToBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    if (!isUserScrolling || isScrolledToBottom) {
      scrollToBottom();
      setShowScrollButton(false);
    } else {
      setShowScrollButton(true);
    }
  }, [messages, isUserScrolling]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setIsUserScrolling(false);
    setShowScrollButton(false);
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isScrolledToBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    if (isScrolledToBottom) {
      setIsUserScrolling(false);
      setShowScrollButton(false);
    } else {
      setIsUserScrolling(true);
    }
  };

  if (!conversationId) {
    return (
      <div
        className="authdiv h-full w-full flex items-center justify-center bg-cover bg-center"
      
      >

        <div className="text-center backdrop-blur-sm bg-white/60 p-8 rounded-2xl">
          <div className="w-24 h-24 bg-[#397d7f] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Users className="w-12 h-12 text-white" />
          </div>

          <h3 className="font-serif text-2xl font-bold text-[#2E3440] mb-2">
            Welcome to Chat
          </h3>

          <p className="font-mono text-[#2E3440]/70">
            Select a conversation to start messaging
          </p>
        </div>
      </div>
    );
  }

  if (!conversation || !messages || !currentUser) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B7CF6]"></div>
      </div>
    );
  }

  const otherParticipant = conversation.participantDetails.find(
    (p: any) => p._id !== currentUser._id
  );

  const headerName = conversation.isGroup
    ? conversation.name || "Unnamed Group"
    : otherParticipant?.name || "Unknown User";

  const headerSubtitle = conversation.isGroup
    ? `${conversation.participantDetails.length} members`
    : "Chat";

  return (
    <div className="h-full flex flex-col bg-white w-full">
      {/* Header */}
      <div className="shrink-0 border-b border-[#E6E8EC] bg-indigo-600 shadow-sm">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>

            <UserAvatar
              name={headerName}
              imageUrl={!conversation.isGroup ? otherParticipant?.imageUrl : undefined}
              size="md"
            />

            <div>
              <h2 className="font-serif font-semibold text-white">{headerName}</h2>
              <p className="text-sm text-white/70">{headerSubtitle}</p>
            </div>
          </div>

          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-linear-to-b from-[#F4F6F8] to-white"
      >
        {messages.length === 0 ? (
          <EmptyState type="no-messages" />
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwn = message.senderId === currentUser._id;
              const sender = conversation.participantDetails.find(
                (p: any) => p._id === message.senderId
              );

              const showAvatar = !isOwn && (conversation.isGroup || index === 0 || messages[index - 1]?.senderId !== message.senderId);

              return (
                <MessageBubble
                  key={message._id}
                  message={message}
                  isOwn={isOwn}
                  sender={sender}
                  showAvatar={showAvatar}
                  conversationId={conversationId}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <TypingIndicator conversationId={conversationId} />

      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-8 p-3 bg-[#8B7CF6] text-white rounded-full shadow-lg hover:bg-[#8B7CF6]/90 transition-all hover:scale-110 animate-fade-in"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      )}

      <MessageInput conversationId={conversationId} />
    </div>
  );
}