import { db } from '@/db';
import { inventoryItems } from '@/db/schema';
import InventoryList from '@/components/InventoryList';
import { Card } from '@/components/ui';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Package, TrendingUp } from 'lucide-react';
import { retryAsync } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  // Fetch all items with retry logic for local development resilience
  const items = await retryAsync(
    () => db.query.inventoryItems.findMany({
      orderBy: (items, { desc }) => [desc(items.createdAt)],
    }),
    3,
    500
  );

  // Calculate statistics
  const totalItems = items.length;
  const totalValue = items.reduce((sum, item) => {
    return sum + parseFloat(item.price) * item.stock;
  }, 0);

  return (
    <div className="min-h-screen flex">
      <main className="flex-1 p-8 lg:p-12 overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-10 px-4 md:px-8">
          
          {/* Client Header with Modals */}
          <DashboardHeader items={items} />

          {/* High Fidelity Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="relative overflow-hidden group border border-gray-200/50 shadow-soft bg-white p-6 rounded-[20px]">
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-1">Total Assets</p>
                  <p className="text-3xl font-bold text-neutral-800 font-display tracking-tight">
                    {totalItems} Pcs
                  </p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl transition-all duration-350 group-hover:bg-blue-600 group-hover:text-white">
                  <Package className="w-6 h-6" />
                </div>
              </div>
            </Card>

            <Card className="relative overflow-hidden group border border-gray-200/50 shadow-soft bg-white p-6 rounded-[20px]">
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-1">Valuation</p>
                  <p className="text-3xl font-bold text-neutral-800 font-display tracking-tight">
                    {totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
                  </p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl transition-all duration-350 group-hover:bg-blue-600 group-hover:text-white">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </Card>
          </div>

          {/* Listings Area */}
          <div className="space-y-8">
            <InventoryList initialItems={items} />
          </div>

        </div>
      </main>
    </div>
  );
}