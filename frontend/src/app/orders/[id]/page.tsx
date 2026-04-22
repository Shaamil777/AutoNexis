"use client";

import React from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, Clock, Activity, FileText, RefreshCw, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function OrderDetailsPage() {
  const { id } = useParams();
  
  const { data: order, error, isLoading } = useSWR(
    `/orders/${id}`,
    fetcher,
    { refreshInterval: 10000 }
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/orders"
          className="p-2.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            Order Details
            {order && <Badge status={order.status}>{order.status}</Badge>}
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">ID: {id}</p>
        </div>
      </div>

      {/* Loading */}
      {isLoading && !order && (
        <div className="p-16 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" />
          <p className="text-sm">Loading order details...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-5 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-3 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p>Could not load order data. Please check if the backend is running.</p>
        </div>
      )}

      {/* Content */}
      {order && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-slate-500 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Order Information
              </h2>
              <dl className="space-y-5">
                <div>
                  <dt className="text-xs text-slate-400 font-medium mb-1">Customer Name</dt>
                  <dd className="font-semibold text-slate-900 text-base">{order.customerName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400 font-medium mb-1">Amount</dt>
                  <dd className="font-bold text-slate-900 text-xl tabular-nums">${parseFloat(order.amount).toFixed(2)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400 font-medium mb-1">Priority</dt>
                  <dd>
                    <span className={cn(
                      "text-xs font-medium px-2.5 py-1 rounded-md inline-block",
                      order.priority === 'HIGH' ? "bg-orange-50 text-orange-700 border border-orange-200" : "bg-slate-50 text-slate-600 border border-slate-200"
                    )}>
                      {order.priority}
                    </span>
                  </dd>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <dt className="text-xs text-slate-400 font-medium mb-1">Created At</dt>
                  <dd className="text-sm text-slate-700">{new Date(order.createdAt).toLocaleString()}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Right Column: Events + Logs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event History */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  Event History
                </h2>
              </div>
              <div>
                {(!order.eventHistory || order.eventHistory.length === 0) && (
                  <div className="p-8 text-center text-sm text-slate-400">No events recorded for this order</div>
                )}
                {order.eventHistory && order.eventHistory.length > 0 && (
                  <ul className="divide-y divide-slate-100">
                    {order.eventHistory.map((event: any, i: number) => (
                      <li key={i} className="p-4 flex flex-col sm:flex-row gap-3 justify-between hover:bg-slate-50 transition-colors">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-slate-900">{event.type}</span>
                            <Badge status={event.status}>{event.status}</Badge>
                            {event.retryCount > 0 && (
                              <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                                {event.retryCount} retries
                              </span>
                            )}
                          </div>
                          {event.error && (
                            <p className="text-xs text-red-600 font-mono bg-red-50 p-2 rounded-lg border border-red-100 leading-relaxed">
                              {event.error}
                            </p>
                          )}
                          {event.lastAttemptAt && (
                            <p className="text-xs text-slate-400">
                              Last attempt: {new Date(event.lastAttemptAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5 whitespace-nowrap self-start">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(event.timestamp || event.createdAt).toLocaleString()}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* System Logs (Terminal Style) */}
            <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
              <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50 flex items-center justify-between">
                <h2 className="text-xs font-medium text-slate-400 font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-dot" />
                  System Logs
                </h2>
                <span className="text-[10px] text-blue-400 font-medium">Live</span>
              </div>
              <div className="p-4 h-72 overflow-y-auto font-mono text-xs text-slate-400 space-y-2 custom-scrollbar">
                {(!order.logs || order.logs.length === 0) && (
                  <div className="text-slate-600 italic">Waiting for log output...</div>
                )}
                {order.logs?.map((log: any, i: number) => (
                  <div key={i} className="flex gap-3 border-l-2 border-slate-700 pl-3 hover:border-blue-500 transition-colors">
                    <span className="text-slate-600 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                    <span className={cn(
                      "font-semibold shrink-0",
                      log.level === 'ERROR' ? 'text-red-400' : 'text-blue-400'
                    )}>{log.source}:</span>
                    <span className="text-slate-300 leading-relaxed">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
