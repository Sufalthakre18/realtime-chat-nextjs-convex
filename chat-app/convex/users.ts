import { v } from "convex/values";
import { mutation, query } from "./_generated/server";


export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return user;
  },
});


export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// get all users except current user
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) return [];

    const allUsers = await ctx.db.query("users").collect();
    
    return allUsers.filter((user) => user._id !== currentUser._id);
  },
});


export const searchUsers = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) return [];

    const allUsers = await ctx.db.query("users").collect();
    
    return allUsers
      .filter((user) => user._id !== currentUser._id)
      .filter((user) =>
        user.name.toLowerCase().includes(args.searchTerm.toLowerCase())
      );
  },
});

// create or update user
export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        lastSeen: Date.now(),
      });
      return existingUser._id;
    } else {
      // create new user
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        isOnline: false,
        lastSeen: Date.now(),
      });
      return userId;
    }
  },
});


export const deleteUser = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (user) {
      await ctx.db.delete(user._id);
    }
  },
});

export const updateOnlineStatus = mutation({
  args: { isOnline: v.boolean() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      isOnline: args.isOnline,
      lastSeen: Date.now(),
    });
  },
});

export const getOnlineUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .withIndex("by_online", (q) => q.eq("isOnline", true))
      .collect();
  },
});