import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ChatLayout from "@/components/ChatLayout";

export default async function ChatPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <ChatLayout />;
}