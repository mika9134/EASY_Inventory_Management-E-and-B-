'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './index';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-99"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="fixed inset-0 flex items-center justify-center z-100 p-4 pointer-events-none">
            <motion.div
              className={`bg-white rounded-[20px] shadow-2xl w-full border border-gray-100 ${sizes[size]} pointer-events-auto overflow-hidden`}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-8 pt-8 pb-4">
                <h2 className="text-xl font-bold text-neutral-900 font-display">{title}</h2>
                <button 
                  onClick={onClose} 
                  className="p-1.5 rounded-full hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-8 pb-8 pt-2 max-h-[70vh] overflow-y-auto">
                {children}
              </div>
              {footer && (
                <div className="px-8 pb-8 pt-4 flex gap-3 justify-end">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isDangerous?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  onConfirm,
  onCancel,
  isDangerous = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={isDangerous ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-neutral-600 leading-relaxed">{message}</p>
    </Modal>
  );
}
