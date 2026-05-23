'use client';

import React, { useState } from 'react';
import {
  Package2,
  Boxes,
  TrendingUp,
} from 'lucide-react';

import { Button } from './ui';
import { StockModals } from './StockModals';
import { InventoryItem } from '@/db/schema';

interface DashboardHeaderProps {
  items: InventoryItem[];
}

export function DashboardHeader({ items }: DashboardHeaderProps) {
  const [isStockInOpen, setIsStockInOpen] = useState(false);
  const [isStockOutOpen, setIsStockOutOpen] = useState(false);

  const totalItems = items.length;

  const totalStock = items.reduce(
    (acc, item) => acc + Number(item.stock || 0),
    0
  );

  return (
    <>
      <header className="relative overflow-hidden rounded-[32px] border border-primary/10 bg-gradient-to-br from-primary via-primary to-primary/80 p-8 md:p-10 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.25)]">
        
        {/* Background Glow */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-52 h-52 bg-white/5 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          
          {/* Left Side */}
          <div className="max-w-2xl">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur text-white/90 text-sm font-medium mb-6">
              <Package2 className="w-4 h-4" />
              Smart Inventory Dashboard
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-black text-white leading-[1] tracking-tight">
              Inventory
              <br />
              <span className="text-white/60">
                Management
              </span>
            </h1>

            {/* Description */}
            <p className="mt-5 text-base md:text-lg text-white/70 max-w-xl leading-relaxed">
              Manage products, monitor stock levels, and organize your inventory system with a modern dashboard experience.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 mt-8">
              
              <div className="bg-white/10 border border-white/10 backdrop-blur rounded-2xl px-5 py-4 min-w-[150px]">
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <Boxes className="w-4 h-4" />
                  Total Products
                </div>

                <h3 className="text-3xl font-bold text-white mt-2">
                  {totalItems}
                </h3>
              </div>

              <div className="bg-white/10 border border-white/10 backdrop-blur rounded-2xl px-5 py-4 min-w-[150px]">
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  Total Stock
                </div>

                <h3 className="text-3xl font-bold text-white mt-2">
                  {totalStock}
                </h3>
              </div>
            </div>
          </div>

          {/* Stock action buttons removed for cleaner UI */}
        </div>
      </header>

      <StockModals
        items={items}
        isOpenIn={isStockInOpen}
        isOpenOut={isStockOutOpen}
        onCloseIn={() => setIsStockInOpen(false)}
        onCloseOut={() => setIsStockOutOpen(false)}
      />
    </>
  );
}