'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Search, Package, ArrowRight, Save, X } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button, Input, Select, Badge, Card } from './ui';
import InventoryForm from './InventoryForm';
import { InventoryItem } from '@/db/schema';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';


interface StockModalsProps {
  items: InventoryItem[];
  isOpenIn: boolean;
  isOpenOut: boolean;
  onCloseIn: () => void;
  onCloseOut: () => void;
}

export function StockModals({ items, isOpenIn, isOpenOut, onCloseIn, onCloseOut }: StockModalsProps) {
  const router = useRouter();

  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = React.useTransition();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter(item => 
    (item.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (item.category?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const handleStockAction = async (type: 'IN' | 'OUT') => {
    if (!selectedItemId || !amount || parseFloat(amount) <= 0) {
      toast.error('Please select an item and enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const item = items.find(i => i.id.toString() === selectedItemId);
      if (!item) throw new Error('Item not found');

      const currentStock = Number(item.stock);
      const change = parseFloat(amount);
      const newStock = type === 'IN' ? currentStock + change : currentStock - change;

      if (newStock < 0) {
        toast.error('Insufficient stock for this operation');
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('name', item.name);
      formData.append('category', item.category || 'Other');
      formData.append('price', item.price.toString());
      formData.append('stock', newStock.toString());
      formData.append('description', item.description || '');

      const response = await fetch(`/api/items/${item.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to update stock');

      toast.success(`Stock successfully ${type === 'IN' ? 'added' : 'deducted'}`);
      
      startTransition(() => {
        router.refresh();
      });

      if (type === 'IN') onCloseIn();
      else onCloseOut();
      
      // Reset
      setSelectedItemId('');
      setAmount('');
      setSearchQuery('');
    } catch (error) {
      toast.error('System synchronization failed');
    } finally {
      setIsSubmitting(false);
    }
  };


return (
    <>
      {/* Stock In Modal - Now handles New Registration */}
      <Modal 
        isOpen={isOpenIn} 
        onClose={onCloseIn} 
        title="New Registration"
        size="lg"
      >
        <div className="space-y-6">
          <div className="flex bg-neutral-100/80 p-1 rounded-xl">
            {/* New Registration Only */}
            <InventoryForm onSuccess={() => { onCloseIn(); router.refresh(); }} onCancel={onCloseIn} />
          </div>
        </div>
      </Modal>

      {/* Stock Out Modal */}
      <Modal 
        isOpen={isOpenOut} 
        onClose={onCloseOut} 
        title="Stock Depletion"
        size="lg"
      >
        <div className="space-y-6">
          <p className="text-neutral-500 text-sm">Select an existing asset to authorize stock removal.</p>
          
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              placeholder="Locate asset..."
              className="w-full pl-11 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary/10 transition-all outline-none text-sm text-neutral-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-2 no-scrollbar">
            {filteredItems.map(item => (
              <button 
                key={item.id}
                onClick={() => setSelectedItemId(item.id.toString())}
                className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${selectedItemId === item.id.toString() ? 'border-red-500 bg-red-50/50 ring-1 ring-red-500' : 'border-neutral-100 hover:bg-neutral-50'}`}
              >
                <div>
                  <p className="font-semibold text-neutral-800 text-sm">{item.name}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{item.category} • Current Stock: {item.stock}</p>
                </div>
                {selectedItemId === item.id.toString() && <Badge variant="danger" className="rounded-lg">Targeted</Badge>}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-neutral-100 space-y-4">
            <Input 
              label="Quantity to Deduct"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Button 
              variant="danger"
              className="w-full h-12"
              onClick={() => handleStockAction('OUT')}
              isLoading={isSubmitting}
            >
              Remove from Stock
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}