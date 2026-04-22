"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, ListTree, Skull, PlusCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Orders", href: "/orders", icon: ShoppingCart },
  { name: "Event Queue", href: "/events", icon: ListTree },
  { name: "Dead Letter Queue", href: "/dlq", icon: Skull },
  { name: "Create Order", href: "/create", icon: PlusCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col fixed inset-y-0 z-50 shadow-sm font-sans">
      {/* Logo */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-sm select-none">A</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Autonexis</h1>
            <p className="text-[11px] text-slate-400 font-medium">System Control Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Navigation</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
              )}
            >
              <Icon className={cn("w-[18px] h-[18px]", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-400">
          <Settings className="w-3.5 h-3.5" />
          <span>v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
