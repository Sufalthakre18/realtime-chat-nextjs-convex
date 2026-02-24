import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { getInitials } from "@/lib/utils";
import OnlineIndicator from "./OnlineIndicator";

interface UserAvatarProps {
  name: string;
  imageUrl?: string;
  isOnline?: boolean;
  size?: "sm" | "md" | "lg";
  showOnline?: boolean;
}

export default function UserAvatar({
  name,
  imageUrl,
  isOnline = false,
  size = "md",
  showOnline = false,
}: UserAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-base",
  };

  return (
    <div className="relative inline-block">
      <Avatar className={`${sizeClasses[size]} rounded-full overflow-hidden bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-2 ring-white shadow-sm`}>
        {imageUrl ? (
          <AvatarImage
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <AvatarFallback className="text-white font-semibold">
            {getInitials(name)}
          </AvatarFallback>
        )}
      </Avatar>
      {showOnline && <OnlineIndicator isOnline={isOnline} size={size} />}
    </div>
  );
}