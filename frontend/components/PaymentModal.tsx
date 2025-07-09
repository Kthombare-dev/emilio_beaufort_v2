"use client";
import { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; phone: string; email: string }) => void;
  onRazorpay: () => void;
  showPaymentMethods: boolean;
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  onRazorpay, 
  showPaymentMethods 
}: PaymentModalProps) {
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'razorpay' | 'debit'>();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showRazorpayScanner, setShowRazorpayScanner] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted!');
    console.log('Form data:', { userName, userPhone, userEmail, selectedMethod });
    
    if (!userName.trim() || !userPhone.trim() || !userEmail.trim()) {
      console.log('Validation failed: missing fields');
      setFormError('Please fill in all required fields.');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      console.log('Validation failed: invalid email');
      setFormError('Please enter a valid email address.');
      return;
    }
    
    // Validate phone number (exactly 10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(userPhone)) {
      console.log('Validation failed: invalid phone');
      setFormError('Please enter a valid 10-digit phone number.');
      return;
    }
    
    // Validate payment method selection
    if (!selectedMethod) {
      console.log('Validation failed: no payment method selected');
      setFormError('Please select a payment method.');
      return;
    }
    
    console.log('Form validation passed, processing payment');
    setFormError('');
    
    // Process payment based on selected method
    if (selectedMethod === 'razorpay') {
      setShowRazorpayScanner(true);
      onRazorpay();
    } else {
      setFormError('Debit Card payment coming soon.');
    }
  };

  const handleClose = () => {
    setUserName('');
    setUserPhone('');
    setUserEmail('');
    setFormError('');
    setSelectedMethod(undefined);
    setShowDropdown(false);
    setShowRazorpayScanner(false);
    onClose();
  };

  const handleContinuePayment = () => {
    if (!selectedMethod) {
      setFormError('Please select a payment method.');
      return;
    }
    
    if (selectedMethod === 'razorpay') {
      setShowRazorpayScanner(true);
      onRazorpay();
    } else {
      setFormError('Debit Card payment coming soon.');
    }
  };

  console.log('PaymentModal render - isOpen:', isOpen);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40" 
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={() => setShowDropdown(false)}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 relative animate-fadeIn" 
        style={{ zIndex: 999999 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl font-bold z-10"
          onClick={handleClose}
          aria-label="Close popup"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex">
                      {/* Left Side - QR Scanner */}
            <div className="w-1/2 bg-gray-50 p-8 rounded-l-2xl flex flex-col items-center justify-center">
              {showRazorpayScanner ? (
                <div className="text-center">
                  <div className="w-48 h-48 bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mb-4">
                    <div className="text-center">
                      <div className="text-4xl mb-2">💳</div>
                      <div className="text-sm text-gray-500">Razorpay</div>
                      <div className="text-xs text-gray-400 mt-1">Processing payment</div>
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-premium mb-2">Payment Processing</h4>
                  <p className="text-sm text-gray-600">Razorpay checkout will open shortly</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-48 h-48 bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mb-4">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📱</div>
                      <div className="text-sm text-gray-500">QR Scanner</div>
                      <div className="text-xs text-gray-400 mt-1">Scan to pay</div>
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-premium mb-2">Scan QR Code</h4>
                  <p className="text-sm text-gray-600">Use any UPI app to scan and pay</p>
                </div>
              )}
            </div>
          
          {/* Right Side - Form */}
          <div className="w-1/2 p-8">
            <h3 className="text-xl font-bold mb-6 text-premium">Checkout Details</h3>
                            <form onSubmit={handleFormSubmit} className="space-y-4" id="payment-form">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                                    <input
                      type="text"
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-premium focus:border-transparent"
                      value={userName}
                      onChange={(e) => {
                        console.log('Name changed:', e.target.value);
                        setUserName(e.target.value);
                      }}
                      required
                    />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="Enter 10-digit number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-premium focus:border-transparent"
                  value={userPhone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setUserPhone(value);
                  }}
                  maxLength={10}
                  required
                />
                <div className="text-xs text-gray-500 mt-1">Only numbers allowed, max 10 digits</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-premium focus:border-transparent"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  required
                />
              </div>
              
              {/* Payment Method Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-premium focus:border-transparent bg-white flex items-center justify-between"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <span className={selectedMethod ? 'text-gray-900' : 'text-gray-500'}>
                      {selectedMethod === 'razorpay' ? 'Razorpay' : 
                       selectedMethod === 'debit' ? 'Debit Card' : 
                       'Select payment method'}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                      <button
                        type="button"
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 first:rounded-t-lg last:rounded-b-lg last:border-b-0"
                        onClick={() => {
                          setSelectedMethod('razorpay');
                          setShowDropdown(false);
                        }}
                      >
                        Razorpay
                      </button>
                      <button
                        type="button"
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 first:rounded-t-lg last:rounded-b-lg last:border-b-0"
                        onClick={() => {
                          setSelectedMethod('debit');
                          setShowDropdown(false);
                        }}
                      >
                        Debit Card
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {formError && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                  {formError}
                </div>
              )}
              
              <button
                type="submit"
                form="payment-form"
                className="w-full bg-premium text-white py-3 rounded-lg font-semibold mt-4 hover:bg-premium-dark transition-colors"
                onClick={() => console.log('Submit button clicked')}
              >
                Continue Payment
              </button>
              
              {/* Test button */}
              <button
                type="button"
                className="w-full bg-gray-500 text-white py-2 rounded-lg mt-2"
                onClick={() => {
                  console.log('Test button clicked');
                  setUserName('Test User');
                  setUserPhone('1234567890');
                  setUserEmail('test@example.com');
                  setSelectedMethod('razorpay');
                }}
              >
                Fill Test Data
              </button>
                        </form>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.2s;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
} 