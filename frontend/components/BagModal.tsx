"use client";
import { useBag } from './BagContext';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Script from 'next/script';
import { Sheet, SheetContent, SheetClose } from './ui/sheet';
import PaymentModal from './PaymentModal';

export default function BagModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { bagItems, removeFromBag, clearBag, addToBag } = useBag();
  const [limitMessage, setLimitMessage] = useState('');
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [userData, setUserData] = useState({ name: '', phone: '', email: '' });
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);

  const handleLimit = (msg?: string) => {
    setLimitMessage(msg || "You've hit the limit for this item. To add more, please purchase the items in your bag first.");
    setShowLimitModal(true);
  };

  // Razorpay handler
  const handleRazorpay = async () => {
    try {
      const total = bagItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      
      console.log('Initializing Razorpay payment...');
      console.log('Total amount:', total);
      console.log('User data:', userData);
      
      // Check if we have a valid Razorpay key
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      console.log('Razorpay key:', razorpayKey);
      console.log('Environment check:', {
        hasKey: !!razorpayKey,
        keyLength: razorpayKey?.length,
        isTestKey: razorpayKey === 'rzp_test_YourTestKeyHere'
      });
      
      if (!razorpayKey || razorpayKey === 'rzp_test_YourTestKeyHere') {
        alert('Razorpay key not configured. Please add your actual Razorpay Key ID to the environment variables.\n\nCurrent key: ' + (razorpayKey || 'undefined'));
        return;
      }
      
      // Fetch real order from backend
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, currency: 'INR' })
      });
      const order = await res.json();
      console.log('Order from backend:', order);
      
      const options = {
        key: razorpayKey,
        amount: order.amount, // Use backend's amount (in paise)
        currency: order.currency, // Use backend's currency
        name: 'Emilio Beaufort',
        description: 'Order Payment',
        order_id: order.id, // Use backend's order id
        handler: function (response: any) {
          console.log('Payment successful:', response);
          alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
          clearBag();
          setShowPayment(false);
          setShowPaymentForm(false);
          onClose();
        },
        prefill: {
          name: userData.name,
          contact: userData.phone,
          email: userData.email
        },
        theme: {
          color: '#B7A16C'
        }
      };
      
      console.log('Razorpay options:', options);
      
      // Check if Razorpay is loaded
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        console.log('Razorpay is available, opening checkout...');
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        console.error('Razorpay not loaded');
        alert('Payment gateway not loaded. Please refresh the page and try again.');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('Failed to initialize payment. Please try again. Error: ' + errorMessage);
    }
  };

  const handleFormSubmit = (data: { name: string; phone: string; email: string }) => {
    console.log('BagModal: handleFormSubmit called with data:', data);
    setUserData(data);
    setShowPayment(true);
    setShowPaymentMethods(true);
  };

  return (
    <>
      {/* Razorpay script */}
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js" 
        strategy="afterInteractive"
        onLoad={() => console.log('Razorpay script loaded successfully')}
        onError={() => console.error('Failed to load Razorpay script')}
      />
      
      {/* Limit Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative animate-fadeIn text-center">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl font-bold"
              onClick={() => setShowLimitModal(false)}
              aria-label="Close popup"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-lg font-bold mb-4 text-premium">Bag Limit</h3>
            <div className="mb-6 text-premium-dark">You have hit the bag limit.<br />{limitMessage}</div>
            <button
              className="bg-premium text-white px-6 py-2 rounded-lg font-semibold hover:bg-premium-dark transition"
              onClick={() => setShowLimitModal(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal - Rendered at root level */}
      <PaymentModal
        isOpen={showPaymentForm}
        onClose={() => {
          setShowPaymentForm(false);
          setShowPayment(false);
          setShowPaymentMethods(false);
        }}
        onSubmit={handleFormSubmit}
        onRazorpay={handleRazorpay}
        showPaymentMethods={showPaymentMethods}
      />

      {/* Main Bag Modal */}
      {open && (
        <Sheet open={open} onOpenChange={v => { if (!v) onClose(); }}>
          <SheetContent side="right" className="p-0 max-w-lg w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-premium">My Bag</h2>
              {bagItems.length === 0 ? (
                <div className="text-gray-500 text-center py-8">Your bag is empty.</div>
              ) : (
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {bagItems.map(item => (
                    <div key={item.id} className="flex items-center gap-4 border-b pb-3">
                      <Image src={item.imageUrl} alt={item.name} width={60} height={60} className="rounded-lg object-cover" />
                      <div className="flex-1">
                        <div className="font-semibold text-premium-dark">{item.name}</div>
                        <div className="text-gray-600 text-sm">₹{item.price.toFixed(2)} x {item.quantity}</div>
                      </div>
                      <button
                        className="text-green-500 hover:text-green-700 text-sm font-bold px-2 border border-green-500 rounded-full ml-2"
                        onClick={() => addToBag(
                          { id: item.id, name: item.name, imageUrl: item.imageUrl, price: item.price },
                          handleLimit
                        )}
                        title="Add one more"
                      >
                        +
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700 text-sm font-bold px-2"
                        onClick={() => removeFromBag(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {bagItems.length > 0 && (
                <div className="mt-6 flex flex-col gap-2">
                  <div className="flex justify-between items-center w-full">
                    <span className="font-bold text-lg text-premium-dark">
                      Total: ₹{bagItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex gap-4 w-full">
                    <button
                      className="flex-1 px-8 py-2 rounded-lg font-bold text-lg"
                      style={{ background: '#000', color: '#fff', border: 'none', outline: 'none', boxShadow: 'none' }}
                      onClick={clearBag}
                    >
                      Clear Bag
                    </button>
                    <button
                      className="flex-1 px-8 py-2 rounded-lg font-bold text-lg"
                      style={{ background: '#000', color: '#fff', border: 'none', outline: 'none', boxShadow: 'none' }}
                      onClick={() => setShowPaymentForm(true)}
                    >
                      Buy
                    </button>
                  </div>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}
      
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.2s;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </>
  );
} 