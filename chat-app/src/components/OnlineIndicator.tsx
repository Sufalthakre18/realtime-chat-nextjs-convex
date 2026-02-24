interface OnlineIndicatorProps {
  isOnline: boolean;
  size?: "sm" | "md" | "lg";
}

export default function OnlineIndicator({
  isOnline,
  size = "md",
}: OnlineIndicatorProps) {
  if (!isOnline) return null;

  const sizeClasses = {
    sm: "h-2 w-2 -bottom-0 -right-0",
    md: "h-3 w-3 -bottom-0.5 -right-0.5",
    lg: "h-3.5 w-3.5 -bottom-1 -right-1",
  };

  return (
    <span
      className={`absolute ${sizeClasses[size]} bg-emerald-500 border-2 border-white rounded-full animate-pulse`}
    />
  );
}