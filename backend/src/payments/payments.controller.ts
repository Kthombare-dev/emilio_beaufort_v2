import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service';

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

@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-order')
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    try {
      const order = await this.paymentsService.createOrder(createOrderDto);
      return order;
    } catch (error) {
      throw new HttpException(
        error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('verify')
  async verifyPayment(@Body() verifyPaymentDto: VerifyPaymentDto) {
    try {
      const result = await this.paymentsService.verifyPayment(verifyPaymentDto);
      return result;
    } catch (error) {
      throw new HttpException(
        error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
} 