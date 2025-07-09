# Razorpay Integration Setup

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/your_database"

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_SECRET_KEY=sk_test_your_secret_key_here

# Other configurations
PORT=3001
```

## Frontend Environment Variables

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
```

## Setup Steps

1. **Replace the placeholder values** with your actual Razorpay credentials:
   - `rzp_test_your_key_id_here` → Your actual Key ID
   - `sk_test_your_secret_key_here` → Your actual Secret Key

2. **Install backend dependencies** (if not already installed):
   ```bash
   cd backend
   npm install
   ```

3. **Start the backend server**:
   ```bash
   npm run start:dev
   ```

4. **Start the frontend**:
   ```bash
   cd ../frontend
   npm run dev
   ```

## How It Works

1. **Frontend**: When user clicks "Pay with Razorpay", it calls `/api/payments/create-order`
2. **Backend**: Creates a Razorpay order and returns order details
3. **Frontend**: Opens Razorpay checkout with the order ID
4. **User**: Completes payment on Razorpay
5. **Frontend**: Calls `/api/payments/verify` with payment details
6. **Backend**: Verifies the payment signature using your secret key
7. **Success**: Order is confirmed and bag is cleared

## Security Notes

- ✅ **Key ID** is safe to use in frontend
- ✅ **Secret Key** is only used in backend for verification
- ✅ Payment signatures are verified to prevent fraud
- ✅ All sensitive data is handled server-side

## Testing

Use Razorpay test cards for testing:
- Card Number: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: Any 3 digits
- Name: Any name 