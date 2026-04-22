"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { LayoutDashboard, ShoppingCart, ListTree, Skull, RefreshCw, Trash2, TrendingUp, AlertTriangle } from "lucide-react";
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
    refreshInterval: 10000,
  });

  const handleCleanDB = async () => {
    if (confirm("Are you sure you want to delete all orders and events? This cannot be undone.")) {
      try {
        await axios.delete(`${API_URL}/orders/clean`);
        alert("Database cleaned successfully!");
        mutate();
      } catch (err) {
        alert("Failed to clean database.");
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time system health overview</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCleanDB}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clean Database
          </button>
          <button
            onClick={() => mutate()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading ? "animate-spin" : "")} />
            Refresh
          </button>
        </div>
      </div>

      {/* Loading State */}
      {!data && !error && (
        <div className="h-64 flex items-center justify-center border border-dashed rounded-xl border-slate-200 bg-white">
          <div className="flex flex-col items-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mb-3" />
            <p className="text-sm font-medium">Loading dashboard data...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !data && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-3 text-red-700 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-semibold">Cannot connect to backend</h3>
          </div>
          <p className="text-red-600 text-sm leading-relaxed">
            The API endpoint <code className="bg-red-100 px-1.5 py-0.5 rounded text-xs">/orders/stats</code> is unreachable. 
            Please make sure the backend server is running.
          </p>
        </div>
      )}

      {/* Dashboard Content */}
      {data && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <StatCard
              title="Total Orders"
              value={data.totalOrders}
              icon={ShoppingCart}
              color="text-blue-600"
              bgColor="bg-blue-50"
              borderColor="border-blue-100"
            />
            <StatCard
              title="Failed Events"
              value={data.eventStats.failedEvents}
              icon={AlertTriangle}
              color="text-amber-600"
              bgColor="bg-amber-50"
              borderColor="border-amber-100"
            />
            <StatCard
              title="DLQ Events"
              value={data.eventStats.dlqEvents}
              icon={Skull}
              color="text-rose-600"
              bgColor="bg-rose-50"
              borderColor="border-rose-100"
            />
          </div>

          {/* Order Status Distribution */}
          <div>
            <h2 className="text-base font-semibold text-slate-800 mb-4">Order Status Breakdown</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

function StatCard({ title, value, icon: Icon, color, bgColor, borderColor }: any) {
  return (
    <div className={cn("bg-white rounded-xl border p-6 flex items-start gap-4 transition-all hover:shadow-sm", borderColor || "border-slate-200")}>
      <div className={cn("p-3 rounded-lg", bgColor, color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-0.5 tabular-nums">{value}</h3>
      </div>
    </div>
  );
}

function StatusCount({ label, count, status }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 hover:shadow-sm transition-all">
      <div>
        <span className="text-sm text-slate-500 font-medium">{label}</span>
        <div className="text-xl font-bold text-slate-900 mt-0.5 tabular-nums">{count}</div>
      </div>
      <Badge status={status}>{status}</Badge>
    </div>
  );
}
