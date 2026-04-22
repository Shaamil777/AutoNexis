"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { LayoutDashboard, ShoppingCart, ListTree, Skull, RefreshCw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import axios from "axios";
import { API_URL } from "@/lib/api";

type DashboardStats = {
  totalOrders: number;
  statusCounts: {
    PENDING: number;
    PROCESSING: number;
    COMPLETED: number;
    FAILED: number;
  };
  eventStats: {
    failedEvents: number;
    dlqEvents: number;
  };
};
export default function DashboardPage() {
  const { data, error, isLoading, mutate } = useSWR<DashboardStats>("/orders/stats", fetcher, {
    refreshInterval: 10000, // Auto-refresh every 10 seconds
  });

  const handleCleanDB = async () => {
    if (confirm("Are you sure you want to PERMANENTLY delete all orders and events? This cannot be undone.")) {
      try {
        await axios.delete(`${API_URL}/orders/clean`);
        alert("Database cleaned successfully!");
        mutate(); // Refresh the stats
      } catch (err) {
        alert("Failed to clean database.");
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-sm font-medium text-slate-500 mt-1.5 uppercase tracking-wide">Real-time system health and analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCleanDB}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-red-600 bg-white border-2 border-red-100 rounded-xl hover:bg-red-50 hover:border-red-200 shadow-sm transition-all active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            Cleanup System
          </button>
          <button
            onClick={() => mutate()}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-700 bg-white border-2 border-slate-100 rounded-xl hover:bg-slate-50 hover:border-slate-200 shadow-sm transition-all active:scale-95"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading ? "animate-spin" : "")} />
            Refresh
          </button>
        </div>
      </div>

      {!data && !error && (
        <div className="h-72 flex items-center justify-center border-2 border-dashed rounded-3xl border-slate-200 bg-slate-50/50">
          <div className="flex flex-col items-center text-slate-400">
            <RefreshCw className="w-10 h-10 animate-spin mb-4" />
            <p className="font-bold uppercase tracking-widest text-xs">Syncing with system...</p>
          </div>
        </div>
      )}

      {error && !data && (
        <div className="p-8 bg-red-50 border-2 border-red-100 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 text-red-800 mb-3">
            <Skull className="w-6 h-6" />
            <h3 className="text-lg font-extrabold uppercase tracking-tight">System Unavailable</h3>
          </div>
          <p className="text-red-700 font-medium mb-6 leading-relaxed">
            The core API endpoint <code>/orders/stats</code> is unreachable. 
            Please ensure your Node.js backend is active and the API contract is implemented.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 opacity-50 pointer-events-none grayscale">
            <MockMetrics />
          </div>
        </div>
      )}

      {data && (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-slate-900">
            <StatCard
              title="Total Orders"
              value={data.totalOrders}
              icon={ShoppingCart}
              color="text-blue-600"
              bg="bg-blue-100/50"
            />
            <StatCard
              title="Failed Events"
              value={data.eventStats.failedEvents}
              icon={ListTree}
              color="text-amber-600"
              bg="bg-amber-100/50"
            />
            <StatCard
              title="DLQ Stalemate"
              value={data.eventStats.dlqEvents}
              icon={Skull}
              color="text-rose-600"
              bg="bg-rose-100/50"
            />
          </div>

          <div className="pt-4">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 px-1">Order Pipeline Distribution</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatusCount label="Pending" count={data.statusCounts.PENDING} status="PENDING" />
              <StatusCount label="Processing" count={data.statusCounts.PROCESSING} status="PROCESSING" />
              <StatusCount label="Completed" count={data.statusCounts.COMPLETED} status="COMPLETED" />
              <StatusCount label="Failed" count={data.statusCounts.FAILED} status="FAILED" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MockMetrics() {
  return (
    <>
      <StatCard title="Total Orders" value={142} icon={ShoppingCart} color="text-gray-500" bg="bg-gray-100" />
      <StatCard title="Failed Events" value={5} icon={ListTree} color="text-gray-500" bg="bg-gray-100" />
      <StatCard title="DLQ Events" value={2} icon={Skull} color="text-gray-500" bg="bg-gray-100" />
    </>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 flex items-start gap-5 transition-all hover:shadow-md hover:border-slate-300">
      <div className={cn("p-4 rounded-xl shadow-inner", bg, color)}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">{title}</p>
        <h3 className="text-3xl font-extrabold text-slate-900 tabular-nums">{value}</h3>
      </div>
    </div>
  );
}

function StatusCount({ label, count, status }: any) {
  return (
    <div className="flex items-center justify-between p-5 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-blue-200 transition-colors">
      <div className="space-y-1">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className="text-2xl font-extrabold text-slate-900 tabular-nums">{count}</div>
      </div>
      <Badge status={status}>{status}</Badge>
    </div>
  );
}
