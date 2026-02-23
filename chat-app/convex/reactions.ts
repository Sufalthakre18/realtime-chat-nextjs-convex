import { v } from "convex/values";
import { mutation, query } from "./_generated/server";


export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    
    const existing = await ctx.db
      .query("reactions")
      .withIndex("by_message_user", (q) =>
        q.eq("messageId", args.messageId).eq("userId", user._id)
      )
      .collect();

    const existingReaction = existing.find((r) => r.emoji === args.emoji);

    if (existingReaction) {
      await ctx.db.delete(existingReaction._id);
    } else {
      await ctx.db.insert("reactions", {
        messageId: args.messageId,
        userId: user._id,
        emoji: args.emoji,
        timestamp: Date.now(),
      });
    }
  },
});

// get reactions for a message
export const getReactions = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
      .collect();

    //group by emoji
    const grouped: Record<string, { count: number; userIds: string[] }> = {};

    for (const reaction of reactions) {
      if (!grouped[reaction.emoji]) {
        grouped[reaction.emoji] = { count: 0, userIds: [] };
      }
      grouped[reaction.emoji].count++;
      grouped[reaction.emoji].userIds.push(reaction.userId);
    }

    return grouped;
  },
});

export const getUserReaction = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;

    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_message_user", (q) =>
        q.eq("messageId", args.messageId).eq("userId", user._id)
      )
      .collect();

    return reactions.map((r) => r.emoji);
  },
});