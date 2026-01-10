import mongoose from 'mongoose';
import { app, ticketModel } from '../../../../test/setup';
import { OrderStatus, Subjects } from '@er3tickets/common';
import { OrderCancelledConsumer } from '../order-cancelled-consumer';

let consumer: OrderCancelledConsumer;

beforeEach(() => {
  consumer = app.get(OrderCancelledConsumer); // uses mocked Kafka + real TicketsService
});

it('updates the ticket, publishes an event, and acks the message', async () => {
  // Create and save a ticket
  const ticket = ticketModel.build({
    title: 'concert',
    price: 99,
    userId: 'asdf',
  });
  await ticket.save();

  const orderId = new mongoose.Types.ObjectId().toHexString()
  await consumer.onMessage({
    offset: '0',
    partition: 0,
    subject: Subjects.OrderCancelled,
    value: {
      id: orderId,
      version: 0,
      ticket: {
        id: ticket.id,
      },
    },
  });

  const updatedTicket = await ticketModel.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(orderId);
});