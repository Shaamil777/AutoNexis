"use client";

import React from "react";
import useSWR from "swr";
import Link from "next/link";
import { fetcher } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Search, Filter, RefreshCw, Eye, Skull } from "lucide-react";
import { cn } from "@/lib/utils";

type Order = {
  id: string;
  customerName: string;
  amount: number;
  status: string;
  priority: string;
  createdAt: string;
};

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = React.useState<string>("ALL");

  const queryParams = new URLSearchParams();
  if (statusFilter !== "ALL") queryParams.append("status", statusFilter);
  if (priorityFilter !== "ALL") queryParams.append("priority", priorityFilter);
  
  const { data: orders, error, isLoading, mutate } = useSWR<Order[]>(
    `/orders?${queryParams.toString()}`,
    fetcher,
    { refreshInterval: 10000 }
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Orders</h1>
          <p className="text-sm font-medium text-slate-500 mt-1.5 uppercase tracking-wide">Manage and audit system order flow</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => mutate()}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-700 bg-white border-2 border-slate-100 rounded-xl hover:bg-slate-50 hover:border-slate-200 shadow-sm transition-all active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Sync Orders
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-5 items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-lg shadow-sm">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                title="Status filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-bold text-slate-700 outline-none cursor-pointer bg-transparent"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-lg shadow-sm">
              <select
                title="Priority filter"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-xs font-bold text-slate-700 outline-none cursor-pointer bg-transparent"
              >
                <option value="ALL">All Priorities</option>
                <option value="HIGH">High Priority</option>
                <option value="NORMAL">Normal</option>
                <option value="LOW">Low Priority</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Order Ref</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Customer</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Revenue</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Status</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Tier</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Timestamp</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading && !orders && (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-slate-300" />
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Retrieving system records...</p>
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-red-500 font-bold bg-red-50/30">
                    <Skull className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    Connection Error: Backend unreachable
                  </td>
                </tr>
              )}
              {orders && orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">No matching orders found</p>
                  </td>
                </tr>
              )}
              {orders?.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs text-slate-400 group-hover:text-slate-900 transition-colors">#{order.id.slice(0, 8)}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{order.customerName}</div>
                  </td>
                  <td className="px-6 py-4 font-extrabold text-slate-900">${typeof order.amount === 'number' ? order.amount.toFixed(2) : order.amount}</td>
                  <td className="px-6 py-4">
                    <Badge status={order.status}>{order.status}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md",
                      order.priority === 'HIGH' ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-600"
                    )}>
                      {order.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-all active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
