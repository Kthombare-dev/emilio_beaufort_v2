# Razorpay Integration Guide

## What I've Set Up

I've created a complete Razorpay integration for your e-commerce project with both frontend and backend components:

### Frontend Changes
- ✅ Updated `BagModal.tsx` with proper Razorpay integration
- ✅ Added backend order creation and payment verification
- ✅ Environment variable support for your Key ID

### Backend Changes
- ✅ Created `payments` module with controller and service
- ✅ Added order creation endpoint (`/api/payments/create-order`)
- ✅ Added payment verification endpoint (`/api/payments/verify`)
- ✅ Secure signature verification using your secret key

## Setup Instructions

### 1. Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database (keep your existing DATABASE_URL)
DATABASE_URL="your_existing_database_url"

# Razorpay Configuration - REPLACE WITH YOUR ACTUAL KEYS
RAZORPAY_KEY_ID=rzp_test_your_actual_key_id_here
RAZORPAY_SECRET_KEY=sk_test_your_actual_secret_key_here

# Other configurations
PORT=3001
```

### 2. Frontend Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
# Add this line to your existing .env.local
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_actual_key_id_here
```

### 3. Replace Placeholder Values

**Replace these placeholders with your actual Razorpay credentials:**

- `rzp_test_your_actual_key_id_here` → Your actual Key ID (starts with `rzp_test_`)
- `sk_test_your_actual_secret_key_here` → Your actual Secret Key (starts with `sk_test_`)

### 4. Start the Servers

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run start:dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## How It Works

1. **User clicks "Buy"** → Opens checkout form
2. **User fills form** → Name and phone number
3. **User selects "Razorpay"** → Clicks "Pay with Razorpay"
4. **Frontend calls backend** → Creates order via `/api/payments/create-order`
5. **Backend creates order** → Returns order ID to frontend
6. **Razorpay modal opens** → User completes payment
7. **Frontend verifies payment** → Calls `/api/payments/verify`
8. **Backend verifies signature** → Using your secret key
9. **Success** → Bag cleared, order confirmed

## Security Features

- ✅ **Key ID** used only in frontend (safe to expose)
- ✅ **Secret Key** used only in backend (secure)
- ✅ **Payment signature verification** prevents fraud
- ✅ **Server-side order creation** ensures data integrity

## Testing

Use these test card details:
- **Card Number**: 4111 1111 1111 1111
- **Expiry**: Any future date (e.g., 12/25)
- **CVV**: Any 3 digits (e.g., 123)
- **Name**: Any name

## Troubleshooting

### Common Issues:

1. **"Failed to create order"**
   - Check if backend server is running
   - Verify environment variables are set correctly

2. **"Payment verification failed"**
   - Ensure secret key is correct
   - Check if payment was actually completed

3. **Razorpay modal doesn't open**
   - Verify Key ID is correct
   - Check browser console for errors

### Debug Steps:

1. Check browser console for frontend errors
2. Check backend terminal for server errors
3. Verify environment variables are loaded correctly
4. Test with Razorpay test cards

## Next Steps

Once this is working, you can enhance it by:
- Adding order history
- Implementing webhooks for payment status updates
- Adding email confirmations
- Creating order management in admin panel

Let me know if you need help with any of these steps or encounter any issues! 