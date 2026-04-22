import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-800 border-amber-200 shadow-sm shadow-amber-500/10",
  PROCESSING: "bg-blue-50 text-blue-800 border-blue-200 shadow-sm shadow-blue-500/10",
  COMPLETED: "bg-emerald-50 text-emerald-800 border-emerald-200 shadow-sm shadow-emerald-500/10",
  FAILED: "bg-red-50 text-red-800 border-red-200",
  DLQ: "bg-rose-600 text-white border-rose-700 shadow-lg shadow-rose-900/20 font-bold",
};

export function Badge({ children, status, className }: { children: React.ReactNode; status?: string; className?: string }) {
  const defaultClass = "bg-gray-100 text-gray-800 border-gray-200";
  const style = status ? statusStyles[status] || defaultClass : defaultClass;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        style,
        className
      )}
    >
      {children}
    </span>
  );
}
