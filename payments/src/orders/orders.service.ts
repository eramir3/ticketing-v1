import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './schemas/order.schema';
import { Model } from 'mongoose';
import { OrderCancelledEvent, OrderCreatedEvent, OrderStatus } from '@er3tickets/common';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
  ) { }

  async create(data: OrderCreatedEvent['data']) {
    const order = await this.orderModel.create({
      _id: data.id,
      price: data.ticket.price,
      status: data.status,
      userId: data.userId,
      version: data.version,
    });
    return order
  }

  async cancel(data: OrderCancelledEvent['data']) {
    const order = await this.orderModel.findOne({ _id: data.id, version: data.version - 1 })
    if (!order) {
      throw new Error('Order not found');
    }
    if (order.status === OrderStatus.Complete) {
      return order
    }

    order.set({ status: OrderStatus.Cancelled })
    await order.save()
    return order
  }

  async findById(id: string) {
    const order = await this.orderModel.findById(id)
    return order
  }
}
