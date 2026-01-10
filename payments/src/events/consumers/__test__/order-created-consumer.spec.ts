import mongoose from 'mongoose';
import { OrderCreatedEvent, OrderStatus } from '@er3tickets/common';
import { Subjects } from '@er3tickets/common';
import { OrderCreatedConsumer } from '../order-created-consumer';
import { app, orderModel } from '../../../../test/setup';

let consumer: OrderCreatedConsumer;

beforeEach(() => {
  consumer = app.get(OrderCreatedConsumer); // uses mocked Kafka + real TicketsService
});

it('replicates the order info', async () => {
  const orderData: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: 'alskdjf',
    userId: 'alskdjf',
    status: OrderStatus.Created,
    ticket: {
      id: 'alskdfj',
      price: 100,
    },
  };

  await consumer.onMessage({
    offset: '0',
    partition: 0,
    subject: Subjects.OrderCreated,
    value: orderData
  });

  const order = await orderModel.findById(orderData.id);

  expect(order!.price).toEqual(orderData.ticket.price);
});

it.skip('acks the message', async () => {
  // const { listener, data, msg } = await setup();

  // await listener.onMessage(data, msg);

  // expect(msg.ack).toHaveBeenCalled();
});
