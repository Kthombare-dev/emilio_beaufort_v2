"use client";
import { lazy, Suspense } from 'react';

const OrderFormModal = lazy(() => import('./OrderFormModal'));

interface LazyOrderFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
}

export default function LazyOrderFormModal(props: LazyOrderFormModalProps) {
  if (!props.open) return null;
  
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600 text-center">Loading order form...</p>
        </div>
      </div>
    }>
      <OrderFormModal {...props} />
    </Suspense>
  );
}
