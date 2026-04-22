"use client";

import React from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { RefreshCw, Activity, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EventsPage() {
  const { data: events, error, isLoading, mutate } = useSWR(
    "/events",
    fetcher,
    { refreshInterval: 5000 }
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-blue-600" />
            Event Queue
          </h1>
          <p className="text-sm text-slate-500 mt-1">Monitor the async event processing pipeline</p>
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Event Type / ID</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Retry Progress</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Order ID</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Loading */}
              {isLoading && !events && (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-300" />
                    <p className="text-sm text-slate-400">Loading events...</p>
                  </td>
                </tr>
              )}
              {/* Error */}
              {error && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-red-400" />
                    <p className="text-sm font-medium text-red-600">Could not connect to backend</p>
                  </td>
                </tr>
              )}
              {/* Empty */}
              {events && events.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <Activity className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm text-slate-400">No events in the queue</p>
                  </td>
                </tr>
              )}
              {/* Data */}
              {events?.map((ev: any) => (
                <tr key={ev.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-slate-900 text-sm">{ev.type}</div>
                    <div className="font-mono text-xs text-slate-400 mt-0.5">#{ev.id}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge status={ev.status}>{ev.status}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col gap-1.5 max-w-[140px]">
                      <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>Retries</span>
                        <span className="font-medium">{ev.retryCount} / {ev.maxRetries || 3}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-500 rounded-full",
                            ev.retryCount === 0 ? "bg-slate-200" :
                            ev.retryCount >= (ev.maxRetries || 3) ? "bg-red-500" : "bg-blue-500"
                          )} 
                          style={{ width: `${(ev.retryCount / (ev.maxRetries || 3)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2 py-1 rounded">
                      {ev.orderId}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">
                    {ev.lastAttemptAt ? new Date(ev.lastAttemptAt).toLocaleString() : "Waiting..."}
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
