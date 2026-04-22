"use client";

import React from "react";
import useSWR from "swr";
import Link from "next/link";
import { fetcher } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Filter, RefreshCw, Eye, AlertTriangle } from "lucide-react";
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
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-sm text-slate-500 mt-1">View and manage all system orders</p>
        </div>
        <button
          onClick={() => mutate()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-500">Filters:</span>
          </div>
          <select
            title="Status filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
          </select>
          <select
            title="Priority filter"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High</option>
            <option value="NORMAL">Normal</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Order ID</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Loading */}
              {isLoading && !orders && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-300" />
                    <p className="text-sm text-slate-400">Loading orders...</p>
                  </td>
                </tr>
              )}
              {/* Error */}
              {error && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-red-400" />
                    <p className="text-sm font-medium text-red-600">Could not connect to backend</p>
                  </td>
                </tr>
              )}
              {/* Empty */}
              {orders && orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="text-slate-400 text-sm">No orders found matching your filters</div>
                  </td>
                </tr>
              )}
              {/* Data */}
              {orders?.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-500">#{order.id.slice(0, 8)}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-900">{order.customerName}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900 tabular-nums">${typeof order.amount === 'number' ? order.amount.toFixed(2) : order.amount}</td>
                  <td className="px-5 py-3.5">
                    <Badge status={order.status}>{order.status}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={cn(
                      "text-xs font-medium px-2 py-1 rounded-md",
                      order.priority === 'HIGH' ? "bg-orange-50 text-orange-700 border border-orange-200" : "bg-slate-50 text-slate-600 border border-slate-200"
                    )}>
                      {order.priority}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
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
