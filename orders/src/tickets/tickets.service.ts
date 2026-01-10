import { Injectable } from '@nestjs/common';
import { UpdateTicketInput } from './dto/update-ticket.input';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundError, OrderStatus, PaymentCreatedEvent, TicketCreatedEvent } from '@er3tickets/common';
import { Order } from '../orders/schemas/order.schema';
import { Ticket } from './schemas/ticket.schema';

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<Ticket>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
  ) { }

  async create(data: TicketCreatedEvent['data']) {
    const ticket = await this.ticketModel.create({
      ...data, _id: data.id,
    })
    return ticket
  }

  async findById(ticketId: string): Promise<Ticket> {
    const ticket = await this.ticketModel.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }
    return ticket;
  }

  async isReserved(ticketId: string): Promise<boolean> {
    const existingOrder = await this.orderModel.findOne({
      ticket: ticketId,
      status: {
        $in: [
          OrderStatus.Created,
          OrderStatus.AwaitingPayment,
          OrderStatus.Complete,
        ],
      },
    });

    return !!existingOrder;
  }

  async update(updateTicketInput: UpdateTicketInput) {
    const ticket = await this.findByEvent(updateTicketInput)

    if (!ticket) {
      throw new Error('Ticket not found')
    }
    const { title, price, version } = updateTicketInput;
    ticket.set({ title, price, version });
    await ticket.save()

    return ticket
  }

  async findByEvent(event: { id: string, version: number }) {
    return await this.ticketModel.findOne({
      _id: event.id,
      version: event.version - 1
    })
  }

  async paymentCreated(data: PaymentCreatedEvent['data']) {
    const order = await this.orderModel.findById(data.orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({
      status: OrderStatus.Complete,
    });
    await order.save();
  }
}
