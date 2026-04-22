"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, ListTree, Skull, PlusCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Orders", href: "/orders", icon: ShoppingCart },
  { name: "Events Queue", href: "/events", icon: ListTree },
  { name: "DLQ View", href: "/dlq", icon: Skull },
  { name: "Create Order", href: "/create", icon: PlusCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col fixed inset-y-0 z-50 shadow-xl font-sans">
      <div className="p-6 border-b border-slate-800/60">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-extrabold text-xs select-none">A</span>
          </div>
          <span className="tracking-wide">Autonexis</span>
        </h1>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-2 ml-9">System Control</p>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 group",
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              )}
            >
              <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-white" : "text-slate-500 group-hover:text-blue-400")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <Settings className="w-4 h-4" />
          <span>Version 1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
