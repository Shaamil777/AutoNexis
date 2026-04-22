"use client";

import React, { useState } from "react";
import useSWR from "swr";
import axios from "axios";
import { API_URL, fetcher } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Skull, AlertTriangle, RefreshCw, Send, CheckCircle } from "lucide-react";

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
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Skull className="w-6 h-6 text-rose-500" />
            Dead Letter Queue
          </h1>
          <p className="text-sm text-slate-500 mt-1">Events that failed after maximum retries</p>
        </div>
        <button
          onClick={() => mutate()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Warning Banner */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <p>These events have exceeded the maximum number of retries and require manual intervention. You can retry them individually.</p>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Event</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type / Order</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Error Message</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Failed At</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Loading */}
              {isLoading && !events && (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-300" />
                    <p className="text-sm text-slate-400">Loading DLQ events...</p>
                  </td>
                </tr>
              )}
              {/* Error */}
              {error && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-red-400" />
                    <p className="text-sm font-medium text-red-600">Could not connect to DLQ service</p>
                  </td>
                </tr>
              )}
              {/* Empty - All Clear */}
              {events && events.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-3 border border-emerald-200">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <p className="text-base font-semibold text-slate-900">All Clear</p>
                      <p className="text-sm text-slate-500 mt-1">No failed events in the dead letter queue</p>
                    </div>
                  </td>
                </tr>
              )}
              {/* Data */}
              {events?.map((ev: any) => (
                <tr key={ev.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <Badge status="DLQ">DLQ</Badge>
                    <div className="font-mono text-xs text-slate-400 mt-1.5">#{ev.id}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-900 text-sm">{ev.type}</div>
                    <span className="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-block mt-1.5">
                      Order: {ev.orderId}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-xs text-red-700 font-mono bg-red-50 p-2.5 rounded-lg border border-red-100 max-w-xs break-words leading-relaxed">
                      {ev.lastError || "No error message recorded"}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500">
                    {new Date(ev.updatedAt || ev.lastAttemptAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleRetry(ev.id)}
                      disabled={retryingId === ev.id}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {retryingId === ev.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      {retryingId === ev.id ? "Retrying..." : "Retry"}
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
