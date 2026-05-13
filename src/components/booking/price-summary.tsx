"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface PriceItem {
  name: string;
  price: number;
  quantity?: number;
  type: "slot" | "vehicle" | "equipment";
}

interface PriceSummaryProps {
  items: PriceItem[];
  surgeMultiplier?: number;
}

export function PriceSummary({ items, surgeMultiplier = 1 }: PriceSummaryProps) {
  const baseSubtotal = items.reduce(
    (acc, item) => acc + item.price * (item.quantity || 1),
    0,
  );
  
  const subtotal = baseSubtotal * surgeMultiplier;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  return (
    <div className="bg-[#F8F9FA] rounded-lg border border-[#E5E7EB] overflow-hidden">
      <div className="p-4 border-b border-[#E5E7EB] bg-white">
        <h3 className="text-sm font-bold text-[#111827] uppercase tracking-wider">
          Price Summary
        </h3>
      </div>
      <div className="p-4 space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <span className="text-[#6B7280]">
              {item.name}{" "}
              {item.quantity && item.quantity > 1 ? `(x${item.quantity})` : ""}
            </span>
            <span className="font-medium text-[#111827]">
              ${(item.price * (item.quantity || 1)).toFixed(2)}
            </span>
          </div>
        ))}

        <div className="pt-3 border-t border-[#E5E7EB] space-y-2">
          {surgeMultiplier > 1 && (
            <div className="flex justify-between text-sm">
              <span className="text-amber-600 font-medium">Weekend Surge ({((surgeMultiplier - 1) * 100).toFixed(0)}%)</span>
              <span className="text-amber-600 font-medium">+${(baseSubtotal * (surgeMultiplier - 1)).toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex justify-between text-sm">
            <span className="text-[#6B7280]">Subtotal</span>
            <span className="font-medium text-[#111827]">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#6B7280]">Tax (10%)</span>
            <span className="font-medium text-[#111827]">
              ${tax.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-1">
            <span className="text-[#111827]">Total</span>
            <span className="text-[#2563EB]">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
