"use client";
import { lazy, Suspense } from 'react';

const BagModal = lazy(() => import('./BagModal'));

interface LazyBagModalProps {
  open: boolean;
  onClose: () => void;
  onBuyNow: () => void;
}

export default function LazyBagModal(props: LazyBagModalProps) {
  if (!props.open) return null;
  
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <BagModal {...props} />
    </Suspense>
  );
}
