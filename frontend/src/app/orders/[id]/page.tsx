"use client";

import React from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, Clock, Activity, FileText, RefreshCw, Skull } from "lucide-react";
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
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-6">
        <Link 
          href="/orders"
          className="p-3 border-2 border-slate-100 rounded-2xl bg-white hover:bg-slate-50 text-slate-600 transition-all active:scale-95 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-4">
            Order Dossier
            {order && <Badge status={order.status}>{order.status}</Badge>}
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1 font-mono">Reference: {id}</p>
        </div>
      </div>

      {isLoading && !order && (
        <div className="p-20 text-center text-slate-400">
          <RefreshCw className="w-10 h-10 animate-spin mx-auto mb-4 opacity-20" />
          <p className="text-xs font-black uppercase tracking-widest">Hydrating data model...</p>
        </div>
      )}

      {error && (
        <div className="p-8 bg-red-50 border-2 border-red-100 rounded-3xl text-red-700 font-bold flex items-center gap-4">
          <Skull className="w-6 h-6 shrink-0" />
          <p>Critical Failure: Order data unavailable on the current network node.</p>
        </div>
      )}

      {order && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 text-slate-900">
          {/* Order Info */}
          <div className="lg:col-span-1 space-y-8 text-slate-900">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 transition-all hover:shadow-md">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                MetaData
              </h2>
              <dl className="space-y-6">
                <div>
                  <dt className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Client Name</dt>
                  <dd className="font-extrabold text-slate-900 text-lg">{order.customerName}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Revenue Volume</dt>
                  <dd className="font-black text-slate-900 text-2xl tracking-tight">${parseFloat(order.amount).toFixed(2)}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Priority Tier</dt>
                  <dd className="inline-block px-3 py-1 bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest rounded-md mt-1">{order.priority}</dd>
                </div>
                <div className="pt-4 border-t border-slate-50">
                  <dt className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Indexed At</dt>
                  <dd className="font-bold text-slate-800 text-sm italic">{new Date(order.createdAt).toLocaleString()}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Event History & Logs */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Processing Trace
                </h2>
              </div>
              <div className="p-0">
                {(!order.eventHistory || order.eventHistory.length === 0) && (
                  <div className="p-10 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No active events in current cycle</div>
                )}
                {order.eventHistory && order.eventHistory.length > 0 && (
                  <ul className="divide-y divide-slate-50">
                    {order.eventHistory.map((event: any, i: number) => (
                      <li key={i} className="p-6 flex flex-col sm:flex-row gap-4 justify-between hover:bg-slate-50/50 transition-colors">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-black text-sm text-slate-900 uppercase tracking-tight">{event.type}</span>
                            <Badge status={event.status}>{event.status}</Badge>
                          </div>
                          {event.error && (
                            <p className="text-[10px] text-red-600 font-mono bg-red-50 p-3 rounded-xl border border-red-100 mt-2 italic shadow-inner">
                              ERROR_LOG: {event.error}
                            </p>
                          )}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 whitespace-nowrap uppercase tracking-widest self-start">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(event.timestamp || event.createdAt).toLocaleString()}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="bg-slate-950 rounded-3xl shadow-xl overflow-hidden border-4 border-slate-900 relative group">
              <div className="absolute top-4 right-4 text-[10px] font-black text-blue-500 uppercase tracking-widest animate-pulse">Live Feed</div>
              <div className="p-5 border-b border-slate-800 bg-slate-900/50">
                <h2 className="text-[10px] font-black text-slate-500 font-mono uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></span>
                  System_Runtime_Logs
                </h2>
              </div>
              <div className="p-8 h-80 overflow-y-auto font-mono text-[11px] text-slate-400 space-y-3 custom-scrollbar">
                {(!order.logs || order.logs.length === 0) && (
                  <div className="text-slate-700 italic font-bold">Awaiting telemetry output...</div>
                )}
                {order.logs?.map((log: any, i: number) => (
                  <div key={i} className="flex gap-4 border-l border-slate-800 pl-4 hover:border-blue-500 transition-colors">
                    <span className="text-slate-600 shrink-0 font-bold">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                    <span className={cn(
                      "font-black tracking-tighter shrink-0",
                      log.level === 'ERROR' ? 'text-red-500' : 'text-blue-400'
                    )}>{log.source}:</span>
                    <span className="text-slate-200 leading-relaxed font-semibold">{log.message}</span>
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
