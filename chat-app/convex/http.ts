import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// clerk webhook to sync users
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = await request.json();
      const eventType = payload.type;

      switch (eventType) {
        case "user.created":
        case "user.updated":
          await ctx.runMutation(api.users.upsertUser, {
            clerkId: payload.data.id,
            email: payload.data.email_addresses[0]?.email_address || "",
            name:
              payload.data.first_name && payload.data.last_name
                ? `${payload.data.first_name} ${payload.data.last_name}`
                : payload.data.username || "User",
            imageUrl: payload.data.image_url,
          });
          break;

        case "user.deleted":
          await ctx.runMutation(api.users.deleteUser, {
            clerkId: payload.data.id,
          });
          break;
      }

      return new Response(null, { status: 200 });
    } catch (error) {
      console.error("Webhook error:", error);
      return new Response("Webhook error", { status: 500 });
    }
  }),
});

export default http;