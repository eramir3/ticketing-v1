import { Injectable } from '@nestjs/common';
import { CreatePaymentInput } from './dto/create-payment.input';
import { OrdersService } from '../orders/orders.service';
import { BadRequestError, NotAuthorizedError, NotFoundError, OrderStatus } from '@er3tickets/common';
import { Request } from 'express';
import { stripe } from '../stripe';
import { Payment } from './schemas/payment.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PaymentCreatedProducer } from 'src/events/producers/payment-created-producer';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentsModel: Model<Payment>,
    private readonly ordersService: OrdersService,
    private readonly paymentCreated: PaymentCreatedProducer,
  ) { }

  async create(createPaymentInput: CreatePaymentInput, req: Request) {
    const { orderId } = createPaymentInput
    const order = await this.ordersService.findById(orderId)

    if (!order) {
      throw new NotFoundError()
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError()
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Cannot pay for a cancelled order')
    }

    const amount = order.price * 100;

    const intent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      payment_method_types: ["card"],
    });

    console.log({ intent })

    const payment = await this.paymentsModel.create({
      orderId,
      stripeId: intent.id,
    });

    this.paymentCreated.send([{
      value: {
        id: payment.id,
        orderId: payment.orderId,
        stripeId: payment.stripeId,
      }
    }])

    return createPaymentInput
  }

  findAll() {
    return `This action returns all payments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
