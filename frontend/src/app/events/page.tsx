"use client";

import React from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { RefreshCw, Activity, ArrowRight, Skull } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EventsPage() {
  const { data: events, error, isLoading, mutate } = useSWR(
    "/events",
    fetcher,
    { refreshInterval: 5000 } // Faster refresh for queue
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600" />
            Events Queue
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1.5 uppercase tracking-wide">Live asynchronous processing pipeline</p>
        </div>
        <button
          onClick={() => mutate()}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-700 bg-white border-2 border-slate-100 rounded-xl hover:bg-slate-50 hover:border-slate-200 shadow-sm transition-all active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Sync Queue
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Event Identity</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Status</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Retry Progress</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Order Context</th>
                <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-slate-400">Activity Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading && !events && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-slate-300" />
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Monitoring queue state...</p>
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-red-500 font-bold bg-red-50/30">
                    <Skull className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    Connection Error: Logic layer unreachable
                  </td>
                </tr>
              )}
              {events && events.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Activity className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Pipeline is idle</p>
                  </td>
                </tr>
              )}
              {events?.map((ev: any) => (
                <tr key={ev.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight text-sm">{ev.type}</div>
                    <div className="font-mono text-[10px] text-slate-400 mt-1">#{ev.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge status={ev.status}>{ev.status}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2 max-w-[120px]">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <span>Attempts</span>
                        <span>{ev.retryCount}/{ev.maxRetries || 3}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                        <div 
                          className={cn(
                            "h-full transition-all duration-500 rounded-full",
                            ev.retryCount === 0 ? "bg-slate-200" : "bg-blue-600"
                          )} 
                          style={{ width: `${(ev.retryCount / (ev.maxRetries || 3)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md">
                      OID-{ev.orderId}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-500 italic">
                    {ev.lastAttemptAt ? new Date(ev.lastAttemptAt).toLocaleString() : "Awaiting initial attempt"}
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
