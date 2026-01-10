import mongoose from 'mongoose';
import { OrderCreatedConsumer } from "../order-created-consumer";
import { app, ticketModel } from '../../../../test/setup';
import { OrderStatus, Subjects } from '@er3tickets/common';

let consumer: OrderCreatedConsumer;

beforeEach(() => {
  consumer = app.get(OrderCreatedConsumer); // uses mocked Kafka + real TicketsService
});

it('sets the userId of the ticket', async () => {
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
    subject: Subjects.OrderCreated,
    value: {
      id: orderId,
      version: 0,
      status: OrderStatus.Created,
      userId: 'alskdfj',
      expiresAt: 'alskdjf',
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    },
  });

  const updatedTicket = await ticketModel.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(orderId);
});

it.skip('publishes a ticket updated event', async () => {
  // const { listener, ticket, data, msg } = await setup();

  // await listener.onMessage(data, msg);

  // expect(natsWrapper.client.publish).toHaveBeenCalled();

  // const ticketUpdatedData = JSON.parse(
  //   (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  // );

  // expect(data.id).toEqual(ticketUpdatedData.orderId);
});