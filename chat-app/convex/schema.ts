import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // users table - synced from Clerk
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    isOnline: v.boolean(),
    lastSeen: v.number(),
  }).index("by_clerk_id", ["clerkId"]).index("by_online", ["isOnline"]),

  // conversations table - both 1-on-1 and group chats
  conversations: defineTable({
    name: v.optional(v.string()), 
    isGroup: v.boolean(),
    participants: v.array(v.id("users")),
    createdBy: v.id("users"),
    lastMessageAt: v.optional(v.number()),
    lastMessagePreview: v.optional(v.string()),
  }).index("by_participant", ["participants"]).index("by_last_message", ["lastMessageAt"]),

  // messages table
  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    timestamp: v.number(),
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),
    readBy: v.array(v.id("users")), 
  }).index("by_conversation", ["conversationId"]).index("by_conversation_timestamp", ["conversationId", "timestamp"]),

  // message Reactions
  reactions: defineTable({
    messageId: v.id("messages"),
    userId: v.id("users"),
    emoji: v.string(), // "👍", "❤️", "😂", "😮", "😢"
    timestamp: v.number(),
  }).index("by_message", ["messageId"]).index("by_message_user", ["messageId", "userId"]),

  
  typingIndicators: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    timestamp: v.number(),
  }).index("by_conversation", ["conversationId"]).index("by_conversation_user", ["conversationId", "userId"]),

  
  presence: defineTable({
    userId: v.id("users"),
    isOnline: v.boolean(),
    lastSeen: v.number(),
  }).index("by_user", ["userId"]).index("by_online", ["isOnline"]),
});