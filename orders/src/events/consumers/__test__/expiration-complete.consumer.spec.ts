// import mongoose from 'mongoose';
// import { Message } from 'node-nats-streaming';
// import { OrderStatus, ExpirationCompleteEvent } from '@rallycoding/common';
// import { ExpirationCompleteListener } from '../expiration-complete-listener';
// import { natsWrapper } from '../../../nats-wrapper';
// import { Order } from '../../../models/order';
// import { Ticket } from '../../../models/ticket';

import mongoose from 'mongoose';
import { ExpirationCompleteConsumer } from "../expiration-complete-consumer";
import { app, ticketModel, orderModel } from '../../../../test/setup';
import { OrderStatus, Subjects } from '@er3tickets/common';

let consumer: ExpirationCompleteConsumer;

beforeEach(() => {
  consumer = app.get(ExpirationCompleteConsumer); // uses mocked Kafka + real TicketsService
});

it('updates the order status to cancelled', async () => {

  const ticket = await ticketModel.create({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });

  const order = await orderModel.create({
    ticket: ticket.id,
    userId: 'asdfa',
    expiresAt: new Date(),
    status: OrderStatus.Created,
  });

  await consumer.onMessage({
    offset: '0',
    partition: 0,
    subject: Subjects.ExpirationComplete,
    value: {
      orderId: order.id
    },
  });
  const updatedOrder = await orderModel.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it.skip('emit an OrderCancelled event', async () => {
  // const { listener, order, data, msg } = await setup();

  // await listener.onMessage(data, msg);

  // expect(natsWrapper.client.publish).toHaveBeenCalled();

  // const eventData = JSON.parse(
  //   (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  // );
  // expect(eventData.id).toEqual(order.id);
});

