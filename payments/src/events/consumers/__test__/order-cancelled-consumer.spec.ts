import mongoose from 'mongoose';
import { OrderCancelledEvent, OrderStatus } from '@er3tickets/common';
import { Subjects } from '@er3tickets/common';
import { app, orderModel } from '../../../../test/setup';
import { OrderCancelledConsumer } from '../order-cancelled-consumer';

let consumer: OrderCancelledConsumer;

beforeEach(() => {
  consumer = app.get(OrderCancelledConsumer); // uses mocked Kafka + real TicketsService
});

it('updates the status of the order', async () => {
  const order = orderModel.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 10,
    userId: 'asldkfj',
    version: 0,
  });
  await order.save();


  const orderData: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 1,
    ticket: {
      id: 'alskdfj',
    },
  };

  await consumer.onMessage({
    offset: '0',
    partition: 0,
    subject: Subjects.OrderCancelled,
    value: orderData
  });

  const updatedOrder = await orderModel.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it.skip('acks the message', async () => {
  // const { listener, data, msg } = await setup();

  // await listener.onMessage(data, msg);

  // expect(msg.ack).toHaveBeenCalled();
});
