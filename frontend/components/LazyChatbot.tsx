"use client";
import { lazy, Suspense } from 'react';

const Chatbot = lazy(() => import('./Chatbot'));

export default function LazyChatbot() {
  return (
    <Suspense fallback={
      <div className="fixed bottom-4 right-4 w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
    }>
      <Chatbot />
    </Suspense>
  );
}
