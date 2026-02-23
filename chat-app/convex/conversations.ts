
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

    // sort by last message time
    return userConversations.sort((a, b) => {
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

// create or get existing 1-on-1 conversation
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

    if (existing) {
      return existing._id;
    }

    
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

    // addd current user to participants if not included
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


export const getUnreadCount = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return 0;

    
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    // count messages not read by current user and not sent by current user
    const unreadCount = messages.filter(
      (msg) => !msg.readBy.includes(user._id) && msg.senderId !== user._id
    ).length;

    return unreadCount;
  },
});

// get total unread count across all conversations
export const getTotalUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return 0;

    const conversations = await ctx.db.query("conversations").collect();
    const userConversations = conversations.filter((conv) =>
      conv.participants.includes(user._id)
    );

    let totalUnread = 0;

    for (const conv of userConversations) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
        .collect();

      const unreadInConv = messages.filter(
        (msg) => !msg.readBy.includes(user._id) && msg.senderId !== user._id
      ).length;

      totalUnread += unreadInConv;
    }

    return totalUnread;
  },
});