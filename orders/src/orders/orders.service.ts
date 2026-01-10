import { Injectable } from '@nestjs/common';
import { CreateOrderInput } from './dto/create-order.input';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestError, ExpirationCompleteEvent, NotAuthorizedError, NotFoundError, OrderStatus } from '@er3tickets/common';
import { Order } from './schemas/order.schema';
import { TicketsService } from '../tickets/tickets.service';
import { Request } from 'express';
import { OrderCreatedProducer } from '../events/producers/order-created-producer';
import { OrderCancelledProducer } from '../events/producers/order-cancelled-producer';

const EXPIRATION_WINDOW_SECONDS = 1 * 10;

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
    private readonly ticketsService: TicketsService,
    private readonly orderCreatedProducer: OrderCreatedProducer,
    private readonly orderCancelledProducer: OrderCancelledProducer,
  ) { }

  async create(createOrderInput: CreateOrderInput, req: Request) {
    const { ticketId } = createOrderInput;

    // Find the ticket the user is trying to order in the database
    const ticket = await this.ticketsService.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    // Make sure that this ticket is not already reserved
    const isReserved = await this.ticketsService.isReserved(ticket.id);
    if (isReserved) {
      throw new BadRequestError('Ticket is already reserved')
    }

    // Calculate an expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build the order and save it to the database
    const order = await this.orderModel.create({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket: ticket.id
    })

    // Publish an event saying that an order was created
    await this.orderCreatedProducer.send([{
      value: {
        id: order.id,
        version: order.version,
        status: order.status,
        userId: order.userId,
        expiresAt: order.expiresAt.toISOString(),
        ticket: {
          id: ticket.id,
          price: ticket.price,
        },
      }
    }])

    return order
  }

  async findAll(req: Request) {
    const orders = await this.orderModel.find({
      userId: req.currentUser!.id,
    }).populate('ticket');

    return orders;
  }

  async findOne(id: string, req: Request) {
    const order = await this.orderModel.findById(id).populate('ticket');

    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    return order
  }

  async cancel(id: string, req: Request) {
    const order = await this.orderModel.findById(id).populate('ticket');

    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    order.status = OrderStatus.Cancelled;
    await order.save();

    await this.orderCancelledProducer.send([{
      value: {
        id: order.id,
        version: order.version,
        ticket: {
          id: order.ticket.id.toString(),
        },
      }
    }])

    return order
  }

  async expire(data: ExpirationCompleteEvent['data']) {
    const order = await this.orderModel.findById(data.orderId).populate('ticket');

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({
      status: OrderStatus.Cancelled,
    });

    await order.save();
    await this.orderCancelledProducer.send([{
      value: {
        id: order.id,
        version: order.version,
        ticket: {
          id: order.ticket.id.toString(),
        },
      }
    }])
  }
}
