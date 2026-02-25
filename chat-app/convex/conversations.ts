import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUserConversations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const conversations = await ctx.db.query("conversations").collect();
    
    const userConversations = conversations.filter((conv) =>
      conv.participants.includes(user._id)
    );

    // Get ALL messages ONCE
    const allMessages = await ctx.db.query("messages").collect();

    const complete = await Promise.all(
      userConversations.map(async (conv) => {
        // Calculate unread for THIS conversation
        const convMessages = allMessages.filter(m => m.conversationId === conv._id);
        const unreadCount = convMessages.filter(
          msg => !msg.readBy.includes(user._id) && msg.senderId !== user._id
        ).length;

        if (conv.isGroup) {
          return {
            _id: conv._id,
            _creationTime: conv._creationTime,
            isGroup: true,
            name: conv.name || "Group Chat",
            imageUrl: undefined,
            isOnline: false,
            lastMessageAt: conv.lastMessageAt,
            lastMessagePreview: conv.lastMessagePreview,
            unreadCount,
          };
        }
        
        const otherUserId = conv.participants.find((id) => id !== user._id);
        if (otherUserId) {
          const otherUser = await ctx.db.get(otherUserId);
          return {
            _id: conv._id,
            _creationTime: conv._creationTime,
            isGroup: false,
            name: otherUser?.name || "Unknown",
            imageUrl: otherUser?.imageUrl,
            isOnline: otherUser?.isOnline || false,
            lastMessageAt: conv.lastMessageAt,
            lastMessagePreview: conv.lastMessagePreview,
            unreadCount,
          };
        }
        
        return {
          _id: conv._id,
          _creationTime: conv._creationTime,
          isGroup: false,
          name: "Chat",
          imageUrl: undefined,
          isOnline: false,
          lastMessageAt: conv.lastMessageAt,
          lastMessagePreview: conv.lastMessagePreview,
          unreadCount,
        };
      })
    );

    return complete.sort((a, b) => {
      const aTime = a.lastMessageAt || 0;
      const bTime = b.lastMessageAt || 0;
      return bTime - aTime;
    });
  },
});

export const getConversationWithDetails = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return null;

    const participants = await Promise.all(
      conversation.participants.map((id) => ctx.db.get(id))
    );

    return {
      ...conversation,
      participantDetails: participants.filter((p) => p !== null),
    };
  },
});

export const createOrGetConversation = mutation({
  args: { otherUserId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) throw new Error("User not found");

    const existingConversations = await ctx.db.query("conversations").collect();
    
    const existing = existingConversations.find(
      (conv) =>
        !conv.isGroup &&
        conv.participants.length === 2 &&
        conv.participants.includes(currentUser._id) &&
        conv.participants.includes(args.otherUserId)
    );

    if (existing) return existing._id;

    const conversationId = await ctx.db.insert("conversations", {
      isGroup: false,
      participants: [currentUser._id, args.otherUserId],
      createdBy: currentUser._id,
    });

    return conversationId;
  },
});

export const createGroupConversation = mutation({
  args: {
    name: v.string(),
    participantIds: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) throw new Error("User not found");

    const participants = args.participantIds.includes(currentUser._id)
      ? args.participantIds
      : [currentUser._id, ...args.participantIds];

    const conversationId = await ctx.db.insert("conversations", {
      name: args.name,
      isGroup: true,
      participants,
      createdBy: currentUser._id,
    });

    return conversationId;
  },
});