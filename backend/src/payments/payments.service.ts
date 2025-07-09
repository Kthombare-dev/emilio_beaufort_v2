import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';

interface CreateOrderDto {
  amount: number;
  currency: string;
  items: any[];
  customerName: string;
  customerPhone: string;
}

interface VerifyPaymentDto {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

@Injectable()
export class PaymentsService {
  private readonly razorpay: Razorpay;
  private readonly razorpaySecret: string;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_SECRET!,
    });
    this.razorpaySecret = process.env.RAZORPAY_SECRET!;
  }

  async createOrder(createOrderDto: CreateOrderDto) {
    try {
      const options = {
        amount: Math.round(createOrderDto.amount * 100), // amount in paise
        currency: createOrderDto.currency || 'INR',
        receipt: `receipt_${Date.now()}`,
      };
      const order = await this.razorpay.orders.create(options);
      console.log('Razorpay order:', order);
      return order;
    } catch (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  async verifyPayment(verifyPaymentDto: VerifyPaymentDto) {
    try {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = verifyPaymentDto;
      const signatureString = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac('sha256', this.razorpaySecret)
        .update(signatureString)
        .digest('hex');
      if (expectedSignature === razorpay_signature) {
        return {
          verified: true,
          payment_id: razorpay_payment_id,
          order_id: razorpay_order_id,
        };
      } else {
        throw new Error('Invalid signature');
      }
    } catch (error) {
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }
} 