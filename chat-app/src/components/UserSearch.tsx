"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { X, Search, Users as UsersIcon } from "lucide-react";
import UserAvatar from "./UserAvatar";
import EmptyState from "./EmptyState";
import { Id } from "../../convex/_generated/dataModel";

interface UserSearchProps {
  onClose: () => void;
  onSelectUser: (conversationId: Id<"conversations">) => void;
}

export default function UserSearch({ onClose, onSelectUser }: UserSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Id<"users">[]>([]);

  const allUsers = useQuery(api.users.getAllUsers);
  const searchResults = useQuery(
    api.users.searchUsers,
    searchTerm ? { searchTerm } : "skip"
  );
  const createOrGetConversation = useMutation(api.conversations.createOrGetConversation);
  const createGroupConversation = useMutation(api.conversations.createGroupConversation);

  const displayUsers = searchTerm ? searchResults : allUsers;

  const handleSelectUser = async (userId: Id<"users">) => {
    if (isCreatingGroup) {
      setSelectedUsers((prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId)
          : [...prev, userId]
      );
    } else {
      const conversationId = await createOrGetConversation({ otherUserId: userId });
      onSelectUser(conversationId);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length < 2) return;
    
    const conversationId = await createGroupConversation({
      name: groupName,
      participantIds: selectedUsers,
    });
    onSelectUser(conversationId);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#E6E8EC]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold font-serif text-[#2E3440]">
              {isCreatingGroup ? "Create Group" : "New Conversation"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#F4F6F8] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[#2E3440]/70" />
            </button>
          </div>

          {/* Group Toggle */}
          <button
            onClick={() => {
              setIsCreatingGroup(!isCreatingGroup);
              setSelectedUsers([]);
              setGroupName("");
            }}
            className="font-mono w-full mb-4 px-4 py-2 bg-[#8B7CF6]/10 text-[#8B7CF6] rounded-lg hover:bg-[#8B7CF6]/20 transition-colors flex items-center justify-center gap-2"
          >
            <UsersIcon className="w-4 h-4" />
            {isCreatingGroup ? "Cancel Group Creation" : "Create Group Chat"}
          </button>

          {/* Group Name Input */}
          {isCreatingGroup && (
            <input
              type="text"
              placeholder="Group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full mb-4 px-4 py-2.5 border border-[#E6E8EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7CF6]"
            />
          )}

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2E3440]/40" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#F4F6F8] border border-[#E6E8EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7CF6] focus:bg-white"
              autoFocus
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-4">
          {displayUsers === undefined ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B7CF6]"></div>
            </div>
          ) : displayUsers.length === 0 ? (
            <EmptyState type="no-search-results" />
          ) : (
            <div className="space-y-2">
              {displayUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleSelectUser(user._id)}
                  className={`
                    w-full p-3 flex items-center gap-3 rounded-lg hover:bg-[#F4F6F8] transition-colors border-2
                    ${
                      isCreatingGroup && selectedUsers.includes(user._id)
                        ? "bg-[#E5E9F0] border-[#2E3440]"
                        : "border-transparent"
                    }
                  `}
                >
                  <UserAvatar
                    name={user.name}
                    imageUrl={user.imageUrl}
                    isOnline={user.isOnline}
                    showOnline
                  />
                  <div className="flex-1 text-left">
                    <p className="font-serif font-semibold text-[#2E3440]">{user.name}</p>
                    <p className="text-sm text-[#2E3440]/60">{user.email}</p>
                  </div>
                  {isCreatingGroup && selectedUsers.includes(user._id) && (
                    <div className="w-5 h-5 bg-[#8B7CF6] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Create Group Button */}
        {isCreatingGroup && selectedUsers.length >= 2 && (
          <div className="p-4 border-t border-[#E6E8EC]">
            <button
              onClick={handleCreateGroup}
              disabled={!groupName.trim()}
              className="w-full py-3 bg-[#8B7CF6] text-white rounded-lg hover:bg-[#8B7CF6]/90 disabled:bg-[#2E3440]/20 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              Create Group ({selectedUsers.length} members)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}