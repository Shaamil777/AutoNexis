"use client";

import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "@/lib/api";
import { PlusCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateOrderPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    amount: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // The backend expects amount as number and user as customerName
      const payload = {
        customerName: formData.customerName,
        email: formData.email,
        totalAmount: parseFloat(formData.amount)
      };
      
      const response = await axios.post(`${API_URL}/orders`, payload);
      alert("Order created successfully!");
      if (response.data && response.data.order && response.data.order.id) {
        router.push(`/orders/${response.data.order.id}`);
      } else {
        router.push("/orders");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to create order. See console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Initiate System Order</h1>
        <p className="text-sm font-medium text-slate-500 mt-1.5 uppercase tracking-wide">Trigger a new end-to-end processing workflow</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-10 transition-all hover:shadow-md">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="customerName" className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 px-1">
                Customer Identity
              </label>
              <input
                id="customerName"
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold text-slate-900 placeholder:text-slate-400 shadow-inner"
                placeholder="Full Name / Client Ref"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 px-1">
                Communication Path
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold text-slate-900 placeholder:text-slate-400 shadow-inner"
                placeholder="client@enterprise.com"
              />
            </div>

            <div>
              <label htmlFor="amount" className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 px-1">
                Transactional Volume (USD)
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-400 font-bold">$</span>
                </div>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold text-slate-900 placeholder:text-slate-400 shadow-inner tabular-nums"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3.5 text-sm font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:scale-100"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <PlusCircle className="w-5 h-5" />
              )}
              {isSubmitting ? "Processing Request" : "Dispatch Order"}
            </button>
          </div>
        </form>
      </div>
      
      <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest px-10 leading-loose grayscale hover:grayscale-0 transition-all duration-500">
        Dispatched orders are immediately indexed and processed by the asynchronous event engine &bull; System priority is auto-calculated based on volume
      </p>
    </div>
  );
}
