import { MessageSquare, Users, Search } from "lucide-react";

interface EmptyStateProps {
  type: "no-conversations" | "no-messages" | "no-search-results";
}

export default function EmptyState({ type }: EmptyStateProps) {
  const states = {
    "no-conversations": {
      icon: MessageSquare,
      title: "No conversations yet",
      description: "Start a conversation by searching for users above",
    },
    "no-messages": {
      icon: MessageSquare,
      title: "No messages yet",
      description: "Send a message to start the conversation",
    },
    "no-search-results": {
      icon: Search,
      title: "No users found",
      description: "Try searching with a different name",
    },
  };

  const state = states[type];
  const Icon = state.icon;

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-20 h-20 bg-linear-to-br from-[#8B7CF6]/20 to-[#2E3440]/20 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-10 h-10 text-[#8B7CF6]" />
      </div>
      <h3 className="text-lg font-semibold text-[#2E3440] mb-2">
        {state.title}
      </h3>
      <p className="text-sm text-[#2E3440]/60 max-w-sm">{state.description}</p>
    </div>
  );
}