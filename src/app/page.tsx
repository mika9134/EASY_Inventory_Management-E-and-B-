import { db } from '@/db';
import { inventoryItems } from '@/db/schema';
import InventoryList from '@/components/InventoryList';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Package, TrendingUp } from 'lucide-react';
import { retryAsync } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const items = await retryAsync(
    () => db.query.inventoryItems.findMany({
      orderBy: (items, { desc }) => [desc(items.createdAt)],
    }),
    3,
    500
  );

  const totalItems = items.length;
  const totalValue = items.reduce((sum, item) => sum + parseFloat(item.price) * item.stock, 0);

  return (
    <div className="min-h-screen bg-white py-16 px-6 md:px-12">
      <main className="max-w-5xl mx-auto space-y-16">
        
        <DashboardHeader items={items} />

        {/* Minimalist Stats: No Cards, just typography and iconography */}
        <section className="flex flex-col md:flex-row gap-12 border-t border-b border-slate-100 py-10">
          <div className="flex items-center gap-4">
            <div className="text-indigo-600 bg-indigo-50 p-3 rounded-full">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Inventory</p>
              <p className="text-2xl font-bold text-slate-900">{totalItems} Assets Tracked</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-emerald-600 bg-emerald-50 p-3 rounded-full">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Value</p>
              <p className="text-2xl font-bold text-slate-900">
                {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(totalValue)} 
                <span className="text-slate-400 text-lg ml-1 font-normal">ETB</span>
              </p>
            </div>
          </div>
        </section>

        {/* Listings Area */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Current Stock</h2>
          <InventoryList initialItems={items} />
        </section>

      </main>
    </div>
  );
}