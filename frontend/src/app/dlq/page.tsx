"use client";

import React, { useState } from "react";
import useSWR from "swr";
import axios from "axios";
import { API_URL, fetcher } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Skull, AlertTriangle, RefreshCw, Send } from "lucide-react";

export default function DLQPage() {
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const { data: events, error, isLoading, mutate } = useSWR(
    "/events/dlq",
    fetcher,
    { refreshInterval: 10000 }
  );

  const handleRetry = async (eventId: string) => {
    try {
      setRetryingId(eventId);
      await axios.post(`${API_URL}/events/${eventId}/retry`);
      await mutate();
    } catch (err) {
      alert("Failed to trigger retry. Check console for details.");
      console.error(err);
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <Skull className="w-8 h-8 text-rose-600" />
            Dead Letter Queue
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1.5 uppercase tracking-wide">Critical failures requiring manual intervention</p>
        </div>
        <button
          onClick={() => mutate()}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-700 bg-white border-2 border-slate-100 rounded-xl hover:bg-slate-50 hover:border-slate-200 shadow-sm transition-all active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Sync DLQ
        </button>
      </div>

      <div className="bg-white rounded-3xl border-2 border-rose-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-rose-100 bg-rose-50/50 flex items-center gap-3 text-rose-900 text-xs font-black uppercase tracking-[0.1em]">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          Attention: These events have exceeded maximum retries and are halted
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-slate-400">Event Signature</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-slate-400">Context</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-slate-400">Failure Logic</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-slate-400">Halted At</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-slate-400 text-right">Intervention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading && !events && (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center">
                    <RefreshCw className="w-10 h-10 animate-spin mx-auto mb-4 text-slate-300" />
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 tracking-widest">Scanning death letters...</p>
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-rose-600 font-bold bg-rose-50/30">
                    <Skull className="w-6 h-6 mx-auto mb-2" />
                    Diagnostic Error: DLQ service unreachable
                  </td>
                </tr>
              )}
              {events && events.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-28 text-center bg-slate-50/20">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <p className="text-lg font-black text-slate-900 tracking-tight">Queue is Fully Operational</p>
                      <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-wide">No critical failures detected at this time</p>
                    </div>
                  </td>
                </tr>
              )}
              {events?.map((ev: any) => (
                <tr key={ev.id} className="hover:bg-rose-50/20 transition-colors group">
                  <td className="px-6 py-5">
                    <Badge className="font-black tracking-widest" status="DLQ">DLQ</Badge>
                    <div className="font-mono text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-tighter shrink-0">ID: {ev.id}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="font-black text-slate-900 uppercase tracking-tight text-sm">{ev.type}</div>
                    <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-block mt-2">OID-{ev.orderId}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-[11px] text-rose-700 font-mono bg-rose-50/80 p-3 rounded-xl border border-rose-100 max-w-xs break-words font-medium italic underline decoration-rose-200 decoration-2">
                      &quot;{ev.lastError || "CRITICAL_INTERNAL_TIMEOUT"}&quot;
                    </div>
                  </td>
                  <td className="px-6 py-5 text-xs font-bold text-slate-600">
                    {new Date(ev.updatedAt || ev.lastAttemptAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button
                      onClick={() => handleRetry(ev.id)}
                      disabled={retryingId === ev.id}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white bg-slate-950 hover:bg-blue-600 rounded-xl transition-all shadow-lg shadow-slate-900/10 active:scale-95 disabled:opacity-40"
                    >
                      {retryingId === ev.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      {retryingId === ev.id ? "Processing" : "Trigger Retry"}
                    </button>
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
