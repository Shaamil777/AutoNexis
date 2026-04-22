import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  PROCESSING: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
  DLQ: "bg-rose-100 text-rose-800 border-rose-300",
};

const dotColors: Record<string, string> = {
  PENDING: "bg-amber-500",
  PROCESSING: "bg-blue-500",
  COMPLETED: "bg-emerald-500",
  FAILED: "bg-red-500",
  DLQ: "bg-rose-600",
};

export function Badge({ children, status, className }: { children: React.ReactNode; status?: string; className?: string }) {
  const defaultClass = "bg-gray-100 text-gray-700 border-gray-200";
  const style = status ? statusStyles[status] || defaultClass : defaultClass;
  const dot = status ? dotColors[status] : "bg-gray-400";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
        style,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", dot)} />
      {children}
    </span>
  );
}
